/**
 * @file errorHandler.ts
 * @description Global error handling middleware
 * @author AI Assistant
 * @updated 2024-11-13
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ErrorCode, InternalError, ValidationError } from '../common/errors/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  let error: AppError;

  // Handle known AppError instances
  if (err instanceof AppError) {
    error = err;
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    error = new ValidationError('Validation failed', details);
  }
  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, ErrorCode.INVALID_TOKEN);
  } else if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, ErrorCode.TOKEN_EXPIRED);
  }
  // Unknown error
  else {
    error = new InternalError(err.message);
  }

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.userId,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  // Send error response
  const response: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
    },
  };

  if (error.details) {
    response.error.details = error.details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return new AppError(`${field} already exists`, 409, ErrorCode.ALREADY_EXISTS);

    case 'P2025':
      // Record not found
      return new AppError('Record not found', 404, ErrorCode.NOT_FOUND);

    case 'P2003':
      // Foreign key constraint failed
      return new AppError('Related record not found', 400, ErrorCode.INVALID_INPUT);

    case 'P2014':
      // Required relation violation
      return new AppError('Invalid relation', 400, ErrorCode.INVALID_INPUT);

    default:
      return new InternalError('Database error', { code: error.code });
  }
}

