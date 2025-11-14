/**
 * @file users.routes.ts
 * @description Express routes for user operations
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Router } from 'express';
import { userController } from './users.controller';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../common/middleware/validation.middleware';
import {
  updateUserProfileSchema,
  updateUserRoleSchema,
  getAllUsersQuerySchema,
  userIdParamSchema,
} from './users.validation';

/**
 * Create user routes
 *
 * @returns Express Router with user routes
 */
export function createUserRoutes(): Router {
  const router = Router();

  // ==================== Current User Routes ====================

  /**
   * GET /api/users/me
   * Get current user profile
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "id": "uuid",
   *     "telegramId": "123456789",
   *     "username": "john_doe",
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "photoUrl": "https://...",
   *     "phone": "+1234567890",
   *     "email": "john@example.com",
   *     "role": "USER",
   *     "isActive": true,
   *     "hasAcceptedTerms": true,
   *     "termsAcceptedAt": "2024-11-13T...",
   *     "createdAt": "2024-11-13T...",
   *     "updatedAt": "2024-11-13T..."
   *   },
   *   "message": "User profile retrieved successfully"
   * }
   */
  router.get(
    '/me',
    authenticate,
    userController.getCurrentUserProfile.bind(userController),
  );

  /**
   * PATCH /api/users/me
   * Update current user profile
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * Request body:
   * {
   *   "phone": "+1234567890",  // optional
   *   "email": "john@example.com"  // optional
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "data": { ... },  // Updated user object
   *   "message": "User profile updated successfully"
   * }
   */
  router.patch(
    '/me',
    authenticate,
    validateBody(updateUserProfileSchema),
    userController.updateCurrentUserProfile.bind(userController),
  );

  /**
   * POST /api/users/me/accept-terms
   * Accept legal terms for current user
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "success": true,
   *     "termsAcceptedAt": "2024-11-13T..."
   *   },
   *   "message": "Terms accepted successfully"
   * }
   */
  router.post(
    '/me/accept-terms',
    authenticate,
    userController.acceptTerms.bind(userController),
  );

  // ==================== Admin Routes ====================

  /**
   * GET /api/users
   * Get all users with pagination and filters (admin only)
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * Query parameters:
   * - page: number (default: 1)
   * - limit: number (default: 20, max: 100)
   * - role: "USER" | "ADMIN" (optional)
   * - isActive: boolean (optional)
   * - hasAcceptedTerms: boolean (optional)
   * - search: string (optional) - Search by username, name, phone, email
   *
   * Example: /api/users?page=1&limit=20&role=USER&isActive=true&search=john
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "users": [
   *       { ... },  // User objects
   *       { ... }
   *     ],
   *     "pagination": {
   *       "page": 1,
   *       "limit": 20,
   *       "total": 100,
   *       "totalPages": 5
   *     }
   *   },
   *   "message": "Users retrieved successfully"
   * }
   */
  router.get(
    '/',
    authenticate,
    requireAdmin,
    validateQuery(getAllUsersQuerySchema),
    userController.getAllUsers.bind(userController),
  );

  /**
   * GET /api/users/:id
   * Get user by ID (admin only)
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * URL parameters:
   * - id: UUID
   *
   * Response:
   * {
   *   "success": true,
   *   "data": { ... },  // User object
   *   "message": "User retrieved successfully"
   * }
   */
  router.get(
    '/:id',
    authenticate,
    requireAdmin,
    validateParams(userIdParamSchema),
    userController.getUserById.bind(userController),
  );

  /**
   * PATCH /api/users/:id/role
   * Update user role (admin only)
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * URL parameters:
   * - id: UUID
   *
   * Request body:
   * {
   *   "role": "USER" | "ADMIN"
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "data": { ... },  // Updated user object
   *   "message": "User role updated successfully"
   * }
   */
  router.patch(
    '/:id/role',
    authenticate,
    requireAdmin,
    validateParams(userIdParamSchema),
    validateBody(updateUserRoleSchema),
    userController.updateUserRole.bind(userController),
  );

  /**
   * DELETE /api/users/:id
   * Deactivate user account (admin only)
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * URL parameters:
   * - id: UUID
   *
   * Response:
   * {
   *   "success": true,
   *   "data": { ... },  // Deactivated user object
   *   "message": "User deactivated successfully"
   * }
   */
  router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    validateParams(userIdParamSchema),
    userController.deactivateUser.bind(userController),
  );

  /**
   * POST /api/users/:id/reactivate
   * Reactivate user account (admin only)
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * URL parameters:
   * - id: UUID
   *
   * Response:
   * {
   *   "success": true,
   *   "data": { ... },  // Reactivated user object
   *   "message": "User reactivated successfully"
   * }
   */
  router.post(
    '/:id/reactivate',
    authenticate,
    requireAdmin,
    validateParams(userIdParamSchema),
    userController.reactivateUser.bind(userController),
  );

  return router;
}

/**
 * Export configured router
 */
export const userRoutes = createUserRoutes();
