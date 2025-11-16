/**
 * @file auth.routes.ts
 * @description Express routes for authentication
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '../../common/middleware/validation.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { telegramAuthSchema, refreshTokenSchema } from './auth.validation';

/**
 * Create authentication routes
 *
 * @returns Express Router with auth routes
 */
export function createAuthRoutes(): Router {
  const router = Router();

  /**
   * POST /api/auth/telegram
   * Authenticate with Telegram initData
   *
   * Request body:
   * {
   *   "initData": "query_id=xxx&user=xxx&auth_date=xxx&hash=xxx"
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "accessToken": "jwt_access_token",
   *     "refreshToken": "jwt_refresh_token",
   *     "user": { ... }
   *   },
   *   "message": "Authentication successful"
   * }
   */
  router.post(
    '/telegram',
    validateBody(telegramAuthSchema.shape.body),
    authController.authenticateWithTelegram.bind(authController),
  );

  /**
   * POST /api/auth/refresh
   * Refresh access token
   *
   * Request body:
   * {
   *   "refreshToken": "jwt_refresh_token"
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "accessToken": "new_jwt_access_token",
   *     "user": { ... }
   *   },
   *   "message": "Token refreshed successfully"
   * }
   */
  router.post(
    '/refresh',
    validateBody(refreshTokenSchema.shape.body),
    authController.refreshAccessToken.bind(authController),
  );

  /**
   * POST /api/auth/logout
   * Logout user (requires authentication)
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "success": true
   *   },
   *   "message": "Logout successful"
   * }
   */
  router.post(
    '/logout',
    authenticate,
    authController.logout.bind(authController),
  );

  /**
   * GET /api/auth/me
   * Get current user info (requires authentication)
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
   *     "phone": null,
   *     "email": null,
   *     "role": "USER",
   *     "isActive": true,
   *     "hasAcceptedTerms": false,
   *     "createdAt": "2024-11-13T..."
   *   },
   *   "message": "User data retrieved successfully"
   * }
   */
  router.get(
    '/me',
    authenticate,
    authController.getCurrentUser.bind(authController),
  );

  /**
   * POST /api/auth/verify
   * Verify access token (optional authentication check)
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "valid": true,
   *     "payload": {
   *       "userId": "uuid",
   *       "telegramId": "123456789",
   *       "role": "USER"
   *     }
   *   },
   *   "message": "Token is valid"
   * }
   */
  router.post(
    '/verify',
    authController.verifyToken.bind(authController),
  );

  return router;
}

/**
 * Export configured router
 */
export const authRoutes = createAuthRoutes();
