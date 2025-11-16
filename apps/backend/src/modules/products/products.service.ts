/**
 * @file products.service.ts
 * @description Products service with business logic
 * @author AI Assistant
 * @created 2024-11-13
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.service.js';
import {
  ProductListItem,
  ProductDetail,
  ProductsListResponse,
  PaginationMeta,
  ProductSearchParams,
  ProductFilters,
  CreateProductDTO,
  UpdateProductDTO,
  toProductListItem,
  toProductDetail,
} from './products.types.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/AppError.js';
import { logger } from '../../utils/logger.js';

/**
 * Products Service
 * Handles products business logic with Clean Architecture principles
 */
export class ProductsService {
  /**
   * Get all products with pagination, filters, and search
   *
   * @param params - Search parameters including pagination, filters, and sorting
   * @returns Paginated list of products
   */
  async getAllProducts(params: ProductSearchParams): Promise<ProductsListResponse> {
    const { page, limit, sortBy = 'new', order = 'desc', filters = {}, query } = params;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where = this.buildWhereClause(filters, query);

    // Build order by clause
    const orderBy = this.buildOrderByClause(sortBy, order);

    logger.info(`Getting products list: page=${page}, limit=${limit}, sortBy=${sortBy}, order=${order}`);

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform to response format
    const productItems = products.map(toProductListItem);

    // Calculate pagination metadata
    const pagination = this.calculatePagination(total, page, limit);

    logger.info(`Found ${total} products, returning ${products.length} items`);

    return {
      products: productItems,
      pagination,
    };
  }

  /**
   * Get product by slug and increment view count
   *
   * @param slug - Product slug
   * @returns Product details
   * @throws {NotFoundError} If product not found
   */
  async getProductBySlug(slug: string): Promise<ProductDetail> {
    logger.info(`Getting product by slug: ${slug}`);

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) {
      logger.warn(`Product not found: ${slug}`);
      throw new NotFoundError('Product', slug);
    }

    if (!product.isActive) {
      logger.warn(`Inactive product accessed: ${slug}`);
      throw new NotFoundError('Product', slug);
    }

    // Increment view count asynchronously (don't wait)
    this.incrementViewCount(product.id).catch((error) => {
      logger.error(`Failed to increment view count for product ${product.id}:`, error);
    });

    return toProductDetail(product);
  }

  /**
   * Get product by ID
   *
   * @param id - Product ID
   * @returns Product details
   * @throws {NotFoundError} If product not found
   */
  async getProductById(id: string): Promise<ProductDetail> {
    logger.info(`Getting product by ID: ${id}`);

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      logger.warn(`Product not found: ${id}`);
      throw new NotFoundError('Product', id);
    }

    return toProductDetail(product);
  }

  /**
   * Search products by query string
   *
   * @param params - Search parameters
   * @returns Paginated list of products
   */
  async searchProducts(params: ProductSearchParams): Promise<ProductsListResponse> {
    const { page, limit, sortBy = 'new', order = 'desc', filters = {}, query } = params;

    logger.info(`Searching products: query="${query}", page=${page}, limit=${limit}`);

    return this.getAllProducts({ page, limit, sortBy, order, filters, query });
  }

  /**
   * Get related products (same category)
   *
   * @param productId - Product ID
   * @param limit - Maximum number of related products
   * @returns List of related products
   * @throws {NotFoundError} If product not found
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<ProductListItem[]> {
    logger.info(`Getting related products for: ${productId}, limit=${limit}`);

    // Get the product to find its category
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, isActive: true },
    });

    if (!product) {
      logger.warn(`Product not found: ${productId}`);
      throw new NotFoundError('Product', productId);
    }

    // Find related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: productId }, // Exclude the current product
      },
      orderBy: [{ orderCount: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: { category: true },
    });

    logger.info(`Found ${relatedProducts.length} related products`);

    return relatedProducts.map(toProductListItem);
  }

  /**
   * Create a new product (admin only)
   *
   * @param data - Product creation data
   * @returns Created product
   * @throws {ConflictError} If slug, article, or SKU already exists
   * @throws {NotFoundError} If category not found
   */
  async createProduct(data: CreateProductDTO): Promise<ProductDetail> {
    logger.info(`Creating product: ${data.name}`);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Category', data.categoryId);
    }

    // Check for unique constraints
    await this.validateUniqueFields(data.slug, data.article, data.sku);

    // Validate price logic
    this.validatePriceLogic(data);

    // Create product
    const product = await prisma.product.create({
      data: {
        ...data,
        price: data.price,
        promotionPrice: data.promotionPrice ?? null,
        discountPrice: data.discountPrice ?? null,
        weight: data.weight,
        dimensions: data.dimensions ?? null,
        composition: data.composition ?? null,
        delivery: data.delivery ?? null,
        characteristics: (data.characteristics as any) ?? null,
        application: data.application ?? null,
        isNew: data.isNew ?? false,
        isHit: data.isHit ?? false,
        isDiscount: data.isDiscount ?? false,
        hasPromotion: data.hasPromotion ?? false,
        isActive: data.isActive ?? true,
      },
      include: { category: true },
    });

    logger.info(`Product created: ${product.id}`);

    return toProductDetail(product);
  }

  /**
   * Update a product (admin only)
   *
   * @param id - Product ID
   * @param data - Product update data
   * @returns Updated product
   * @throws {NotFoundError} If product not found
   * @throws {ConflictError} If slug, article, or SKU already exists
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<ProductDetail> {
    logger.info(`Updating product: ${id}`);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      logger.warn(`Product not found: ${id}`);
      throw new NotFoundError('Product', id);
    }

    // If category is being updated, check if it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundError('Category', data.categoryId);
      }
    }

    // Check for unique constraints (only if fields are being updated)
    if (data.slug || data.article || data.sku) {
      await this.validateUniqueFields(data.slug, data.article, data.sku, id);
    }

    // Validate price logic with merged data
    const mergedData = { ...existingProduct, ...data };
    this.validatePriceLogic(mergedData);

    // Update product
    const updateData: any = { ...data };
    if (updateData.characteristics !== undefined) {
      updateData.characteristics = updateData.characteristics as any;
    }
    updateData.updatedAt = new Date();

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    logger.info(`Product updated: ${id}`);

    return toProductDetail(product);
  }

  /**
   * Delete a product (soft delete - set isActive to false)
   *
   * @param id - Product ID
   * @returns Success status
   * @throws {NotFoundError} If product not found
   */
  async deleteProduct(id: string): Promise<{ success: boolean }> {
    logger.info(`Deleting product (soft): ${id}`);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      logger.warn(`Product not found: ${id}`);
      throw new NotFoundError('Product', id);
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    logger.info(`Product soft deleted: ${id}`);

    return { success: true };
  }

  /**
   * Update product stock quantity
   *
   * @param id - Product ID
   * @param quantity - New quantity
   * @returns Updated product
   * @throws {NotFoundError} If product not found
   */
  async updateStock(id: string, quantity: number): Promise<ProductDetail> {
    logger.info(`Updating stock for product ${id}: quantity=${quantity}`);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      logger.warn(`Product not found: ${id}`);
      throw new NotFoundError('Product', id);
    }

    // Update quantity
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        quantity,
        updatedAt: new Date(),
      },
      include: { category: true },
    });

    logger.info(`Stock updated for product ${id}: ${quantity}`);

    return toProductDetail(updatedProduct);
  }

  /**
   * Increment view count for a product (async, non-blocking)
   *
   * @param id - Product ID
   * @private
   */
  private async incrementViewCount(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  /**
   * Build Prisma where clause from filters and search query
   *
   * @param filters - Product filters
   * @param query - Search query
   * @returns Prisma where clause
   * @private
   */
  private buildWhereClause(filters: ProductFilters, query?: string): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    // Stock filters
    if (filters.inStock === true) {
      where.quantity = { gt: 0 };
    }
    if (filters.lowStock === true) {
      where.quantity = { lte: 10, gt: 0 };
    }

    // Badge filters
    if (filters.isNew === true) {
      where.isNew = true;
    }
    if (filters.isHit === true) {
      where.isHit = true;
    }
    if (filters.isDiscount === true) {
      where.isDiscount = true;
    }
    if (filters.hasPromotion === true) {
      where.hasPromotion = true;
    }

    // Search query (search across multiple fields)
    if (query && query.trim().length > 0) {
      const searchTerm = query.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { article: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { composition: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Build Prisma orderBy clause from sort parameters
   *
   * @param sortBy - Sort field
   * @param order - Sort order
   * @returns Prisma orderBy clause
   * @private
   */
  private buildOrderByClause(sortBy: string, order: string): Prisma.ProductOrderByWithRelationInput[] {
    const orderDirection = order === 'asc' ? 'asc' : 'desc';

    switch (sortBy) {
      case 'price':
        return [{ price: orderDirection }];
      case 'popular':
        return [{ orderCount: orderDirection }, { viewCount: orderDirection }, { createdAt: 'desc' }];
      case 'new':
        return [{ createdAt: orderDirection }];
      case 'name':
        return [{ name: orderDirection }];
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  /**
   * Calculate pagination metadata
   *
   * @param total - Total number of items
   * @param page - Current page
   * @param limit - Items per page
   * @returns Pagination metadata
   * @private
   */
  private calculatePagination(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Validate unique fields (slug, article, SKU)
   *
   * @param slug - Product slug
   * @param article - Product article
   * @param sku - Product SKU
   * @param excludeId - Product ID to exclude from check (for updates)
   * @throws {ConflictError} If any field already exists
   * @private
   */
  private async validateUniqueFields(
    slug?: string,
    article?: string,
    sku?: string,
    excludeId?: string,
  ): Promise<void> {
    const where: Prisma.ProductWhereInput[] = [];

    if (slug) {
      where.push({ slug });
    }
    if (article) {
      where.push({ article });
    }
    if (sku) {
      where.push({ sku });
    }

    if (where.length === 0) return;

    const existing = await prisma.product.findFirst({
      where: {
        OR: where,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { slug: true, article: true, sku: true },
    });

    if (existing) {
      if (slug && existing.slug === slug) {
        throw new ConflictError(`Product with slug '${slug}' already exists`);
      }
      if (article && existing.article === article) {
        throw new ConflictError(`Product with article '${article}' already exists`);
      }
      if (sku && existing.sku === sku) {
        throw new ConflictError(`Product with SKU '${sku}' already exists`);
      }
    }
  }

  /**
   * Validate price logic (promotionPrice and discountPrice must be less than price)
   *
   * @param data - Product data with prices
   * @throws {BadRequestError} If price logic is invalid
   * @private
   */
  private validatePriceLogic(data: {
    price: number | any;
    promotionPrice?: number | null | any;
    discountPrice?: number | null | any;
    hasPromotion?: boolean;
    isDiscount?: boolean;
  }): void {
    const price = typeof data.price === 'number' ? data.price : Number(data.price);
    const promotionPrice = data.promotionPrice ? Number(data.promotionPrice) : null;
    const discountPrice = data.discountPrice ? Number(data.discountPrice) : null;

    if (data.hasPromotion && !promotionPrice) {
      throw new BadRequestError('Promotion price is required when hasPromotion is true');
    }

    if (data.isDiscount && !discountPrice) {
      throw new BadRequestError('Discount price is required when isDiscount is true');
    }

    if (promotionPrice && promotionPrice >= price) {
      throw new BadRequestError('Promotion price must be less than regular price');
    }

    if (discountPrice && discountPrice >= price) {
      throw new BadRequestError('Discount price must be less than regular price');
    }
  }
}

// Export singleton instance
export const productsService = new ProductsService();
