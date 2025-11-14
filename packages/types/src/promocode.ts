/**
 * @file promocode.ts
 * @description Promocode and discount-related types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Discount type enumeration
 * Defines how discounts are calculated
 */
export enum DiscountType {
  /** Percentage-based discount (e.g., 10%) */
  PERCENT = 'PERCENT',
  /** Fixed amount discount (e.g., $50) */
  FIXED = 'FIXED',
}

/**
 * Promocode entity type
 * Represents a discount code that can be applied to orders
 */
export interface Promocode {
  /** Unique promocode identifier (UUID) */
  id: string;
  /** Promocode string (unique) */
  code: string;
  /** Type of discount (percentage or fixed amount) */
  discountType: DiscountType;
  /** Discount value (percentage points or amount) */
  discountValue: number;
  /** Minimum order amount required to use this code (optional) */
  minOrderAmount?: number | null;
  /** Maximum number of times this code can be used (optional) */
  maxUses?: number | null;
  /** Number of times this code has been used */
  usedCount: number;
  /** Is the promocode currently active */
  isActive: boolean;
  /** Promocode validity start date */
  validFrom: Date;
  /** Promocode validity end date */
  validTo: Date;
  /** Promocode creation timestamp */
  createdAt: Date;
  /** Promocode last update timestamp */
  updatedAt: Date;
}

/**
 * Create Promocode DTO (Data Transfer Object)
 * Used for creating new promotional codes (admin only)
 */
export interface CreatePromocodeDTO {
  /** Promocode string */
  code: string;
  /** Discount type */
  discountType: DiscountType;
  /** Discount value */
  discountValue: number;
  /** Minimum order amount (optional) */
  minOrderAmount?: number;
  /** Maximum uses (optional) */
  maxUses?: number;
  /** Validity start date */
  validFrom: Date;
  /** Validity end date */
  validTo: Date;
}

/**
 * Update Promocode DTO (Data Transfer Object)
 * Used for updating existing promotional codes (admin only)
 */
export interface UpdatePromocodeDTO {
  /** Discount value (optional) */
  discountValue?: number;
  /** Minimum order amount (optional) */
  minOrderAmount?: number | null;
  /** Maximum uses (optional) */
  maxUses?: number | null;
  /** Validity start date (optional) */
  validFrom?: Date;
  /** Validity end date (optional) */
  validTo?: Date;
  /** Is the code active (optional) */
  isActive?: boolean;
}

/**
 * Validate promocode DTO (Data Transfer Object)
 * Used for validating promocodes before applying to order
 */
export interface ValidatePromocodeDTO {
  /** Promocode string to validate */
  code: string;
  /** Order amount to validate against */
  orderAmount: number;
}

/**
 * Promocode validation result
 * Response from promocode validation
 */
export interface PromocodeValidationResult {
  /** Whether the code is valid */
  isValid: boolean;
  /** Promocode details if valid */
  promocode?: Promocode;
  /** Error message if invalid */
  error?: string;
  /** Calculated discount amount */
  discountAmount?: number;
  /** Whether the code has reached max uses */
  isMaxUsesReached?: boolean;
  /** Whether the code is expired */
  isExpired?: boolean;
  /** Whether the order amount is below minimum required */
  isBelowMinimumAmount?: boolean;
}

/**
 * Promocode for API response
 * Safe information to expose in API responses
 */
export interface PromocodeResponse {
  /** Promocode identifier */
  id: string;
  /** Discount type */
  discountType: DiscountType;
  /** Discount value */
  discountValue: number;
  /** Minimum order amount */
  minOrderAmount?: number | null;
  /** Whether the code is currently valid */
  isCurrentlyValid: boolean;
  /** Remaining uses (if limited) */
  remainingUses?: number;
}

/**
 * Calculate discount result
 * Result of discount calculation
 */
export interface CalculateDiscountResult {
  /** Original amount */
  originalAmount: number;
  /** Calculated discount amount */
  discountAmount: number;
  /** Final amount after discount */
  finalAmount: number;
  /** Applied promocode (if any) */
  promocode?: Promocode;
}

/**
 * Discount configuration
 * Configuration for discount calculations
 */
export interface DiscountConfig {
  /** Type of discount */
  type: DiscountType;
  /** Discount value */
  value: number;
  /** Minimum order amount (optional) */
  minOrderAmount?: number;
}

/**
 * Apply promocode DTO (Data Transfer Object)
 * Used when applying a promocode to cart/order
 */
export interface ApplyPromocodeDTO {
  /** Promocode string */
  code: string;
}

/**
 * Promocode statistics
 * Used for admin analytics
 */
export interface PromocodeStatistics {
  /** Total number of unique codes used */
  totalCodesUsed: number;
  /** Total discount amount distributed */
  totalDiscountDistributed: number;
  /** Average discount per use */
  averageDiscountPerUse: number;
  /** Most used promocode */
  mostUsedPromocode?: Promocode;
  /** Most valuable discount */
  mostValuablePromocode?: Promocode;
}
