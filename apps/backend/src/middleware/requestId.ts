/**
 * @file requestId.ts
 * @description Middleware for request ID tracking and correlation
 * @author AI Assistant
 * @created 2024-11-25
 */

import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Adds a unique request ID to each request for tracing
 * The ID can be provided by client or auto-generated
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use client-provided ID or generate new one
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();

  // Store in request headers for access in handlers
  req.headers['x-request-id'] = requestId;

  // Return in response headers for client-side correlation
  res.setHeader('x-request-id', requestId);

  next();
};

/**
 * Helper to get request ID from request
 */
export const getRequestId = (req: Request): string => {
  return req.headers['x-request-id'] as string;
};
