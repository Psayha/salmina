/**
 * @file user.ts
 * @description User and authentication related types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * User role enumeration
 * Defines available user roles in the system
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * User entity type
 * Represents a user in the system with Telegram authentication
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  /** Telegram user ID (unique) */
  telegramId: bigint;
  /** Telegram username (optional) */
  username?: string | null;
  /** User's first name */
  firstName: string;
  /** User's last name (optional) */
  lastName?: string | null;
  /** Telegram profile photo URL (optional) */
  photoUrl?: string | null;
  /** User's phone number (optional) */
  phone?: string | null;
  /** User's email address (optional) */
  email?: string | null;
  /** User's role in the system */
  role: UserRole;
  /** Whether the user account is active */
  isActive: boolean;
  /** Whether the user has accepted terms and conditions */
  hasAcceptedTerms: boolean;
  /** Timestamp when terms were accepted (optional) */
  termsAcceptedAt?: Date | null;
  /** User creation timestamp */
  createdAt: Date;
  /** User last update timestamp */
  updatedAt: Date;
}

/**
 * Create User DTO (Data Transfer Object)
 * Used for creating new user accounts
 */
export interface CreateUserDTO {
  /** Telegram user ID */
  telegramId: bigint;
  /** Telegram username (optional) */
  username?: string;
  /** User's first name */
  firstName: string;
  /** User's last name (optional) */
  lastName?: string;
  /** Telegram profile photo URL (optional) */
  photoUrl?: string;
  /** User's phone number (optional) */
  phone?: string;
  /** User's email address (optional) */
  email?: string;
  /** User's role (defaults to USER) */
  role?: UserRole;
}

/**
 * Update User DTO (Data Transfer Object)
 * Used for updating existing user data
 */
export interface UpdateUserDTO {
  /** User's first name (optional) */
  firstName?: string;
  /** User's last name (optional) */
  lastName?: string;
  /** User's phone number (optional) */
  phone?: string;
  /** User's email address (optional) */
  email?: string;
  /** User's role (optional, admin only) */
  role?: UserRole;
  /** Whether the user account is active (optional, admin only) */
  isActive?: boolean;
  /** Whether the user has accepted terms (optional) */
  hasAcceptedTerms?: boolean;
  /** Telegram profile photo URL (optional) */
  photoUrl?: string;
}

/**
 * User profile response type
 * Public user information for API responses
 */
export interface UserProfile {
  /** Unique user identifier */
  id: string;
  /** Telegram user ID */
  telegramId: bigint;
  /** Telegram username */
  username?: string | null;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName?: string | null;
  /** Telegram profile photo URL */
  photoUrl?: string | null;
  /** User's phone number */
  phone?: string | null;
  /** User's email address */
  email?: string | null;
  /** User's role */
  role: UserRole;
  /** User creation timestamp */
  createdAt: Date;
  /** User last update timestamp */
  updatedAt: Date;
}
