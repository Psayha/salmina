/**
 * @file categories.routes.ts
 * @description Routes for categories module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validation.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryBySlugSchema,
  deleteCategorySchema,
} from './categories.validation';

const router: any = Router();

/**
 * Public routes
 */

// GET /api/categories - Get all categories tree
router.get('/', categoriesController.getCategoriesTree.bind(categoriesController));

// GET /api/categories/home - Get home page categories
router.get('/home', categoriesController.getHomeCategories.bind(categoriesController));

// GET /api/categories/:slug - Get category by slug
router.get(
  '/:slug',
  validate(getCategoryBySlugSchema),
  categoriesController.getCategoryBySlug.bind(categoriesController),
);

/**
 * Admin routes
 */

// POST /api/categories - Create category
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createCategorySchema),
  categoriesController.createCategory.bind(categoriesController),
);

// PATCH /api/categories/:id - Update category
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateCategorySchema),
  categoriesController.updateCategory.bind(categoriesController),
);

// DELETE /api/categories/:id - Delete category
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(deleteCategorySchema),
  categoriesController.deleteCategory.bind(categoriesController),
);

export default router;
