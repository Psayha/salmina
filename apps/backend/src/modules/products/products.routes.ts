/**
 * @file products.routes.ts
 * @description Products routes configuration with middleware
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Router } from 'express';
import { productsController } from './products.controller.js';
import { validate } from '../../common/middleware/validation.middleware.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import {
  getProductsQuerySchema,
  searchProductsQuerySchema,
  getProductBySlugParamsSchema,
  getRelatedProductsParamsSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductParamsSchema,
  updateStockSchema,
} from './products.validation.js';

const router: Router = Router();

/**
 * Public routes (no authentication required)
 */

/**
 * GET /api/products
 * Get all products with filters, sorting, and pagination
 */
router.get('/', validate(getProductsQuerySchema), productsController.getAllProducts.bind(productsController));

/**
 * GET /api/products/search
 * Search products by query string
 */
router.get('/search', validate(searchProductsQuerySchema), productsController.searchProducts.bind(productsController));

/**
 * POST /api/products/bulk
 * Get multiple products by IDs (bulk fetch for favorites)
 */
router.post('/bulk', productsController.getProductsByIds.bind(productsController));

/**
 * GET /api/products/:slug
 * Get product by slug (increments view count)
 * Note: This must be after /search and /bulk to avoid conflict
 */
router.get('/:slug', validate(getProductBySlugParamsSchema), productsController.getProductBySlug.bind(productsController));

/**
 * GET /api/products/:id/related
 * Get related products (same category)
 */
router.get('/:id/related', validate(getRelatedProductsParamsSchema), productsController.getRelatedProducts.bind(productsController));

/**
 * Admin routes (require authentication and admin role)
 */

/**
 * POST /api/products
 * Create a new product (admin only)
 */
router.post('/', authenticate, requireAdmin, validate(createProductSchema), productsController.createProduct.bind(productsController));

/**
 * PATCH /api/products/:id
 * Update a product (admin only)
 */
router.patch('/:id', authenticate, requireAdmin, validate(updateProductSchema), productsController.updateProduct.bind(productsController));

/**
 * DELETE /api/products/:id
 * Delete a product (soft delete - admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(deleteProductParamsSchema),
  productsController.deleteProduct.bind(productsController),
);

/**
 * PATCH /api/products/:id/stock
 * Update product stock quantity (admin only)
 */
router.patch('/:id/stock', authenticate, requireAdmin, validate(updateStockSchema), productsController.updateStock.bind(productsController));

export default router;
