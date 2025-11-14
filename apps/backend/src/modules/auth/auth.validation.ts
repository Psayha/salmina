/**
 * @file auth.validation.ts
 * @description Zod validation schemas for authentication
 * @author AI Assistant
 * @created 2024-11-13
 */

import { z } from 'zod';

/**
 * Telegram authentication schema
 * Validates the initData string from Telegram Mini App
 */
export const telegramAuthSchema = z.object({
  body: z.object({
    initData: z
      .string()
      .min(1, 'initData is required')
      .refine((data) => {
        // Check if initData contains required parameters
        const params = new URLSearchParams(data);
        return params.has('hash') && params.has('auth_date');
      }, 'Invalid initData format'),
  }),
});

/**
 * Refresh token schema
 * Validates refresh token request
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

/**
 * Logout schema
 * No body required, user ID is extracted from JWT
 */
export const logoutSchema = z.object({
  body: z.object({}).optional(),
});

/**
 * Type exports for TypeScript
 */
export type TelegramAuthInput = z.infer<typeof telegramAuthSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
