/**
 * @file users.validation.ts
 * @description Zod validation schemas for user operations
 * @author AI Assistant
 * @created 2024-11-13
 */

import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Update user profile schema
 * Validates profile update data (phone, email)
 */
export const updateUserProfileSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .nullable(),
});

/**
 * Accept terms schema
 * No body required, acceptance is implicit by calling the endpoint
 */
export const acceptTermsSchema = z.object({}).optional();

/**
 * Update user role schema (admin only)
 * Validates role update data
 */
export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid role. Must be USER or ADMIN' }),
  }),
});

/**
 * Get all users query parameters schema
 * Validates pagination and filter parameters
 */
export const getAllUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  role: z
    .enum([UserRole.USER, UserRole.ADMIN])
    .optional(),
  isActive: z
    .string()
    .optional()
    .transform((val: string | undefined): boolean | undefined => {
      if (!val) return undefined;
      return val === 'true';
    }),
  hasAcceptedTerms: z
    .string()
    .optional()
    .transform((val: string | undefined): boolean | undefined => {
      if (!val) return undefined;
      return val === 'true';
    }),
  search: z
    .string()
    .min(1)
    .max(100)
    .optional(),
});

/**
 * User ID parameter schema
 * Validates UUID format for user ID in URL params
 */
export const userIdParamSchema = z.object({
  id: z
    .string()
    .uuid('Invalid user ID format'),
});

/**
 * Type exports for TypeScript
 */
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetAllUsersQuery = z.infer<typeof getAllUsersQuerySchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
