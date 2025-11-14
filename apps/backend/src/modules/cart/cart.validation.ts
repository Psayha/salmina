/**
 * @file cart.validation.ts
 * @description Validation schemas for cart module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { z } from 'zod';

/**
 * Add to cart schema
 */
export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity too large'),
  }),
});

/**
 * Update cart item schema
 */
export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity too large'),
  }),
});

/**
 * Remove cart item schema
 */
export const removeCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
});

/**
 * Apply promocode schema
 */
export const applyPromocodeSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(4, 'Promocode too short')
      .max(20, 'Promocode too long')
      .regex(/^[A-Z0-9]+$/, 'Invalid promocode format'),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
export type ApplyPromocodeInput = z.infer<typeof applyPromocodeSchema>['body'];
