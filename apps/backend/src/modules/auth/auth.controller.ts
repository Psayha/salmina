/**
 * @file auth.controller.ts
 * @description HTTP request handlers for authentication
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { TelegramAuthInput, RefreshTokenInput } from './auth.validation';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { toUserData } from './auth.types';
import { logger } from '../../utils/logger.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */
export class AuthController {
  /**
   * POST /api/auth/telegram
   * Authenticate with Telegram initData
   *
   * @param req - Express request with validated body
   * @param res - Express response
   * @param next - Express next function
   */
  async authenticateWithTelegram(
    req: Request<unknown, unknown, TelegramAuthInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { initData } = req.body;

      logger.info('Telegram authentication request received');

      const result = await authService.authenticateWithTelegram(initData);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Authentication successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   *
   * @param req - Express request with validated body
   * @param res - Express response
   * @param next - Express next function
   */
  async refreshAccessToken(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      logger.info('Token refresh request received');

      const result = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (requires authentication)
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   * @param next - Express next function
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const userId = req.user.userId;

      logger.info(`Logout request for user: ${userId}`);

      const result = await authService.logout(userId);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user info (requires authentication)
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   * @param next - Express next function
   */
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const userId = req.user.userId;

      logger.info(`Get current user request: ${userId}`);

      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: toUserData(user),
        message: 'User data retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify
   * Verify access token (useful for frontend token validation)
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'No authorization header provided',
        });
        return;
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({
          success: false,
          message: 'Invalid authorization header format',
        });
        return;
      }

      const token = parts[1];

      logger.info('Token verification request received');

      const payload = await authService.verifyToken(token);

      res.status(200).json({
        success: true,
        data: {
          valid: true,
          payload,
        },
        message: 'Token is valid',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
