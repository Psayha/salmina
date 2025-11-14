/**
 * @file wishlist.ts
 * @description Wishlist and favorites sharing types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Wishlist share entity type
 * Represents a shared wishlist/favorites list with a unique share link
 */
export interface WishlistShare {
  /** Unique share identifier (UUID) */
  id: string;
  /** User ID who owns the wishlist */
  userId: string;
  /** Unique share ID (used in URL slug) */
  shareId: string;
  /** Optional title for the shared list */
  title?: string | null;
  /** QR code URL for sharing (optional) */
  qrCodeUrl?: string | null;
  /** Is the share link currently active */
  isActive: boolean;
  /** Number of times the shared list has been viewed */
  viewCount: number;
  /** When the share was created */
  createdAt: Date;
  /** When the share expires (optional) */
  expiresAt?: Date | null;
}

/**
 * Create wishlist share DTO (Data Transfer Object)
 * Used for creating a new wishlist share
 */
export interface CreateWishlistShareDTO {
  /** Optional title for the shared wishlist */
  title?: string;
  /** Optional expiration date */
  expiresAt?: Date;
}

/**
 * Update wishlist share DTO (Data Transfer Object)
 * Used for updating an existing wishlist share
 */
export interface UpdateWishlistShareDTO {
  /** New title (optional) */
  title?: string | null;
  /** New expiration date (optional) */
  expiresAt?: Date | null;
  /** Is the share active (optional) */
  isActive?: boolean;
}

/**
 * Wishlist share with items
 * Complete shared wishlist including all items
 */
export interface WishlistShareWithItems extends WishlistShare {
  /** Items in the shared wishlist */
  items: WishlistShareItem[];
}

/**
 * Wishlist share item
 * A product in a shared wishlist
 */
export interface WishlistShareItem {
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Product slug */
  slug: string;
  /** Product price */
  price: number;
  /** Product image URL */
  image?: string;
  /** When item was added to wishlist */
  addedAt: Date;
}

/**
 * Wishlist share metadata
 * Share information without items
 */
export interface WishlistShareMetadata {
  /** Share identifier */
  id: string;
  /** Share ID for URL */
  shareId: string;
  /** Share title */
  title?: string | null;
  /** Owner user name */
  ownerName?: string;
  /** View count */
  viewCount: number;
  /** Number of items in wishlist */
  itemCount: number;
  /** Is share active */
  isActive: boolean;
  /** When share expires */
  expiresAt?: Date | null;
  /** When share was created */
  createdAt: Date;
}

/**
 * Public wishlist share response
 * Safe information to expose in public API responses
 */
export interface PublicWishlistShareResponse {
  /** Share ID */
  shareId: string;
  /** Share title */
  title?: string | null;
  /** Items in the shared wishlist */
  items: {
    productId: string;
    name: string;
    slug: string;
    price: number;
    image?: string;
  }[];
  /** View count */
  viewCount: number;
  /** Creation date */
  createdAt: Date;
  /** Expiration date */
  expiresAt?: Date | null;
  /** Is share still active */
  isActive: boolean;
}

/**
 * Favorite/wishlist item
 * Represents a product in user's favorites/wishlist
 */
export interface FavoriteItem {
  /** Favorite identifier */
  id: string;
  /** User ID */
  userId: string;
  /** Product ID */
  productId: string;
  /** When item was added to favorites */
  createdAt: Date;
}

/**
 * Favorite item with product details
 * Favorite including product information
 */
export interface FavoriteWithProduct extends FavoriteItem {
  /** Product details */
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
}

/**
 * Add to wishlist DTO (Data Transfer Object)
 * Used for adding a product to user's wishlist
 */
export interface AddToWishlistDTO {
  /** Product ID to add */
  productId: string;
}

/**
 * Remove from wishlist DTO (Data Transfer Object)
 * Used for removing a product from user's wishlist
 */
export interface RemoveFromWishlistDTO {
  /** Product ID to remove */
  productId: string;
}

/**
 * Wishlist share link
 * Represents a shareable link for a wishlist
 */
export interface WishlistShareLink {
  /** Full share URL */
  url: string;
  /** Share ID */
  shareId: string;
  /** QR code URL */
  qrCodeUrl?: string | null;
  /** Expiration timestamp */
  expiresAt?: Date | null;
}

/**
 * Wishlist statistics
 * Statistics about user's wishlist
 */
export interface WishlistStatistics {
  /** Total items in wishlist */
  totalItems: number;
  /** Number of active shares */
  activeShares: number;
  /** Total views across all shares */
  totalViews: number;
  /** Most viewed share */
  mostViewedShare?: WishlistShare;
}
