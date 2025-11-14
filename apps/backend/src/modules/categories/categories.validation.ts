/**
 * @file categories.validation.ts
 * @description Validation schemas for categories module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { z } from 'zod';

/**
 * Create category schema
 */
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
    description: z.string().max(500, 'Description too long').optional(),
    parentId: z.string().uuid('Invalid parent ID').optional(),
    order: z.number().int().min(0).optional(),
    image: z.string().url('Invalid image URL').optional(),
    showOnHome: z.boolean().optional(),
    homeOrder: z.number().int().min(0).optional(),
  }),
});

/**
 * Update category schema
 */
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    description: z.string().max(500).optional().nullable(),
    parentId: z.string().uuid().optional().nullable(),
    order: z.number().int().min(0).optional(),
    image: z.string().url().optional().nullable(),
    showOnHome: z.boolean().optional(),
    homeOrder: z.number().int().min(0).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Get category by slug schema
 */
export const getCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

/**
 * Delete category schema
 */
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
