/**
 * @file categories.service.ts
 * @description Business logic for categories
 * @author AI Assistant
 * @created 2024-11-13
 */

import { prisma } from '../../database/prisma.service.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/AppError.js';
import { logger } from '../../utils/logger.js';
import {
  CategoryDTO,
  CategoryTree,
  CategoryWithCount,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  toCategoryDTO,
  Category,
} from './categories.types.js';

/**
 * Category with product count
 */
interface CategoryWithCountPayload extends Category {
  _count: {
    products: number;
  };
}

class CategoriesService {
  /**
   * Get all categories as tree structure
   */
  async getCategoriesTree(): Promise<CategoryTree[]> {
    logger.info('Getting categories tree');

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Build tree structure
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    // First pass: create all nodes
    categories.forEach((cat: CategoryWithCountPayload) => {
      categoryMap.set(cat.id, {
        ...toCategoryDTO(cat),
        children: [],
        productCount: cat._count.products,
      });
    });

    // Second pass: build tree
    categories.forEach((cat: CategoryWithCountPayload) => {
      const node = categoryMap.get(cat.id);
      if (!node) {
        return;
      }

      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }

  /**
   * Get categories for home page
   */
  async getHomeCategories(): Promise<CategoryWithCount[]> {
    logger.info('Getting home page categories');

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        showOnHome: true,
      },
      orderBy: { homeOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return categories.map((cat: CategoryWithCountPayload) => ({
      ...toCategoryDTO(cat),
      productCount: cat._count.products,
    }));
  }

  /**
   * Get category by slug with products
   */
  async getCategoryBySlug(slug: string): Promise<CategoryTree> {
    logger.info(`Getting category by slug: ${slug}`);

    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Category', slug);
    }

    return {
      ...toCategoryDTO(category),
      children: category.children.map((child: Category) => ({
        ...toCategoryDTO(child),
        children: [],
      })),
      productCount: category._count.products,
    };
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<CategoryDTO> {
    logger.info(`Getting category by ID: ${id}`);

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Category', id);
    }

    return toCategoryDTO(category);
  }

  /**
   * Create new category (admin only)
   */
  async createCategory(data: CreateCategoryDTO): Promise<CategoryDTO> {
    logger.info('Creating new category', { name: data.name });

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictError(`Category with slug '${data.slug}' already exists`);
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundError('Parent category', data.parentId);
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId || null,
        order: data.order ?? 0,
        image: data.image || null,
        showOnHome: data.showOnHome ?? false,
        homeOrder: data.homeOrder || null,
      },
    });

    logger.info(`Category created: ${category.id}`);

    return toCategoryDTO(category);
  }

  /**
   * Update category (admin only)
   */
  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> {
    logger.info(`Updating category: ${id}`);

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Category', id);
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new ConflictError(`Category with slug '${data.slug}' already exists`);
      }
    }

    // Validate parent exists if changing
    if (data.parentId) {
      // Prevent self-referencing
      if (data.parentId === id) {
        throw new BadRequestError('Category cannot be its own parent');
      }

      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundError('Parent category', data.parentId);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.showOnHome !== undefined && { showOnHome: data.showOnHome }),
        ...(data.homeOrder !== undefined && { homeOrder: data.homeOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    logger.info(`Category updated: ${id}`);

    return toCategoryDTO(category);
  }

  /**
   * Delete category (admin only)
   */
  async deleteCategory(id: string): Promise<void> {
    logger.info(`Deleting category: ${id}`);

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundError('Category', id);
    }

    // Check if has children
    if (category.children.length > 0) {
      throw new BadRequestError('Cannot delete category with child categories');
    }

    // Check if has products
    if (category.products.length > 0) {
      throw new BadRequestError('Cannot delete category with products');
    }

    await prisma.category.delete({
      where: { id },
    });

    logger.info(`Category deleted: ${id}`);
  }
}

export const categoriesService = new CategoriesService();
