/**
 * @file products.validation.ts
 * @description Zod validation schemas for products
 * @author AI Assistant
 * @created 2024-11-13
 */

import { z } from 'zod';
import {
  uuidSchema,
  paginationSchema,
  sortOrderSchema,
  articleSchema,
} from '../../common/utils/validators.js';

/**
 * Product sort by options
 */
export const productSortBySchema = z.enum(['price', 'popular', 'new', 'name']).default('new');

/**
 * Product filters schema
 */
export const productFiltersSchema = z.object({
  categoryId: uuidSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  lowStock: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  isHit: z.coerce.boolean().optional(),
  isDiscount: z.coerce.boolean().optional(),
  hasPromotion: z.coerce.boolean().optional(),
});

/**
 * Get products list query schema
 */
export const getProductsQuerySchema = z.object({
  query: z.object({
    ...paginationSchema.shape,
    sortBy: productSortBySchema,
    order: sortOrderSchema,
    ...productFiltersSchema.shape,
  }),
});

/**
 * Search products query schema
 */
export const searchProductsQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1).max(200).optional(),
    ...paginationSchema.shape,
    sortBy: productSortBySchema,
    order: sortOrderSchema,
    ...productFiltersSchema.shape,
  }),
});

/**
 * Get product by slug params schema
 */
export const getProductBySlugParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(100),
  }),
});

/**
 * Get product by ID params schema
 */
export const getProductByIdParamsSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/**
 * Get related products params schema
 */
export const getRelatedProductsParamsSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(20).default(4),
  }),
});

/**
 * Slug validation
 */
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

/**
 * SKU validation
 */
export const skuSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z0-9а-яА-ЯёЁ_\-]+$/, 'SKU must contain only letters, numbers, hyphens and underscores');

/**
 * Images array schema
 */
export const imagesSchema = z
  .array(z.string().url('Each image must be a valid URL'))
  .min(0, 'Images array is optional')
  .max(10, 'Maximum 10 images allowed');

/**
 * Characteristics schema (JSON object)
 */
export const characteristicsSchema = z.record(z.unknown()).nullable().optional();

/**
 * Create product schema
 */
export const createProductSchema = z.object({
  body: z
    .object({
      categoryId: uuidSchema,
      name: z.string().min(1).max(200),
      slug: slugSchema,
      description: z.string().min(1).max(5000),
      price: z.number().positive('Price must be positive'),
      promotionPrice: z.number().positive('Promotion price must be positive').nullable().optional(),
      discountPrice: z.number().positive('Discount price must be positive').nullable().optional(),
      article: articleSchema,
      sku: skuSchema.optional(),
      weight: z.number().positive('Weight must be positive'),
      dimensions: z.string().max(100).nullable().optional(),
      quantity: z.number().int().min(0, 'Quantity cannot be negative'),
      composition: z.string().max(2000).nullable().optional(),
      delivery: z.string().max(2000).nullable().optional(),
      characteristics: characteristicsSchema,
      application: z.string().max(2000).nullable().optional(),
      images: imagesSchema,
      isNew: z.boolean().default(false),
      isHit: z.boolean().default(false),
      isDiscount: z.boolean().default(false),
      hasPromotion: z.boolean().default(false),
      isActive: z.boolean().default(true),
    })
    .refine(
      (data) => {
        // If hasPromotion is true, promotionPrice must be set
        if (data.hasPromotion && !data.promotionPrice) {
          return false;
        }
        return true;
      },
      {
        message: 'Promotion price is required when hasPromotion is true',
        path: ['promotionPrice'],
      },
    )
    .refine(
      (data) => {
        // If isDiscount is true, discountPrice must be set
        if (data.isDiscount && !data.discountPrice) {
          return false;
        }
        return true;
      },
      {
        message: 'Discount price is required when isDiscount is true',
        path: ['discountPrice'],
      },
    )
    .refine(
      (data) => {
        // promotionPrice must be less than price
        if (data.promotionPrice && data.promotionPrice >= data.price) {
          return false;
        }
        return true;
      },
      {
        message: 'Promotion price must be less than regular price',
        path: ['promotionPrice'],
      },
    )
    ,
});

/**
 * Update product schema (all fields optional)
 */
export const updateProductSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z
    .object({
      categoryId: uuidSchema.optional(),
      name: z.string().min(1).max(200).optional(),
      slug: slugSchema.optional(),
      description: z.string().min(1).max(5000).optional(),
      price: z.number().positive('Price must be positive').optional(),
      promotionPrice: z.number().positive('Promotion price must be positive').nullable().optional(),
      discountPrice: z.number().positive('Discount price must be positive').nullable().optional(),
      article: articleSchema.optional(),
      sku: skuSchema.optional(),
      weight: z.number().positive('Weight must be positive').optional(),
      dimensions: z.string().max(100).nullable().optional(),
      quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
      composition: z.string().max(2000).nullable().optional(),
      delivery: z.string().max(2000).nullable().optional(),
      characteristics: characteristicsSchema,
      application: z.string().max(2000).nullable().optional(),
      images: imagesSchema.optional(),
      isNew: z.boolean().optional(),
      isHit: z.boolean().optional(),
      isDiscount: z.boolean().optional(),
      hasPromotion: z.boolean().optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (data) => {
        // If promotionPrice is provided, it must be less than price (if price is also provided)
        if (data.promotionPrice && data.price && data.promotionPrice >= data.price) {
          return false;
        }
        return true;
      },
      {
        message: 'Promotion price must be less than regular price',
        path: ['promotionPrice'],
      },
    )
    .refine(
      (data) => {
        // If discountPrice is provided, it must be less than price (if price is also provided)
        if (data.discountPrice && data.price && data.discountPrice >= data.price) {
          return false;
        }
        return true;
      },
      {
        message: 'Discount price must be less than regular price',
        path: ['discountPrice'],
      },
    ),
});

/**
 * Delete product params schema
 */
export const deleteProductParamsSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/**
 * Update stock schema
 */
export const updateStockSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  }),
});

/**
 * Type exports for TypeScript
 */
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>['query'];
export type SearchProductsQuery = z.infer<typeof searchProductsQuerySchema>['query'];
export type GetProductBySlugParams = z.infer<typeof getProductBySlugParamsSchema>['params'];
export type GetProductByIdParams = z.infer<typeof getProductByIdParamsSchema>['params'];
export type GetRelatedProductsParams = z.infer<typeof getRelatedProductsParamsSchema>['params'];
export type GetRelatedProductsQuery = z.infer<typeof getRelatedProductsParamsSchema>['query'];
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductParams = z.infer<typeof updateProductSchema>['params'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type DeleteProductParams = z.infer<typeof deleteProductParamsSchema>['params'];
export type UpdateStockParams = z.infer<typeof updateStockSchema>['params'];
export type UpdateStockInput = z.infer<typeof updateStockSchema>['body'];
