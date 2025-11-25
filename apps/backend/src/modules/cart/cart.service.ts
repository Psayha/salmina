/**
 * @file cart.service.ts
 * @description Business logic for shopping cart
 * @author AI Assistant
 * @created 2024-11-13
 */

import { prisma } from '../../database/prisma.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError.js';
import { logger } from '../../utils/logger.js';
import { generateRandomToken } from '../../common/utils/crypto.js';
import {
  CartSummary,
  CartWithItems,
  AddToCartDTO,
  UpdateCartItemDTO,
  toCartItemDTO,
  calculateAppliedPrice,
  calculateCartTotals,
} from './cart.types.js';

const CART_EXPIRES_DAYS = 30;

class CartService {
  /**
   * Get or create cart by session token or user ID
   */
  async getOrCreateCart(userId?: string, sessionToken?: string): Promise<CartWithItems> {
    logger.info('Getting or creating cart', { userId, hasSessionToken: !!sessionToken });

    // Try to find existing cart
    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionToken },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create new cart if not found
    if (!cart) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + CART_EXPIRES_DAYS);

      cart = await prisma.cart.create({
        data: {
          userId: userId || null,
          sessionToken: sessionToken || generateRandomToken(32),
          expiresAt,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      logger.info(`Cart created: ${cart.id}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cart;
  }

  /**
   * Get cart summary
   */
  async getCartSummary(userId?: string, sessionToken?: string): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId, sessionToken);

    const items = cart.items.map(toCartItemDTO);
    const totals = calculateCartTotals(cart.items);

    return {
      id: cart.id,
      sessionToken: cart.sessionToken,
      items,
      totals,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartDTO, userId?: string, sessionToken?: string): Promise<CartSummary> {
    logger.info('Adding item to cart', { productId: data.productId, quantity: data.quantity });

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: data.productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundError('Product', data.productId);
    }

    // Check stock
    if (product.quantity < data.quantity) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${product.quantity}, requested: ${data.quantity}`,
      );
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId, sessionToken);

    // Check if product already in cart
    const existingItem = cart.items.find((item) => item.productId === data.productId);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + data.quantity;

      if (newQuantity > product.quantity) {
        throw new BadRequestError(`Insufficient stock. Available: ${product.quantity}`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      logger.info(`Cart item updated: ${existingItem.id}, new quantity: ${newQuantity}`);
    } else {
      // Add new item
      const appliedPrice = calculateAppliedPrice(product);

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: data.quantity,
          price: product.price,
          appliedPrice,
          hasPromotion: product.hasPromotion,
          allowPromocode: !product.hasPromotion, // Can't apply promocode if already has promotion
        },
      });

      logger.info(`Item added to cart: ${cart.id}`);
    }

    return this.getCartSummary(userId, sessionToken);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    itemId: string,
    data: UpdateCartItemDTO,
    userId?: string,
    sessionToken?: string,
  ): Promise<CartSummary> {
    logger.info('Updating cart item', { itemId, quantity: data.quantity });

    // Get cart item
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!item) {
      throw new NotFoundError('Cart item', itemId);
    }

    // Verify cart ownership
    const belongsToUser = userId && item.cart.userId === userId;
    const belongsToSession = sessionToken && item.cart.sessionToken === sessionToken;

    if (!belongsToUser && !belongsToSession) {
      throw new NotFoundError('Cart item', itemId);
    }

    // Check stock
    if (item.product.quantity < data.quantity) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${item.product.quantity}, requested: ${data.quantity}`,
      );
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
    });

    logger.info(`Cart item updated: ${itemId}`);

    return this.getCartSummary(userId, sessionToken);
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(itemId: string, userId?: string, sessionToken?: string): Promise<CartSummary> {
    logger.info('Removing cart item', { itemId });

    // Get cart item
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item) {
      throw new NotFoundError('Cart item', itemId);
    }

    // Verify cart ownership
    const belongsToUser = userId && item.cart.userId === userId;
    const belongsToSession = sessionToken && item.cart.sessionToken === sessionToken;

    if (!belongsToUser && !belongsToSession) {
      throw new NotFoundError('Cart item', itemId);
    }

    // Remove item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    logger.info(`Cart item removed: ${itemId}`);

    return this.getCartSummary(userId, sessionToken);
  }

  /**
   * Clear cart
   */
  async clearCart(userId?: string, sessionToken?: string): Promise<void> {
    logger.info('Clearing cart', { userId, hasSessionToken: !!sessionToken });

    const cart = await this.getOrCreateCart(userId, sessionToken);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    logger.info(`Cart cleared: ${cart.id}`);
  }

  /**
   * Merge session cart with user cart on login
   */
  async mergeSessionCart(userId: string, sessionToken: string): Promise<void> {
    logger.info('Merging session cart with user cart', { userId, sessionToken });

    // Get session cart
    const sessionCart = await prisma.cart.findUnique({
      where: { sessionToken },
      include: {
        items: true,
      },
    });

    if (!sessionCart || sessionCart.items.length === 0) {
      return;
    }

    // Get or create user cart
    const userCart = await this.getOrCreateCart(userId);

    // Merge items
    for (const sessionItem of sessionCart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: sessionItem.productId,
        },
      });

      if (existingItem) {
        // Update quantity
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + sessionItem.quantity,
          },
        });
      } else {
        // Move item to user cart
        await prisma.cartItem.update({
          where: { id: sessionItem.id },
          data: {
            cartId: userCart.id,
          },
        });
      }
    }

    // Delete session cart
    await prisma.cart.delete({
      where: { id: sessionCart.id },
    });

    logger.info('Session cart merged with user cart');
  }
}

export const cartService = new CartService();
