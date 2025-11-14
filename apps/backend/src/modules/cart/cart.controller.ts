/**
 * @file cart.controller.ts
 * @description HTTP request handlers for cart
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { AddToCartInput, UpdateCartItemInput } from './cart.validation';

/**
 * Extended request with session token
 */
interface CartRequest extends AuthRequest {
  sessionToken?: string;
}

class CartController {
  /**
   * Get cart
   * GET /api/cart
   */
  async getCart(req: CartRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const sessionToken = req.headers['x-session-token'] as string | undefined;

      const cart = await cartService.getCartSummary(userId, sessionToken);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/cart/items
   */
  async addToCart(req: CartRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      const data: AddToCartInput = req.body;

      const cart = await cartService.addToCart(data, userId, sessionToken);

      res.status(201).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item
   * PATCH /api/cart/items/:itemId
   */
  async updateCartItem(req: CartRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      const { itemId } = req.params;
      const data: UpdateCartItemInput = req.body;

      const cart = await cartService.updateCartItem(itemId, data, userId, sessionToken);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove cart item
   * DELETE /api/cart/items/:itemId
   */
  async removeCartItem(req: CartRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      const { itemId } = req.params;

      const cart = await cartService.removeCartItem(itemId, userId, sessionToken);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cart
   * DELETE /api/cart
   */
  async clearCart(req: CartRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const sessionToken = req.headers['x-session-token'] as string | undefined;

      await cartService.clearCart(userId, sessionToken);

      res.json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
