/**
 * @file cart.types.ts
 * @description TypeScript types for cart module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Decimal } from '@prisma/client/runtime/library';
import { Product } from '../products/products.types.js';

/**
 * Cart model interface
 */
export interface Cart {
  id: string;
  userId: string | null;
  sessionToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

/**
 * CartItem model interface
 */
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: Decimal;
  appliedPrice: Decimal;
  hasPromotion: boolean;
  allowPromocode: boolean;
  createdAt: Date;
}

/**
 * Cart item with product details
 */
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

/**
 * Cart with items and products
 */
export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}

/**
 * Cart totals calculation
 */
export interface CartTotals {
  subtotal: number;
  discount: number;
  promocodeDiscount: number;
  total: number;
  itemsCount: number;
}

/**
 * Cart summary for response
 */
export interface CartSummary {
  id: string;
  sessionToken: string | null;
  items: CartItemDTO[];
  totals: CartTotals;
  promocode?: {
    code: string;
    discount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart item DTO
 */
export interface CartItemDTO {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  productArticle: string;
  basePrice: number;
  appliedPrice: number;
  hasPromotion: boolean;
  allowPromocode: boolean;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  availableQuantity: number;
}

/**
 * Add to cart DTO
 */
export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

/**
 * Update cart item DTO
 */
export interface UpdateCartItemDTO {
  quantity: number;
}

/**
 * Apply promocode DTO
 */
export interface ApplyPromocodeDTO {
  code: string;
}

/**
 * Convert CartItem to DTO
 */
export function toCartItemDTO(item: CartItemWithProduct): CartItemDTO {
  const product = item.product;
  const basePrice = Number(item.price);
  const appliedPrice = Number(item.appliedPrice);
  const quantity = item.quantity;

  return {
    id: item.id,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    productImage: product.images[0] || '',
    productArticle: product.article,
    basePrice,
    appliedPrice,
    hasPromotion: item.hasPromotion,
    allowPromocode: item.allowPromocode,
    quantity,
    subtotal: appliedPrice * quantity,
    inStock: product.quantity > 0,
    availableQuantity: product.quantity,
  };
}

/**
 * Calculate applied price for product
 */
export function calculateAppliedPrice(product: Product): number {
  // Priority: promotionPrice > discountPrice > price
  if (product.hasPromotion && product.promotionPrice) {
    return Number(product.promotionPrice);
  }
  if (product.isDiscount && product.discountPrice) {
    return Number(product.discountPrice);
  }
  return Number(product.price);
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(
  items: CartItemWithProduct[],
  promocodeDiscount = 0,
): CartTotals {
  const subtotal = items.reduce((sum: number, item: CartItemWithProduct) => {
    return sum + Number(item.appliedPrice) * item.quantity;
  }, 0);

  const discount = items.reduce((sum: number, item: CartItemWithProduct) => {
    const basePrice = Number(item.price);
    const appliedPrice = Number(item.appliedPrice);
    const itemDiscount = (basePrice - appliedPrice) * item.quantity;
    return sum + itemDiscount;
  }, 0);

  const total = subtotal - promocodeDiscount;

  const itemsCount = items.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0);

  return {
    subtotal,
    discount,
    promocodeDiscount,
    total: Math.max(0, total),
    itemsCount,
  };
}
