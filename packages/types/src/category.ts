/**
 * @file category.ts
 * @description Product category and category tree types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Category entity type
 * Represents a product category that can form a hierarchical tree structure
 */
export interface Category {
  /** Unique category identifier (UUID) */
  id: string;
  /** Category name */
  name: string;
  /** Category URL slug (unique) */
  slug: string;
  /** Category description (optional) */
  description?: string | null;
  /** Parent category ID (for subcategories, optional) */
  parentId?: string | null;
  /** Display order within the same level */
  order: number;
  /** Category image/icon URL (optional) */
  image?: string | null;
  /** Whether to show on home page */
  showOnHome: boolean;
  /** Display order on home page (optional) */
  homeOrder?: number | null;
  /** Is the category active/visible */
  isActive: boolean;
  /** Category creation timestamp */
  createdAt: Date;
  /** Category last update timestamp */
  updatedAt: Date;
}

/**
 * Category with hierarchical tree structure
 * Includes parent and child category information
 */
export interface CategoryTree extends Category {
  /** Parent category (if exists) */
  parent?: CategoryTree | null;
  /** Child categories */
  children?: CategoryTree[];
}

/**
 * Flat category response for list views
 * Used in API responses for category listings
 */
export interface CategoryListItem {
  /** Unique category identifier */
  id: string;
  /** Category name */
  name: string;
  /** Category URL slug */
  slug: string;
  /** Category image URL */
  image?: string | null;
  /** Display order */
  order: number;
}

/**
 * Category with product count
 * Used for category navigation with product counts
 */
export interface CategoryWithCount extends Category {
  /** Number of products in this category */
  productCount: number;
  /** Number of active products in this category */
  activeProductCount: number;
}

/**
 * Create Category DTO (Data Transfer Object)
 * Used for creating new categories (admin only)
 */
export interface CreateCategoryDTO {
  /** Category name */
  name: string;
  /** Category URL slug */
  slug: string;
  /** Category description (optional) */
  description?: string;
  /** Parent category ID (optional) */
  parentId?: string;
  /** Display order */
  order?: number;
  /** Category image/icon URL (optional) */
  image?: string;
  /** Whether to show on home page */
  showOnHome?: boolean;
  /** Display order on home page (optional) */
  homeOrder?: number;
}

/**
 * Update Category DTO (Data Transfer Object)
 * Used for updating existing categories (admin only)
 */
export interface UpdateCategoryDTO {
  /** Category name (optional) */
  name?: string;
  /** Category description (optional) */
  description?: string;
  /** Parent category ID (optional) */
  parentId?: string | null;
  /** Display order (optional) */
  order?: number;
  /** Category image/icon URL (optional) */
  image?: string | null;
  /** Whether to show on home page (optional) */
  showOnHome?: boolean;
  /** Display order on home page (optional) */
  homeOrder?: number | null;
  /** Is the category active (optional) */
  isActive?: boolean;
}

/**
 * Category hierarchy node
 * Used for building category tree structures
 */
export interface CategoryNode extends Category {
  /** Child category nodes */
  children: CategoryNode[];
}

/**
 * Breadcrumb category
 * Used for navigation breadcrumbs
 */
export interface CategoryBreadcrumb {
  /** Category identifier */
  id: string;
  /** Category name */
  name: string;
  /** Category URL slug */
  slug: string;
}
