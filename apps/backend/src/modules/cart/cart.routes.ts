/**
 * @file cart.routes.ts
 * @description Routes for cart module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Router } from 'express';
import { cartController } from './cart.controller';
import { optionalAuth } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validation.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from './cart.validation';

const router: any = Router();

/**
 * All cart routes support both:
 * - Authenticated users (via JWT token)
 * - Anonymous users (via session token in header: x-session-token)
 */

// GET /api/cart - Get cart
router.get('/', optionalAuth, cartController.getCart.bind(cartController));

// POST /api/cart/items - Add item to cart
router.post(
  '/items',
  optionalAuth,
  validate(addToCartSchema),
  cartController.addToCart.bind(cartController),
);

// PATCH /api/cart/items/:itemId - Update cart item
router.patch(
  '/items/:itemId',
  optionalAuth,
  validate(updateCartItemSchema),
  cartController.updateCartItem.bind(cartController),
);

// DELETE /api/cart/items/:itemId - Remove cart item
router.delete(
  '/items/:itemId',
  optionalAuth,
  validate(removeCartItemSchema),
  cartController.removeCartItem.bind(cartController),
);

// DELETE /api/cart - Clear cart
router.delete('/', optionalAuth, cartController.clearCart.bind(cartController));

export default router;
