/**
 * @file auth.middleware.ts
 * @description Authentication and authorization middleware
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { verifyAccessToken, JWTPayload } from '../utils/crypto';
import { UserRole } from '@prisma/client';

/**
 * Extended Request interface with user data
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authenticate user via JWT token
 */
export const authenticate = (req: AuthRequest, __res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

/**
 * Optional authentication (user data if token provided)
 */
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');

      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        if (token) {
          const payload = verifyAccessToken(token);
          req.user = payload;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Authorize user by role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const requireAdmin = authorize(UserRole.ADMIN);

/**
 * Check if user owns the resource
 */
export const requireOwnership = (getUserIdFromParams: (req: AuthRequest) => string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const resourceUserId = getUserIdFromParams(req);
    const currentUserId = req.user.userId;

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check ownership
    if (resourceUserId !== currentUserId) {
      throw new ForbiddenError('You can only access your own resources');
    }

    next();
  };
};
