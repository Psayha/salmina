import { Router } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { asyncHandler, TypedRequest } from '../../types/express.js';
import { DiscountType } from '@prisma/client';

const router = Router();

interface CreatePromocodeBody {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  isActive?: boolean;
  validFrom: string;
  validTo: string;
}

// GET /api/promocodes - List all (admin)
router.get('/', authenticate, requireAdmin, asyncHandler(async (_req: TypedRequest, res) => {
  const promocodes = await prisma.promocode.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: promocodes });
}));

// POST /api/promocodes - Create (admin)
router.post('/', authenticate, requireAdmin, asyncHandler(async (req: TypedRequest<CreatePromocodeBody>, res) => {
  const promocode = await prisma.promocode.create({ data: req.body });
  res.status(201).json({ success: true, data: promocode });
}));

// PATCH /api/promocodes/:id - Update (admin)
router.patch('/:id', authenticate, requireAdmin, asyncHandler(async (
  req: TypedRequest<Partial<CreatePromocodeBody>, { id: string }>,
  res
) => {
  const promocode = await prisma.promocode.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: promocode });
}));

// DELETE /api/promocodes/:id - Delete (admin)
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (
  req: TypedRequest<never, { id: string }>,
  res
) => {
  await prisma.promocode.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Promocode deleted' });
}));

// POST /api/promocodes/validate - Validate code (public)
router.post('/validate', asyncHandler(async (req: TypedRequest<{ code: string }>, res) => {
  const { code } = req.body;
  const promocode = await prisma.promocode.findFirst({
    where: {
      code,
      isActive: true,
      validFrom: { lte: new Date() },
      validTo: { gte: new Date() },
    },
  });

  if (!promocode) {
    throw new NotFoundError('Promocode', code);
  }

  res.json({
    success: true,
    data: {
      valid: true,
      discount: promocode.discountValue,
      type: promocode.discountType,
    },
  });
}));

export default router;
