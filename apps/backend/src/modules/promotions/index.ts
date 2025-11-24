import { Router } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';

const router: any = Router();

// GET /api/promotions - Active promotions (public)
router.get('/', async (_req: any, res: any, next: any) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { validFrom: null, validTo: null },
          { validFrom: { lte: now }, validTo: { gte: now } },
        ],
      },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: promotions });
  } catch (error) {
    next(error);
  }
});

// GET /api/promotions/admin - All promotions (admin)
router.get('/admin', authenticate, requireAdmin, async (_req: any, res: any, next: any) => {
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: promotions });
  } catch (error) {
    next(error);
  }
});

// POST /api/promotions - Create (admin)
router.post('/', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const { productIds, ...data } = req.body;
    const promotion = await prisma.promotion.create({
      data: {
        ...data,
        products: productIds ? { connect: productIds.map((id: string) => ({ id })) } : undefined,
      },
    });
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/promotions/:id - Update (admin)
router.patch('/:id', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const { productIds, ...data } = req.body;
    const promotion = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        ...data,
        products: productIds ? { set: productIds.map((id: string) => ({ id })) } : undefined,
      },
    });
    res.json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/promotions/:id - Delete (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    next(error);
  }
});

// POST /api/promotions/:id/products - Assign products (admin)
router.post('/:id/products', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

export default router;
