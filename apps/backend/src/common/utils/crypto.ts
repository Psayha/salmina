/**
 * @file crypto.ts
 * @description Cryptographic utility functions
 * @author AI Assistant
 * @created 2024-11-13
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  telegramId: string;
  role: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS || 10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '15m',
  } as any);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as any);
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
}

/**
 * Generate random token
 */
export function generateRandomToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate numeric code (for 2FA)
 */
export function generateNumericCode(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Validate Telegram initData
 * Based on: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return false;
    }

    urlParams.delete('hash');

    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Calculate hash
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(calculatedHash, 'hex'),
        Buffer.from(hash, 'hex')
      );
    } catch {
      // If buffers have different lengths, they're not equal
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Parse Telegram initData
 */
export interface TelegramInitDataParsed {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

export function parseTelegramInitData(initData: string): TelegramInitDataParsed | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const result: TelegramInitDataParsed = {
      auth_date: parseInt(urlParams.get('auth_date') || '0', 10),
      hash: urlParams.get('hash') || '',
    };

    const userParam = urlParams.get('user');
    if (userParam) {
      result.user = JSON.parse(userParam);
    }

    const queryId = urlParams.get('query_id');
    if (queryId) {
      result.query_id = queryId;
    }

    const startParam = urlParams.get('start_param');
    if (startParam) {
      result.start_param = startParam;
    }

    return result;
  } catch (error) {
    return null;
  }
}

/**
 * Generate HMAC signature for webhooks
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
