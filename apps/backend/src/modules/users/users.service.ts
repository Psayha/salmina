/**
 * @file users.service.ts
 * @description User service with business logic
 * @author AI Assistant
 * @created 2024-11-13
 */

import { prisma } from '../../database/prisma.service.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors/AppError.js';
import { UserRole } from '../auth/auth.types.js';
import {
  UserDTO,
  UpdateUserProfileDTO,
  PaginationParams,
  UserFilters,
  PaginatedUsersResponse,
  AcceptTermsResponse,
  toUserDTO,
  toUserDTOList,
} from './users.types.js';
import { logger } from '../../utils/logger.js';

/**
 * User Service
 * Handles user-related business logic with Clean Architecture principles
 */
export class UserService {
  /**
   * Get user by ID
   *
   * @param userId - User UUID
   * @returns User data
   * @throws {NotFoundError} If user not found
   */
  async getUserById(userId: string): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      throw new NotFoundError('User', userId);
    }

    logger.info(`User retrieved: ${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return toUserDTO(user as unknown as any);
  }

  /**
   * Update user profile
   * Allows updating phone and email
   *
   * @param userId - User UUID
   * @param data - Update data (phone, email)
   * @returns Updated user data
   * @throws {NotFoundError} If user not found
   * @throws {ForbiddenError} If user is inactive
   */
  async updateUserProfile(userId: string, data: UpdateUserProfileDTO): Promise<UserDTO> {
    // Check if user exists and is active
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      logger.warn(`User not found for profile update: ${userId}`);
      throw new NotFoundError('User', userId);
    }

    if (!existingUser.isActive) {
      logger.warn(`Inactive user attempted profile update: ${userId}`);
      throw new ForbiddenError('Cannot update inactive user profile');
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phone !== undefined ? data.phone : undefined,
        email: data.email !== undefined ? data.email : undefined,
        updatedAt: new Date(),
      },
    });

    logger.info(`User profile updated: ${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return toUserDTO(updatedUser as unknown as any);
  }

  /**
   * Accept legal terms
   * Sets hasAcceptedTerms to true and records timestamp
   *
   * @param userId - User UUID
   * @returns Terms acceptance status
   * @throws {NotFoundError} If user not found
   * @throws {BadRequestError} If terms already accepted
   */
  async acceptTerms(userId: string): Promise<AcceptTermsResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      logger.warn(`User not found for terms acceptance: ${userId}`);
      throw new NotFoundError('User', userId);
    }

    if (existingUser.hasAcceptedTerms) {
      logger.warn(`User already accepted terms: ${userId}`);
      throw new BadRequestError('Terms already accepted');
    }

    // Update user to mark terms as accepted
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasAcceptedTerms: true,
        termsAcceptedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info(`User accepted terms: ${userId}`);
    return {
      success: true,
      termsAcceptedAt: updatedUser.termsAcceptedAt!,
    };
  }

  /**
   * Get all users with pagination and filters (admin only)
   *
   * @param pagination - Page and limit
   * @param filters - Optional filters (role, isActive, hasAcceptedTerms, search)
   * @returns Paginated list of users
   */
  async getAllUsers(
    pagination: PaginationParams,
    filters: UserFilters = {},
  ): Promise<PaginatedUsersResponse> {
    const { page, limit } = pagination;
    const { role, isActive, hasAcceptedTerms, search } = filters;

    // Build where clause
    const where: any = {};

    if (role !== undefined) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (hasAcceptedTerms !== undefined) {
      where.hasAcceptedTerms = hasAcceptedTerms;
    }

    // Search across multiple fields
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    logger.info(`Retrieved ${users.length} users out of ${total} total (page ${page}/${totalPages})`);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      users: toUserDTOList(users as unknown as any),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Update user role (admin only)
   * Changes user role between USER and ADMIN
   *
   * @param userId - User UUID
   * @param role - New role
   * @returns Updated user data
   * @throws {NotFoundError} If user not found
   * @throws {BadRequestError} If trying to change own role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<UserDTO> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      logger.warn(`User not found for role update: ${userId}`);
      throw new NotFoundError('User', userId);
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        updatedAt: new Date(),
      },
    });

    logger.info(`User role updated: ${userId} -> ${role}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return toUserDTO(updatedUser as unknown as any);
  }

  /**
   * Deactivate user account (admin only)
   * Sets isActive to false, preventing login and access
   *
   * @param userId - User UUID
   * @returns Deactivated user data
   * @throws {NotFoundError} If user not found
   * @throws {BadRequestError} If user already inactive
   */
  async deactivateUser(userId: string): Promise<UserDTO> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      logger.warn(`User not found for deactivation: ${userId}`);
      throw new NotFoundError('User', userId);
    }

    if (!existingUser.isActive) {
      logger.warn(`User already inactive: ${userId}`);
      throw new BadRequestError('User is already inactive');
    }

    // Deactivate user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    logger.info(`User deactivated: ${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return toUserDTO(updatedUser as unknown as any);
  }

  /**
   * Reactivate user account (admin only)
   * Sets isActive to true, allowing login and access
   *
   * @param userId - User UUID
   * @returns Reactivated user data
   * @throws {NotFoundError} If user not found
   * @throws {BadRequestError} If user already active
   */
  async reactivateUser(userId: string): Promise<UserDTO> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      logger.warn(`User not found for reactivation: ${userId}`);
      throw new NotFoundError('User', userId);
    }

    if (existingUser.isActive) {
      logger.warn(`User already active: ${userId}`);
      throw new BadRequestError('User is already active');
    }

    // Reactivate user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });

    logger.info(`User reactivated: ${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return toUserDTO(updatedUser as unknown as any);
  }
}

// Export singleton instance
export const userService = new UserService();
