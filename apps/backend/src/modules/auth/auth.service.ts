/**
 * @file auth.service.ts
 * @description Authentication service with business logic
 * @author AI Assistant
 * @created 2024-11-13
 */

import { prisma } from '../../database/prisma.service.js';
import { redis } from '../../database/redis.service.js';
import { User, UserRole } from './auth.types.js';
import {
  validateTelegramInitData,
  parseTelegramInitData,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  JWTPayload,
} from '../../common/utils/crypto.js';
import { env } from '../../config/env.js';
import { UnauthorizedError, ErrorCode, BadRequestError } from '../../common/errors/AppError.js';
import { AuthResponse, RefreshResponse, toUserData, TokenPayload } from './auth.types.js';
import { logger } from '../../utils/logger.js';
import { telegramService } from '../../services/telegram.service.js';

/**
 * Redis key prefixes
 */
const REDIS_KEYS = {
  REFRESH_TOKEN: (userId: string) => `auth:refresh_token:${userId}`,
  USER_TOKENS: (userId: string) => `auth:user_tokens:${userId}`,
} as const;

/**
 * Refresh token TTL (7 days in seconds)
 */
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

/**
 * Authentication Service
 * Handles authentication business logic with Clean Architecture principles
 */
export class AuthService {
  /**
   * Authenticate user with Telegram initData
   * Validates the initData, creates or updates user, and returns tokens
   *
   * @param initData - Telegram Mini App initData string
   * @returns Authentication response with tokens and user data
   * @throws {UnauthorizedError} If initData validation fails
   * @throws {BadRequestError} If initData parsing fails
   */
  async authenticateWithTelegram(initData: string): Promise<AuthResponse> {
    // Validate Telegram initData signature
    const isValid = validateTelegramInitData(initData, env.TELEGRAM_BOT_TOKEN);

    if (!isValid) {
      logger.warn('Telegram authentication failed: invalid initData signature');
      throw new UnauthorizedError('Invalid Telegram authentication data', ErrorCode.TELEGRAM_AUTH_FAILED);
    }

    // Parse initData to extract user information
    const parsedData = parseTelegramInitData(initData);

    if (!parsedData || !parsedData.user) {
      logger.warn('Telegram authentication failed: unable to parse user data');
      throw new BadRequestError('Unable to parse Telegram user data');
    }

    const { user: telegramUser } = parsedData;

    // Check if auth_date is not too old (prevent replay attacks)
    const authDate = parsedData.auth_date;
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 86400; // 24 hours

    if (currentTime - authDate > maxAge) {
      logger.warn('Telegram authentication failed: auth_date too old');
      throw new UnauthorizedError('Authentication data expired', ErrorCode.TOKEN_EXPIRED);
    }

    // Find or create user
    const user = await this.findOrCreateUser(telegramUser);

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Inactive user attempted to login: ${user.id}`);
      throw new UnauthorizedError('User account is disabled', ErrorCode.FORBIDDEN);
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Store refresh token in Redis
    await this.storeRefreshToken(user.id, refreshToken);

    logger.info(`User authenticated successfully: ${user.id} (Telegram ID: ${user.telegramId})`);

    return {
      accessToken,
      refreshToken,
      user: toUserData(user),
    };
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - JWT refresh token
   * @returns New access token and user data
   * @throws {UnauthorizedError} If refresh token is invalid or expired
   */
  async refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
    // Verify refresh token
    let payload: JWTPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      logger.warn('Refresh token verification failed');
      throw new UnauthorizedError('Invalid or expired refresh token', ErrorCode.INVALID_TOKEN);
    }

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(REDIS_KEYS.REFRESH_TOKEN(payload.userId));
    if (!storedToken || storedToken !== refreshToken) {
      logger.warn(`Refresh token not found in Redis for user: ${payload.userId}`);
      throw new UnauthorizedError('Refresh token has been revoked', ErrorCode.INVALID_TOKEN);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      logger.warn(`User not found during token refresh: ${payload.userId}`);
      throw new UnauthorizedError('User not found', ErrorCode.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Inactive user attempted to refresh token: ${user.id}`);
      throw new UnauthorizedError('User account is disabled', ErrorCode.FORBIDDEN);
    }

    // Generate new access token
    const tokenPayload: TokenPayload = {
      userId: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);

    logger.info(`Access token refreshed for user: ${user.id}`);

    return {
      accessToken,
      user: toUserData(user),
    };
  }

  /**
   * Logout user by invalidating refresh token
   *
   * @param userId - User ID
   * @returns Success status
   */
  async logout(userId: string): Promise<{ success: boolean }> {
    // Delete refresh token from Redis
    await redis.del(REDIS_KEYS.REFRESH_TOKEN(userId));

    logger.info(`User logged out: ${userId}`);

    return { success: true };
  }

  /**
   * Verify and decode JWT access token
   *
   * @param token - JWT access token
   * @returns Decoded token payload
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const payload = verifyAccessToken(token);

      // Optionally verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedError('User not found', ErrorCode.UNAUTHORIZED);
      }

      if (!user.isActive) {
        throw new UnauthorizedError('User account is disabled', ErrorCode.FORBIDDEN);
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.warn('Access token verification failed');
      throw new UnauthorizedError('Invalid or expired token', ErrorCode.INVALID_TOKEN);
    }
  }

  /**
   * Find existing user or create new one from Telegram data
   *
   * @param telegramUser - Telegram user data
   * @returns User from database
   * @private
   */
  private async findOrCreateUser(telegramUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  }): Promise<User> {
    const telegramId = BigInt(telegramUser.id);

    // Check if this is an admin user
    const isAdmin = env.ADMIN_TELEGRAM_IDS.includes(telegramUser.id.toString());
    const role = isAdmin ? UserRole.ADMIN : UserRole.USER;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { telegramId } });
    const isNewUser = !existingUser;

    // Find or create user
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        username: telegramUser.username || null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        photoUrl: telegramUser.photo_url || null,
        role, // Update role in case it changed
        updatedAt: new Date(),
      },
      create: {
        telegramId,
        username: telegramUser.username || null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        photoUrl: telegramUser.photo_url || null,
        role,
        isActive: true,
      },
    });

    logger.info(`User ${isNewUser ? 'created' : 'updated'}: ${user.id} (Telegram ID: ${telegramId})`);

    // Send welcome message to new users
    if (isNewUser) {
      try {
        await telegramService.sendWelcomeMessage(telegramUser.id, telegramUser.first_name);
      } catch (error) {
        logger.error('Failed to send welcome message:', error);
        // Don't fail auth if welcome message fails
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }

  /**
   * Generate access and refresh tokens for user
   *
   * @param user - User from database
   * @returns Access and refresh tokens
   * @private
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      userId: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * Store refresh token in Redis with TTL
   *
   * @param userId - User ID
   * @param refreshToken - JWT refresh token
   * @private
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = REDIS_KEYS.REFRESH_TOKEN(userId);
    await redis.set(key, refreshToken, REFRESH_TOKEN_TTL);
    logger.debug(`Refresh token stored in Redis for user: ${userId}`);
  }

  /**
   * Revoke all refresh tokens for a user
   * Useful for security purposes (e.g., password change, suspicious activity)
   *
   * @param userId - User ID
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await redis.del(REDIS_KEYS.REFRESH_TOKEN(userId));
    logger.info(`All tokens revoked for user: ${userId}`);
  }

  /**
   * Get user by ID
   * Helper method for getting current user info
   *
   * @param userId - User ID
   * @returns User data
   * @throws {NotFoundError} If user not found
   */
  async getUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found', ErrorCode.UNAUTHORIZED);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}

// Export singleton instance
export const authService = new AuthService();
