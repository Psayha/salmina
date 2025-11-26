/**
 * @file sanitize.ts
 * @description Input sanitization middleware to prevent XSS attacks
 * @author AI Assistant
 * @created 2024-11-25
 */

import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Recursively sanitize input to prevent XSS attacks
 */
const sanitizeInput = (input: any): any => {
  // Handle strings - remove XSS
  if (typeof input === 'string') {
    return xss(input);
  }

  // Handle arrays - sanitize each element
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  // Handle objects - sanitize each property
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  // Return primitives as-is (numbers, booleans, null, undefined)
  return input;
};

/**
 * Middleware to sanitize request body
 * Apply to routes that accept user-generated content
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = (req: Request, _res: Response, next: NextFunction) => {
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  next();
};

/**
 * Middleware to sanitize route parameters
 */
export const sanitizeParams = (req: Request, _res: Response, next: NextFunction) => {
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

/**
 * Combined middleware to sanitize all inputs
 */
export const sanitizeAll = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {req.body = sanitizeInput(req.body);}
  if (req.query) {req.query = sanitizeInput(req.query);}
  if (req.params) {req.params = sanitizeInput(req.params);}
  next();
};
