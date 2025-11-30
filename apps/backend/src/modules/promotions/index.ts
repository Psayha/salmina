import { Router } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { asyncHandler, TypedRequest } from '../../types/express.js';
import { paginate } from '../../utils/pagination.js';

const router: Router = Router();

// GET /api/promotions - Active promotions (public)
router.get('/', asyncHandler(async (_req: TypedRequest, res) => {
  const promotions = await prisma.promotion.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      products: {
        select: { id: true, name: true, slug: true, price: true, promotionPrice: true, discountPrice: true, images: true },
        take: 1, // Only first product for story thumbnail
      },
    },
  });
  res.json({ success: true, data: promotions });
}));

// GET /api/promotions/admin - All promotions (admin) with pagination
// MUST be before /:id route to avoid matching "admin" as an ID
router.get('/admin', authenticate, requireAdmin, asyncHandler(async (req: TypedRequest, res) => {
  const result = await paginate(
    prisma.promotion,
    { page: Number(req.query.page), limit: Number(req.query.limit) },
    undefined,
    {
      products: {
        select: { id: true, name: true, slug: true, price: true, images: true },
      },
      _count: {
        select: { products: true },
      },
    },
    { createdAt: 'desc' },
  );
  res.json({ success: true, ...result });
}));

// GET /api/promotions/:id - Get single promotion (public)
router.get('/:id', asyncHandler(async (req: TypedRequest<never, { id: string }>, res) => {
  const promotion = await prisma.promotion.findUnique({
    where: { id: req.params.id },
    include: {
      products: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!promotion) {
    res.status(404).json({ success: false, message: 'Promotion not found' });
    return;
  }

  res.json({ success: true, data: promotion });
}));

interface CreatePromotionBody {
  title: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  image: string;
  link?: string;
  order?: number;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  productIds?: string[];
}

// POST /api/promotions - Create (admin)
router.post('/', authenticate, requireAdmin, asyncHandler(async (req: TypedRequest<CreatePromotionBody>, res) => {
  const { productIds, ...data } = req.body;
  const promotion = await prisma.promotion.create({
    data: {
      ...data,
      products: productIds ? { connect: productIds.map((id: string) => ({ id })) } : undefined,
    },
  });
  res.status(201).json({ success: true, data: promotion });
}));

// PATCH /api/promotions/:id - Update (admin)
router.patch('/:id', authenticate, requireAdmin, asyncHandler(async (
  req: TypedRequest<Partial<CreatePromotionBody>, { id: string }>,
  res,
) => {
  const { productIds, ...data } = req.body;
  const promotion = await prisma.promotion.update({
    where: { id: req.params.id },
    data: {
      ...data,
      products: productIds ? { set: productIds.map((id: string) => ({ id })) } : undefined,
    },
  });
  res.json({ success: true, data: promotion });
}));

// DELETE /api/promotions/:id - Delete (admin)
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (
  req: TypedRequest<never, { id: string }>,
  res,
) => {
  await prisma.promotion.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Promotion deleted' });
}));

// POST /api/promotions/:id/products - Assign products (admin)
router.post('/:id/products', authenticate, requireAdmin, asyncHandler(async (
  req: TypedRequest<{ productIds: string[] }, { id: string }>,
  res,
) => {
  const { productIds } = req.body; // Array of product IDs
  const promotion = await prisma.promotion.update({
    where: { id: req.params.id },
    data: {
      products: {
        set: productIds.map((id: string) => ({ id })),
      },
    },
    include: {
      products: true,
    },
  });
  res.json({ success: true, data: promotion });
}));

export default router;
