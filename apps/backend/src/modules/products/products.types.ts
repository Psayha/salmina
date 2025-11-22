/**
 * @file products.types.ts
 * @description TypeScript interfaces and types for products module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Product, Category } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Product with category relation
 */
export interface ProductWithCategory extends Product {
  category: Category;
}

/**
 * Product list response item
 */
export interface ProductListItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promotionPrice: number | null;
  discountPrice: number | null;
  finalPrice: number;
  discountPercent: number | null;
  article: string;
  sku: string;
  weight: number;
  dimensions: string | null;
  quantity: number;
  images: string[];
  isNew: boolean;
  isHit: boolean;
  isDiscount: boolean;
  hasPromotion: boolean;
  viewCount: number;
  orderCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product detail response
 */
export interface ProductDetail extends ProductListItem {
  composition: string | null;
  delivery: string | null;
  characteristics: Record<string, unknown> | null;
  application: string | null;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated products response
 */
export interface ProductsListResponse {
  products: ProductListItem[];
  pagination: PaginationMeta;
}

/**
 * Search filters
 */
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  isNew?: boolean;
  isHit?: boolean;
  isDiscount?: boolean;
  hasPromotion?: boolean;
}

/**
 * Sort options
 */
export type ProductSortBy = 'price' | 'popular' | 'new' | 'name';
export type SortOrder = 'asc' | 'desc';

/**
 * Search parameters
 */
export interface ProductSearchParams {
  query?: string;
  page: number;
  limit: number;
  sortBy?: ProductSortBy;
  order?: SortOrder;
  filters?: ProductFilters;
}

/**
 * Create product DTO
 */
export interface CreateProductDTO {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promotionPrice?: number | null;
  discountPrice?: number | null;
  article: string;
  sku: string;
  weight: number;
  dimensions?: string | null;
  quantity: number;
  composition?: string | null;
  delivery?: string | null;
  characteristics?: Record<string, unknown> | null;
  application?: string | null;
  images: string[];
  isNew?: boolean;
  isHit?: boolean;
  isDiscount?: boolean;
  hasPromotion?: boolean;
  isActive?: boolean;
}

/**
 * Update product DTO (all fields optional)
 */
export interface UpdateProductDTO {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  promotionPrice?: number | null;
  discountPrice?: number | null;
  article?: string;
  sku?: string;
  weight?: number;
  dimensions?: string | null;
  quantity?: number;
  composition?: string | null;
  delivery?: string | null;
  characteristics?: Record<string, unknown> | null;
  application?: string | null;
  images?: string[];
  isNew?: boolean;
  isHit?: boolean;
  isDiscount?: boolean;
  hasPromotion?: boolean;
  isActive?: boolean;
}

/**
 * Update stock DTO
 */
export interface UpdateStockDTO {
  quantity: number;
}

/**
 * Helper to convert Decimal to number
 */
export function decimalToNumber(value: Decimal | null): number | null {
  return value ? Number(value) : null;
}

/**
 * Calculate final price based on promotion and discount
 */
export function calculateFinalPrice(
  price: number,
  promotionPrice: number | null,
  discountPrice: number | null,
  hasPromotion: boolean,
): number {
  // Priority: promotionPrice > discountPrice > price
  if (hasPromotion && promotionPrice !== null) {
    return promotionPrice;
  }
  if (discountPrice !== null) {
    return discountPrice;
  }
  return price;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercent(price: number, finalPrice: number): number | null {
  if (finalPrice >= price) {
return null;
}
  const discount = ((price - finalPrice) / price) * 100;
  return Math.round(discount);
}

/**
 * Convert Product to ProductListItem
 */
export function toProductListItem(product: ProductWithCategory): ProductListItem {
  const price = decimalToNumber(product.price) || 0;
  const promotionPrice = decimalToNumber(product.promotionPrice);
  const discountPrice = decimalToNumber(product.discountPrice);
  const weight = decimalToNumber(product.weight) || 0;

  const finalPrice = calculateFinalPrice(price, promotionPrice, discountPrice, product.hasPromotion);
  const discountPercent = calculateDiscountPercent(price, finalPrice);

  return {
    id: product.id,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price,
    promotionPrice,
    discountPrice,
    finalPrice,
    discountPercent,
    article: product.article,
    sku: product.sku,
    weight,
    dimensions: product.dimensions,
    quantity: product.quantity,
    images: product.images,
    isNew: product.isNew,
    isHit: product.isHit,
    isDiscount: product.isDiscount,
    hasPromotion: product.hasPromotion,
    viewCount: product.viewCount,
    orderCount: product.orderCount,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Convert Product to ProductDetail
 */
export function toProductDetail(product: ProductWithCategory): ProductDetail {
  const listItem = toProductListItem(product);

  return {
    ...listItem,
    composition: product.composition,
    delivery: product.delivery,
    characteristics: product.characteristics as Record<string, unknown> | null,
    application: product.application,
  };
}
