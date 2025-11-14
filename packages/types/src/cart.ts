/**
 * @file cart.ts
 * @description Shopping cart and cart item types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Cart entity type
 * Represents a shopping cart for a user or session
 */
export interface Cart {
  /** Unique cart identifier (UUID) */
  id: string;
  /** Associated user ID (optional, for authenticated users) */
  userId?: string | null;
  /** Session token (optional, for anonymous users) */
  sessionToken?: string | null;
  /** Cart creation timestamp */
  createdAt: Date;
  /** Cart last update timestamp */
  updatedAt: Date;
  /** Cart expiration timestamp (optional) */
  expiresAt?: Date | null;
}

/**
 * Cart item entity type
 * Represents a product item in a shopping cart
 */
export interface CartItem {
  /** Unique cart item identifier (UUID) */
  id: string;
  /** Associated cart ID */
  cartId: string;
  /** Product ID */
  productId: string;
  /** Quantity of the product in the cart */
  quantity: number;
  /** Base product price at the time of addition */
  price: number;
  /** Applied price (may include discounts) */
  appliedPrice: number;
  /** Whether this item has an active promotion */
  hasPromotion: boolean;
  /** Whether this item is eligible for promo codes */
  allowPromocode: boolean;
  /** Cart item creation timestamp */
  createdAt: Date;
}

/**
 * Cart with items
 * Complete cart data including all items
 */
export interface CartWithItems extends Cart {
  /** Cart items */
  items: CartItemWithProduct[];
}

/**
 * Cart item with product details
 * Used in API responses to include product information
 */
export interface CartItemWithProduct extends CartItem {
  /** Product details */
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    article: string;
    images: string[];
    weight: number;
    dimensions?: string | null;
  };
}

/**
 * Add to cart DTO (Data Transfer Object)
 * Used for adding items to cart
 */
export interface AddToCartDTO {
  /** Product ID to add */
  productId: string;
  /** Quantity to add (default: 1) */
  quantity?: number;
  /** Applied price (may be promotional) */
  appliedPrice?: number;
  /** Whether the product has a promotion */
  hasPromotion?: boolean;
  /** Whether promo codes are allowed */
  allowPromocode?: boolean;
}

/**
 * Update cart item DTO (Data Transfer Object)
 * Used for updating existing cart items
 */
export interface UpdateCartItemDTO {
  /** New quantity */
  quantity: number;
  /** Applied price (optional) */
  appliedPrice?: number;
  /** Whether the product has a promotion (optional) */
  hasPromotion?: boolean;
}

/**
 * Cart summary
 * Used for quick cart information display
 */
export interface CartSummary {
  /** Number of items in cart */
  itemCount: number;
  /** Number of unique products in cart */
  uniqueProductCount: number;
  /** Subtotal before any discounts */
  subtotal: number;
  /** Total discount amount */
  discount: number;
  /** Final total */
  total: number;
  /** Applied promocode (if any) */
  promocode?: {
    code: string;
    discount: number;
  };
}

/**
 * Cart totals calculation
 * Detailed breakdown of cart pricing
 */
export interface CartTotals {
  /** Sum of all item base prices */
  subtotal: number;
  /** Sum of promotions applied to items */
  itemPromotions: number;
  /** Promocode discount amount */
  promocodeDiscount: number;
  /** Total discount amount */
  totalDiscount: number;
  /** Final total to pay */
  total: number;
}

/**
 * Clear cart DTO (Data Transfer Object)
 * Used for removing specific items or clearing entire cart
 */
export interface ClearCartDTO {
  /** Specific product IDs to remove (optional, if not provided, clears entire cart) */
  productIds?: string[];
}
