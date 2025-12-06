/**
 * @file trash.routes.ts
 * @description Routes for managing soft-deleted items (trash bin)
 */

import { Router } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { asyncHandler, TypedRequest } from '../../types/express.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { logger } from '../../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

const router: Router = Router();

// Upload directory for file deletion
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

/**
 * Delete a file from uploads directory
 */
async function deleteUploadedFile(fileUrl: string): Promise<void> {
  try {
    // Extract filename from URL (e.g., /uploads/abc123.jpg -> abc123.jpg)
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_DIR, filename);

    await fs.unlink(filePath);
    logger.info(`Deleted file: ${filename}`);
  } catch (error) {
    // Ignore errors if file doesn't exist
    logger.warn(`Could not delete file: ${fileUrl}`, error);
  }
}

// All routes require admin authentication
router.use(authenticate, requireAdmin);

/**
 * GET /api/trash - Get all deleted items
 */
router.get('/', asyncHandler(async (_req: TypedRequest, res) => {
  logger.info('Fetching deleted items');

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: false },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: false },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  res.json({
    success: true,
    data: {
      products: products.map(p => ({
        id: p.id,
        type: 'product',
        name: p.name,
        slug: p.slug,
        image: p.images[0] || null,
        categoryName: p.category?.name || 'Без категории',
        deletedAt: p.updatedAt,
      })),
      categories: categories.map(c => ({
        id: c.id,
        type: 'category',
        name: c.name,
        slug: c.slug,
        image: c.image,
        deletedAt: c.updatedAt,
      })),
    },
  });
}));

/**
 * GET /api/trash/count - Get count of deleted items
 */
router.get('/count', asyncHandler(async (_req: TypedRequest, res) => {
  const [productsCount, categoriesCount] = await Promise.all([
    prisma.product.count({ where: { isActive: false } }),
    prisma.category.count({ where: { isActive: false } }),
  ]);

  res.json({
    success: true,
    data: {
      products: productsCount,
      categories: categoriesCount,
      total: productsCount + categoriesCount,
    },
  });
}));

/**
 * POST /api/trash/restore/product/:id - Restore a deleted product
 */
router.post('/restore/product/:id', asyncHandler(async (req: TypedRequest<never, { id: string }>, res) => {
  const { id } = req.params;
  logger.info(`Restoring product: ${id}`);

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError('Product', id);
  }

  if (product.isActive) {
    res.json({ success: true, message: 'Product is already active' });
    return;
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: true, updatedAt: new Date() },
  });

  logger.info(`Product restored: ${id}`);
  res.json({ success: true, message: 'Product restored successfully' });
}));

/**
 * POST /api/trash/restore/category/:id - Restore a deleted category
 */
router.post('/restore/category/:id', asyncHandler(async (req: TypedRequest<never, { id: string }>, res) => {
  const { id } = req.params;
  logger.info(`Restoring category: ${id}`);

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError('Category', id);
  }

  if (category.isActive) {
    res.json({ success: true, message: 'Category is already active' });
    return;
  }

  await prisma.category.update({
    where: { id },
    data: { isActive: true, updatedAt: new Date() },
  });

  logger.info(`Category restored: ${id}`);
  res.json({ success: true, message: 'Category restored successfully' });
}));

/**
 * DELETE /api/trash/product/:id - Permanently delete a product
 */
router.delete('/product/:id', asyncHandler(async (req: TypedRequest<never, { id: string }>, res) => {
  const { id } = req.params;
  logger.info(`Permanently deleting product: ${id}`);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      cartItems: true,
      orderItems: true,
      favorites: true,
    },
  });

  if (!product) {
    throw new NotFoundError('Product', id);
  }

  // Delete related records first
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.favorite.deleteMany({ where: { productId: id } }),
    // Note: orderItems are kept for order history
    prisma.product.delete({ where: { id } }),
  ]);

  // Delete associated images/videos from filesystem
  if (product.images && product.images.length > 0) {
    logger.info(`Deleting ${product.images.length} files for product: ${id}`);
    await Promise.all(product.images.map(deleteUploadedFile));
  }

  logger.info(`Product permanently deleted: ${id}`);
  res.json({ success: true, message: 'Product permanently deleted' });
}));

/**
 * DELETE /api/trash/category/:id - Permanently delete a category
 */
router.delete('/category/:id', asyncHandler(async (req: TypedRequest<never, { id: string }>, res) => {
  const { id } = req.params;
  logger.info(`Permanently deleting category: ${id}`);

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: { where: { isActive: true } },
      children: true,
    },
  });

  if (!category) {
    throw new NotFoundError('Category', id);
  }

  // Check if category has active products
  if (category.products.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Cannot permanently delete category with active products',
    });
    return;
  }

  // Check if category has children
  if (category.children.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Cannot permanently delete category with child categories',
    });
    return;
  }

  await prisma.category.delete({ where: { id } });

  logger.info(`Category permanently deleted: ${id}`);
  res.json({ success: true, message: 'Category permanently deleted' });
}));

/**
 * DELETE /api/trash/empty - Empty the entire trash (permanent delete all)
 */
router.delete('/empty', asyncHandler(async (_req: TypedRequest, res) => {
  logger.info('Emptying trash');

  // Get all deleted products with their images
  const deletedProducts = await prisma.product.findMany({
    where: { isActive: false },
    select: { id: true, images: true },
  });

  const deletedCategories = await prisma.category.findMany({
    where: { isActive: false },
    include: {
      products: { where: { isActive: true } },
      children: { where: { isActive: true } },
    },
  });

  // Filter categories that can be safely deleted (no active products/children)
  const safeToDeleteCategories = deletedCategories.filter(
    c => c.products.length === 0 && c.children.length === 0
  );

  const productIds = deletedProducts.map(p => p.id);
  const categoryIds = safeToDeleteCategories.map(c => c.id);

  // Collect all images/videos to delete
  const allFiles: string[] = [];
  deletedProducts.forEach(p => {
    if (p.images && p.images.length > 0) {
      allFiles.push(...p.images);
    }
  });

  // Delete in transaction
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } }),
    prisma.favorite.deleteMany({ where: { productId: { in: productIds } } }),
    prisma.product.deleteMany({ where: { id: { in: productIds } } }),
    prisma.category.deleteMany({ where: { id: { in: categoryIds } } }),
  ]);

  // Delete files from filesystem
  if (allFiles.length > 0) {
    logger.info(`Deleting ${allFiles.length} files from trash`);
    await Promise.all(allFiles.map(deleteUploadedFile));
  }

  logger.info(`Trash emptied: ${productIds.length} products, ${categoryIds.length} categories`);
  res.json({
    success: true,
    message: 'Trash emptied successfully',
    data: {
      deletedProducts: productIds.length,
      deletedCategories: categoryIds.length,
    },
  });
}));

export default router;
