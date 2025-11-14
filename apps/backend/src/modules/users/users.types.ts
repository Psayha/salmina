/**
 * @file users.types.ts
 * @description User module type definitions
 * @author AI Assistant
 * @created 2024-11-13
 */

import { User, UserRole } from '@prisma/client';

/**
 * User data returned to client (sanitized)
 */
export interface UserDTO {
  id: string;
  telegramId: string;
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
 * Update user profile data
 */
export interface UpdateUserProfileDTO {
  phone?: string | null;
  email?: string | null;
}

/**
 * Update user role data (admin only)
 */
export interface UpdateUserRoleDTO {
  role: UserRole;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * User list filters
 */
export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  hasAcceptedTerms?: boolean;
  search?: string; // Search by username, firstName, lastName, phone, email
}

/**
 * Paginated user list response
 */
export interface PaginatedUsersResponse {
  users: UserDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Accept terms response
 */
export interface AcceptTermsResponse {
  success: boolean;
  termsAcceptedAt: Date;
}

/**
 * Convert Prisma User to UserDTO
 * Sanitizes user data by removing sensitive information
 *
 * @param user - Prisma User object
 * @returns Sanitized user data
 */
export function toUserDTO(user: User): UserDTO {
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
    termsAcceptedAt: user.termsAcceptedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Convert array of Users to UserDTOs
 *
 * @param users - Array of Prisma User objects
 * @returns Array of sanitized user data
 */
export function toUserDTOList(users: User[]): UserDTO[] {
  return users.map(toUserDTO);
}
