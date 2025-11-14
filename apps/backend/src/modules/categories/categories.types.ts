/**
 * @file categories.types.ts
 * @description TypeScript types for categories module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Category } from '@prisma/client';

/**
 * Category DTO (Data Transfer Object)
 */
export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  order: number;
  image: string | null;
  showOnHome: boolean;
  homeOrder: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category tree node with children
 */
export interface CategoryTree extends CategoryDTO {
  children: CategoryTree[];
  productCount?: number;
}

/**
 * Category with product count
 */
export interface CategoryWithCount extends CategoryDTO {
  productCount: number;
}

/**
 * Create category DTO
 */
export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order?: number;
  image?: string;
  showOnHome?: boolean;
  homeOrder?: number;
}

/**
 * Update category DTO
 */
export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  order?: number;
  image?: string | null;
  showOnHome?: boolean;
  homeOrder?: number | null;
  isActive?: boolean;
}

/**
 * Convert Prisma Category to CategoryDTO
 */
export function toCategoryDTO(category: Category): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    order: category.order,
    image: category.image,
    showOnHome: category.showOnHome,
    homeOrder: category.homeOrder,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
