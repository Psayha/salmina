/**
 * @file products.controller.ts
 * @description HTTP request handlers for products endpoints
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Request, Response, NextFunction } from 'express';
import { productsService } from './products.service.js';
import { ProductSearchParams } from './products.types.js';
import { logger } from '../../utils/logger.js';

/**
 * Products Controller
 * Handles HTTP requests for products endpoints
 */
export class ProductsController {
  /**
   * GET /api/products
   * Get all products with pagination, filters, and sorting
   *
   * @param req - Express request with query parameters
   * @param res - Express response
   * @param next - Express next function
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as any;
      const {
        page,
        limit,
        sortBy,
        order,
        categoryId,
        minPrice,
        maxPrice,
        inStock,
        lowStock,
        isNew,
        isHit,
        isDiscount,
        hasPromotion,
      } = query;

      logger.info('Get all products request');

      const params: ProductSearchParams = {
        page,
        limit,
        sortBy,
        order,
        filters: {
          categoryId,
          minPrice,
          maxPrice,
          inStock,
          lowStock,
          isNew,
          isHit,
          isDiscount,
          hasPromotion,
        },
      };

      const result = await productsService.getAllProducts(params);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Products retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/search
   * Search products by query string
   *
   * @param req - Express request with query parameters
   * @param res - Express response
   * @param next - Express next function
   */
  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as any;
      const {
        q,
        page,
        limit,
        sortBy,
        order,
        categoryId,
        minPrice,
        maxPrice,
        inStock,
        lowStock,
        isNew,
        isHit,
        isDiscount,
        hasPromotion,
      } = query;

      logger.info(`Search products request: query="${q}"`);

      const params: ProductSearchParams = {
        query: q,
        page,
        limit,
        sortBy,
        order,
        filters: {
          categoryId,
          minPrice,
          maxPrice,
          inStock,
          lowStock,
          isNew,
          isHit,
          isDiscount,
          hasPromotion,
        },
      };

      const result = await productsService.searchProducts(params);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Search completed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:slug
   * Get product by slug (increments view count)
   *
   * @param req - Express request with slug parameter
   * @param res - Express response
   * @param next - Express next function
   */
  async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;

      logger.info(`Get product by slug request: ${slug}`);

      const product = await productsService.getProductBySlug(slug);

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id/related
   * Get related products (same category)
   *
   * @param req - Express request with product ID and limit
   * @param res - Express response
   * @param next - Express next function
   */
  async getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      logger.info(`Get related products request: productId=${id}, limit=${limit}`);

      const products = await productsService.getRelatedProducts(id, limit as unknown as number);

      res.status(200).json({
        success: true,
        data: products,
        message: 'Related products retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products
   * Create a new product (admin only)
   *
   * @param req - Express request with product data
   * @param res - Express response
   * @param next - Express next function
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;

      logger.info(`Create product request: ${data.name}`);

      const product = await productsService.createProduct(data);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/products/:id
   * Update a product (admin only)
   *
   * @param req - Express request with product ID and update data
   * @param res - Express response
   * @param next - Express next function
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      logger.info(`Update product request: ${id}`);

      const product = await productsService.updateProduct(id, data);

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete a product (soft delete - admin only)
   *
   * @param req - Express request with product ID
   * @param res - Express response
   * @param next - Express next function
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.info(`Delete product request: ${id}`);

      const result = await productsService.deleteProduct(id);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/products/:id/stock
   * Update product stock quantity (admin only)
   *
   * @param req - Express request with product ID and quantity
   * @param res - Express response
   * @param next - Express next function
   */
  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      logger.info(`Update stock request: productId=${id}, quantity=${quantity}`);

      const product = await productsService.updateStock(id, quantity);

      res.status(200).json({
        success: true,
        data: product,
        message: 'Stock updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const productsController = new ProductsController();
