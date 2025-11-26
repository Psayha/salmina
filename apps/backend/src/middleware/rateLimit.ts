/**
 * @file rateLimit.ts
 * @description Rate limiting middleware to protect against DDoS and brute force attacks
 * @author AI Assistant
 * @created 2024-11-25
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Applies to all API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Store in memory (for production, consider using Redis)
  // store: new RedisStore({ client: redis })
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Payment endpoints rate limiter
 * Prevents payment spam and fraudulent activities
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: {
    success: false,
    message: 'Too many payment attempts, please contact support if you need assistance.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create order rate limiter
 * Prevents order spam
 */
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 orders per hour
  message: {
    success: false,
    message: 'Too many orders created, please wait before creating more.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
