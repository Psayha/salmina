/**
 * @file categories.controller.ts
 * @description HTTP request handlers for categories
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service.js';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.validation.js';

class CategoriesController {
  /**
   * Get all categories as tree
   * GET /api/categories
   */
  async getCategoriesTree(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoriesService.getCategoriesTree();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get home page categories
   * GET /api/categories/home
   */
  async getHomeCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoriesService.getHomeCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by slug
   * GET /api/categories/:slug
   */
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await categoriesService.getCategoryBySlug(slug);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new category (admin only)
   * POST /api/categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateCategoryInput = req.body;
      const category = await categoriesService.createCategory(data);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update category (admin only)
   * PATCH /api/categories/:id
   */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateCategoryInput = req.body;
      const category = await categoriesService.updateCategory(id, data);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete category (admin only)
   * DELETE /api/categories/:id
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await categoriesService.deleteCategory(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoriesController = new CategoriesController();
