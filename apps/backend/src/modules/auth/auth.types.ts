/**
 * @file auth.types.ts
 * @description Authentication module type definitions
 * @author AI Assistant
 * @created 2024-11-13
 */

import { UserRole } from '@prisma/client';

// Re-export UserRole for convenience
export { UserRole };

export interface User {
  id: string;
  telegramId: bigint;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  hasAcceptedTerms: boolean;
  termsAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Authentication response with tokens
 */
export interface AuthResponse {
  /**
   * JWT access token (short-lived)
   */
  accessToken: string;

  /**
   * JWT refresh token (long-lived)
   */
  refreshToken: string;

  /**
   * User data
   */
  user: UserData;
}

/**
 * Token refresh response
 */
export interface RefreshResponse {
  /**
   * New JWT access token
   */
  accessToken: string;

  /**
   * User data
   */
  user: UserData;
}

/**
 * User data returned to client
 */
export interface UserData {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  hasAcceptedTerms: boolean;
  createdAt: Date;
}

/**
 * Convert Prisma User to UserData
 */
export function toUserData(user: User): UserData {
  return {
    id: user.id,
    telegramId: user.telegramId.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    phone: user.phone,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    hasAcceptedTerms: user.hasAcceptedTerms,
    createdAt: user.createdAt,
  };
}

/**
 * Telegram user data from initData
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

/**
 * JWT token payload
 */
export interface TokenPayload {
  userId: string;
  telegramId: string;
  role: string;
}
