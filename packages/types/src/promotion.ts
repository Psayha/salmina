/**
 * @file promotion.ts
 * @description Promotion and promotional campaign types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Promotion entity type
 * Represents a promotional campaign or banner
 */
export interface Promotion {
  /** Unique promotion identifier (UUID) */
  id: string;
  /** Promotion title/name */
  title: string;
  /** Promotion description (optional) */
  description?: string | null;
  /** Promotion banner/image URL */
  image: string;
  /** Link to promotion details or campaign page (optional) */
  link?: string | null;
  /** Display order for sorting promotions */
  order: number;
  /** Is the promotion currently active/visible */
  isActive: boolean;
  /** Promotion validity start date (optional) */
  validFrom?: Date | null;
  /** Promotion validity end date (optional) */
  validTo?: Date | null;
  /** Promotion creation timestamp */
  createdAt: Date;
  /** Promotion last update timestamp */
  updatedAt: Date;
}

/**
 * Create Promotion DTO (Data Transfer Object)
 * Used for creating new promotions (admin only)
 */
export interface CreatePromotionDTO {
  /** Promotion title */
  title: string;
  /** Promotion description (optional) */
  description?: string;
  /** Promotion image URL */
  image: string;
  /** Link to promotion (optional) */
  link?: string;
  /** Display order */
  order?: number;
  /** Validity start date (optional) */
  validFrom?: Date;
  /** Validity end date (optional) */
  validTo?: Date;
}

/**
 * Update Promotion DTO (Data Transfer Object)
 * Used for updating existing promotions (admin only)
 */
export interface UpdatePromotionDTO {
  /** Promotion title (optional) */
  title?: string;
  /** Promotion description (optional) */
  description?: string | null;
  /** Promotion image URL (optional) */
  image?: string;
  /** Link to promotion (optional) */
  link?: string | null;
  /** Display order (optional) */
  order?: number;
  /** Is the promotion active (optional) */
  isActive?: boolean;
  /** Validity start date (optional) */
  validFrom?: Date | null;
  /** Validity end date (optional) */
  validTo?: Date | null;
}

/**
 * Promotion list item response
 * Used for promotion listing views
 */
export interface PromotionListItem {
  /** Promotion identifier */
  id: string;
  /** Promotion title */
  title: string;
  /** Promotion image URL */
  image: string;
  /** Display order */
  order: number;
  /** Link to promotion */
  link?: string | null;
}

/**
 * Promotion detail response
 * Complete promotion information for detail views
 */
export interface PromotionDetail extends Promotion {}

/**
 * Active promotion
 * Represents a currently active promotion based on date validation
 */
export interface ActivePromotion extends Promotion {
  /** Whether the promotion is currently within validity dates */
  isCurrentlyValid: boolean;
  /** Days remaining until promotion ends */
  daysRemaining?: number;
}

/**
 * Promotion schedule
 * Used for managing promotion scheduling
 */
export interface PromotionSchedule {
  /** Promotion identifier */
  id: string;
  /** Promotion title */
  title: string;
  /** Start date */
  validFrom?: Date | null;
  /** End date */
  validTo?: Date | null;
  /** Is scheduled to be active */
  isScheduled: boolean;
  /** Days until promotion starts */
  daysUntilStart?: number;
  /** Days remaining until end */
  daysRemaining?: number;
}

/**
 * Promotion filters for admin
 * Used for filtering promotions in admin panel
 */
export interface PromotionFilters {
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by date range start */
  fromDate?: Date;
  /** Filter by date range end */
  toDate?: Date;
  /** Sort field */
  sortBy?: 'order' | 'createdAt' | 'validFrom' | 'validTo';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Pagination page */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Promotion statistics
 * Used for admin analytics
 */
export interface PromotionStatistics {
  /** Total active promotions */
  activePromotions: number;
  /** Total inactive promotions */
  inactivePromotions: number;
  /** Total scheduled promotions */
  scheduledPromotions: number;
  /** Total expired promotions */
  expiredPromotions: number;
  /** Current active promotion count */
  currentlyActiveCount: number;
}
