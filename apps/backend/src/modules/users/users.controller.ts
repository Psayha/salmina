/**
 * @file users.controller.ts
 * @description HTTP request handlers for user operations
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Request, Response, NextFunction } from 'express';
import { userService } from './users.service.js';
import { UpdateUserProfileInput, UpdateUserRoleInput, UserIdParam } from './users.validation.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { BadRequestError } from '../../common/errors/AppError.js';
import { logger } from '../../utils/logger.js';

/**
 * User Controller
 * Handles HTTP requests for user endpoints
 */
export class UserController {
  /**
   * GET /api/users/me
   * Get current user profile
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   * @param next - Express next function
   */
  async getCurrentUserProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }

      const userId = req.user.userId;

      logger.info(`Get current user profile request: ${userId}`);

      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User profile retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/me
   * Update current user profile
   *
   * @param req - Express request with authenticated user and validated body
   * @param res - Express response
   * @param next - Express next function
   */
  async updateCurrentUserProfile(
    req: Request<unknown, unknown, UpdateUserProfileInput> & AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }

      const userId = req.user.userId;
      const updateData = req.body;

      logger.info(`Update current user profile request: ${userId}`);

      const updatedUser = await userService.updateUserProfile(userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/me/accept-terms
   * Accept legal terms for current user
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   * @param next - Express next function
   */
  async acceptTerms(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }

      const userId = req.user.userId;

      logger.info(`Accept terms request: ${userId}`);

      const result = await userService.acceptTerms(userId);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Terms accepted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users
   * Get all users with pagination and filters (admin only)
   *
   * @param req - Express request with query parameters
   * @param res - Express response
   * @param next - Express next function
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page: pageParam, limit: limitParam, role, isActive, hasAcceptedTerms, search } = req.query as any;

      // Parse and validate pagination parameters with defaults
      const page = pageParam ? parseInt(pageParam, 10) : 1;
      const limit = limitParam ? parseInt(limitParam, 10) : 20;

      logger.info(`Get all users request: page=${page}, limit=${limit}`);

      const result = await userService.getAllUsers({ page, limit }, { role, isActive, hasAcceptedTerms, search });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Users retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID (admin only)
   *
   * @param req - Express request with user ID param
   * @param res - Express response
   * @param next - Express next function
   */
  async getUserById(req: Request<UserIdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.info(`Get user by ID request: ${id}`);

      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/role
   * Update user role (admin only)
   *
   * @param req - Express request with user ID param and validated body
   * @param res - Express response
   * @param next - Express next function
   */
  async updateUserRole(
    req: Request<UserIdParam, unknown, UpdateUserRoleInput> & AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }

      const { id } = req.params;
      const { role } = req.body;

      // Prevent admin from changing their own role
      if (id === req.user.userId) {
        logger.warn(`Admin attempted to change own role: ${id}`);
        throw new BadRequestError('Cannot change your own role');
      }

      logger.info(`Update user role request: ${id} -> ${role}`);

      const updatedUser = await userService.updateUserRole(id, role);

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User role updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Deactivate user account (admin only)
   *
   * @param req - Express request with user ID param
   * @param res - Express response
   * @param next - Express next function
   */
  async deactivateUser(req: Request<UserIdParam> & AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }

      const { id } = req.params;

      // Prevent admin from deactivating themselves
      if (id === req.user.userId) {
        logger.warn(`Admin attempted to deactivate own account: ${id}`);
        throw new BadRequestError('Cannot deactivate your own account');
      }

      logger.info(`Deactivate user request: ${id}`);

      const deactivatedUser = await userService.deactivateUser(id);

      res.status(200).json({
        success: true,
        data: deactivatedUser,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/:id/reactivate
   * Reactivate user account (admin only)
   *
   * @param req - Express request with user ID param
   * @param res - Express response
   * @param next - Express next function
   */
  async reactivateUser(req: Request<UserIdParam>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.info(`Reactivate user request: ${id}`);

      const reactivatedUser = await userService.reactivateUser(id);

      res.status(200).json({
        success: true,
        data: reactivatedUser,
        message: 'User reactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const userController = new UserController();
