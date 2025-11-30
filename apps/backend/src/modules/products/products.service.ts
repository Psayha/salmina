/**
 * @file products.service.ts
 * @description Products service with business logic
 * @author AI Assistant
 * @created 2024-11-13
 */

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
   */
  async getAllProducts(params: ProductSearchParams): Promise<ProductsListResponse> {
    const { page, limit, sortBy = 'new', order = 'desc', filters = {}, query } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    const where = this.buildWhereClause(filters, query);
    const orderBy = this.buildOrderByClause(sortBy, order);

    logger.info(`Getting products list: page=${page}, limit=${limit}, sortBy=${sortBy}, order=${order}`);

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

    const productItems = products.map(toProductListItem);
    const pagination = this.calculatePagination(total, page, limit);

    logger.info(`Found ${total} products, returning ${products.length} items`);

    return {
      products: productItems,
      pagination,
    };
  }

  /**
   * Get product by slug and increment view count
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

    this.incrementViewCount(product.id).catch((error) => {
      logger.error(`Failed to increment view count for product ${product.id}:`, error);
    });

    return toProductDetail(product);
  }

  /**
   * Get product by ID
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
   * Get multiple products by IDs (bulk fetch for favorites)
   */
  async getProductsByIds(ids: string[]): Promise<ProductListItem[]> {
    logger.info(`Getting ${ids.length} products by IDs`);

    if (ids.length === 0) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
      include: { category: true },
    });

    logger.info(`Found ${products.length} products out of ${ids.length} requested`);

    return products.map(toProductListItem);
  }

  /**
   * Search products by query string
   */
  async searchProducts(params: ProductSearchParams): Promise<ProductsListResponse> {
    const { page, limit, sortBy = 'new', order = 'desc', filters = {}, query } = params;

    logger.info(`Searching products: query="${query}", page=${page}, limit=${limit}`);

    return this.getAllProducts({ page, limit, sortBy, order, filters, query });
  }

  /**
   * Get related products (same category)
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<ProductListItem[]> {
    logger.info(`Getting related products for: ${productId}, limit=${limit}`);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, isActive: true },
    });

    if (!product) {
      logger.warn(`Product not found: ${productId}`);
      throw new NotFoundError('Product', productId);
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: productId },
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
   */
  async createProduct(data: CreateProductDTO): Promise<ProductDetail> {
    logger.info(`Creating product: ${data.name}`);

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Category', data.categoryId);
    }

    await this.validateUniqueFields(data.slug, data.article, data.sku);
    this.validatePriceLogic(data);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        images: data.images,
        category: { connect: { id: data.categoryId } },
        price: data.price,
        promotionPrice: data.promotionPrice ?? null,
        discountPrice: data.discountPrice ?? null,
        article: data.article ?? null,
        sku: data.sku ?? null,
        weight: data.weight,
        dimensions: data.dimensions ?? null,
        quantity: data.quantity,
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
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<ProductDetail> {
    logger.info(`Updating product: ${id}`);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      logger.warn(`Product not found: ${id}`);
      throw new NotFoundError('Product', id);
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundError('Category', data.categoryId);
      }
    }

    if (data.slug || data.article || data.sku) {
      await this.validateUniqueFields(data.slug, data.article, data.sku, id);
    }

    const mergedData = { ...existingProduct, ...data };
    this.validatePriceLogic(mergedData);

    // Prepare update data - handle categoryId separately
    const { categoryId, ...restData } = data;
    const updateData: any = {
      ...restData,
      updatedAt: new Date(),
    };

    // Use category connect if categoryId is provided
    if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    }

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
   */
  async deleteProduct(id: string): Promise<{ success: boolean }> {
    logger.info(`Deleting product (soft): ${id}`);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      logger.warn(`Product not found: ${id}`);
      throw new NotFoundError('Product', id);
    }

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
   */
  async updateStock(id: string, quantity: number): Promise<ProductDetail> {
    logger.info(`Updating stock for product ${id}: quantity=${quantity}`);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      logger.warn(`Product not found: ${id}`);
      throw new NotFoundError('Product', id);
    }

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

  private async incrementViewCount(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  private buildWhereClause(filters: ProductFilters, query?: string): any {
    const where: any = {
      isActive: true,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.inStock === true) {
      where.quantity = { gt: 0 };
    }
    if (filters.lowStock === true) {
      where.quantity = { lte: 10, gt: 0 };
    }

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

  private buildOrderByClause(sortBy: string, order: string): any[] {
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

  private async validateUniqueFields(slug?: string, article?: string | null, sku?: string | null, excludeId?: string): Promise<void> {
    const where: any[] = [];

    if (slug) {
      where.push({ slug });
    }
    if (article) {
      where.push({ article });
    }
    if (sku) {
      where.push({ sku });
    }

    if (where.length === 0) {
      return;
    }

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

export const productsService = new ProductsService();
