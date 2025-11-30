/**
 * @file product.ts
 * @description Product and product-related types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Product entity type
 * Represents a product in the e-commerce catalog
 */
export interface Product {
  /** Unique product identifier (UUID) */
  id: string;
  /** Category ID the product belongs to */
  categoryId: string;
  /** Product name */
  name: string;
  /** Product URL slug (unique) */
  slug: string;
  /** Product detailed description */
  description: string;
  /** Base product price */
  price: number;
  /** Promotional price (optional) */
  promotionPrice?: number | null;
  /** Discount price (optional) */
  discountPrice?: number | null;
  /** Product article number (optional) */
  article?: string | null;
  /** Product weight in kg */
  weight: number;
  /** Product dimensions (optional) */
  dimensions?: string | null;
  /** Available quantity in stock */
  quantity: number;
  /** Product composition/ingredients (optional) */
  composition?: string | null;
  /** Delivery information (optional) */
  delivery?: string | null;
  /** Product characteristics as JSON (optional) */
  characteristics?: Record<string, unknown> | null;
  /** Product application/usage (optional) */
  application?: string | null;
  /** Array of product image URLs */
  images: string[];
  /** Is this a new product */
  isNew: boolean;
  /** Is this a popular/hit product */
  isHit: boolean;
  /** Does this product have a discount */
  isDiscount: boolean;
  /** Does this product have a promotion */
  hasPromotion: boolean;
  /** Number of times product was viewed */
  viewCount: number;
  /** Number of times product was ordered */
  orderCount: number;
  /** Is the product active/visible */
  isActive: boolean;
  /** Product creation timestamp */
  createdAt: Date;
  /** Product last update timestamp */
  updatedAt: Date;
}

/**
 * Product filters for search and filtering
 */
export interface ProductFilters {
  /** Filter by category ID */
  categoryId?: string;
  /** Filter by product name (partial match) */
  name?: string;
  /** Minimum price filter */
  minPrice?: number;
  /** Maximum price filter */
  maxPrice?: number;
  /** Filter by new products */
  isNew?: boolean;
  /** Filter by hit/popular products */
  isHit?: boolean;
  /** Filter by discounted products */
  isDiscount?: boolean;
  /** Filter by promotion products */
  hasPromotion?: boolean;
  /** Minimum quantity available */
  minQuantity?: number;
  /** Sort field (e.g., 'price', 'name', 'createdAt', 'viewCount') */
  sortBy?: 'price' | 'name' | 'createdAt' | 'viewCount' | 'orderCount';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Pagination: page number */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
}

/**
 * Create Product DTO (Data Transfer Object)
 * Used for creating new products (admin only)
 */
export interface CreateProductDTO {
  /** Category ID */
  categoryId: string;
  /** Product name */
  name: string;
  /** Product URL slug */
  slug: string;
  /** Product description */
  description: string;
  /** Base product price */
  price: number;
  /** Promotional price (optional) */
  promotionPrice?: number;
  /** Discount price (optional) */
  discountPrice?: number;
  /** Product article number (optional) */
  article?: string;
  /** Product weight in kg */
  weight: number;
  /** Product dimensions (optional) */
  dimensions?: string;
  /** Available quantity in stock */
  quantity?: number;
  /** Product composition (optional) */
  composition?: string;
  /** Delivery information (optional) */
  delivery?: string;
  /** Product characteristics (optional) */
  characteristics?: Record<string, unknown>;
  /** Product application (optional) */
  application?: string;
  /** Product image URLs */
  images: string[];
  /** Is this a new product */
  isNew?: boolean;
  /** Is this a popular product */
  isHit?: boolean;
  /** Is this product discounted */
  isDiscount?: boolean;
  /** Does this product have a promotion */
  hasPromotion?: boolean;
}

/**
 * Update Product DTO (Data Transfer Object)
 * Used for updating existing products (admin only)
 */
export interface UpdateProductDTO {
  /** Category ID (optional) */
  categoryId?: string;
  /** Product name (optional) */
  name?: string;
  /** Product description (optional) */
  description?: string;
  /** Base product price (optional) */
  price?: number;
  /** Promotional price (optional) */
  promotionPrice?: number | null;
  /** Discount price (optional) */
  discountPrice?: number | null;
  /** Available quantity (optional) */
  quantity?: number;
  /** Product dimensions (optional) */
  dimensions?: string;
  /** Product composition (optional) */
  composition?: string;
  /** Delivery information (optional) */
  delivery?: string;
  /** Product characteristics (optional) */
  characteristics?: Record<string, unknown>;
  /** Product application (optional) */
  application?: string;
  /** Product images (optional) */
  images?: string[];
  /** Is this a new product (optional) */
  isNew?: boolean;
  /** Is this a hit product (optional) */
  isHit?: boolean;
  /** Is this product discounted (optional) */
  isDiscount?: boolean;
  /** Does this product have a promotion (optional) */
  hasPromotion?: boolean;
  /** Is the product active (optional) */
  isActive?: boolean;
}

/**
 * Product listing response
 * Simplified product data for list/catalog views
 */
export interface ProductListItem {
  /** Unique product identifier */
  id: string;
  /** Product name */
  name: string;
  /** Product URL slug */
  slug: string;
  /** Base product price */
  price: number;
  /** Promotional price */
  promotionPrice?: number | null;
  /** Discount price */
  discountPrice?: number | null;
  /** Primary product image URL */
  image?: string;
  /** Is this a new product */
  isNew: boolean;
  /** Is this a popular product */
  isHit: boolean;
  /** Does this product have a discount */
  isDiscount: boolean;
  /** Does this product have a promotion */
  hasPromotion: boolean;
  /** Available quantity */
  quantity: number;
}

/**
 * Product detail response
 * Complete product information for detail views
 */
export interface ProductDetail extends Product {
  /** Category information */
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}
