/**
 * @file express.ts
 * @description TypeScript type definitions for Express request handlers
 * @author AI Assistant
 * @created 2024-11-25
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Extended Express Request with typed body, params, and query
 * @template TBody - Type for request body
 * @template TParams - Type for route parameters
 * @template TQuery - Type for query parameters
 */
export interface TypedRequest<
  TBody = any,
  TParams = Record<string, string>,
  TQuery = Record<string, string | undefined>
> extends Omit<Request, 'body' | 'params' | 'query'> {
  body: TBody;
  params: TParams;
  query: TQuery;
  user?: {
    id: string;
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    isActive: boolean;
  };
}

/**
 * Async request handler with proper error handling
 * Automatically catches errors and passes them to Express error middleware
 */
export type AsyncHandler<
  TBody = any,
  TParams = any,
  TQuery = any
> = (
  req: TypedRequest<TBody, TParams, TQuery>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

/**
 * Validation schemas for a route
 * Can include body, params, and query schemas
 */
export interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Wraps an async request handler to catch errors automatically
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = <TBody = any, TParams = any, TQuery = any>(
  fn: AsyncHandler<TBody, TParams, TQuery>,
): AsyncHandler<TBody, TParams, TQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Creates a validation middleware from Zod schemas
 * Validates request body, params, and query against provided schemas
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
