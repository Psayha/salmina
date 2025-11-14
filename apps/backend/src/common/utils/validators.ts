/**
 * @file validators.ts
 * @description Common validation utilities
 * @author AI Assistant
 * @created 2024-11-13
 */

import { z } from 'zod';

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email format');

/**
 * Phone validation schema (Russian format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[78][-\s]?\(?[0-9]{3}\)?[-\s]?[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{2}$/, 'Invalid phone number');

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('asc');

/**
 * Search query schema
 */
export const searchSchema = z.object({
  query: z.string().min(1).max(200).optional(),
  sortBy: z.string().optional(),
  order: sortOrderSchema,
  ...paginationSchema.shape,
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

/**
 * Validate UUID
 */
export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}

/**
 * Validate email
 */
export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/**
 * Validate phone
 */
export function isValidPhone(value: string): boolean {
  return phoneSchema.safeParse(value).success;
}

/**
 * Sanitize string (remove dangerous characters)
 */
export function sanitizeString(value: string): string {
  return value.replace(/[<>'"]/g, '');
}

/**
 * Normalize phone number (remove spaces, dashes, parentheses)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[-\s()]/g, '');
}

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}

/**
 * Slug validation and generation
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Validate price (positive decimal)
 */
export const priceSchema = z.number().positive('Price must be positive').max(999999.99, 'Price too high');

/**
 * Validate quantity (non-negative integer)
 */
export const quantitySchema = z.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative');

/**
 * Validate article/SKU (alphanumeric with dashes)
 */
export const articleSchema = z.string().regex(/^[A-Z0-9-]+$/, 'Invalid article format (use uppercase, numbers, dashes)');

/**
 * Validate promocode (uppercase letters and numbers only)
 */
export const promocodeSchema = z
  .string()
  .min(4, 'Promocode must be at least 4 characters')
  .max(20, 'Promocode must be at most 20 characters')
  .regex(/^[A-Z0-9]+$/, 'Promocode must contain only uppercase letters and numbers');
