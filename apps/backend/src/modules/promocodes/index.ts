import { Router } from 'express';
import { prisma } from '../../database/prisma.service';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware';
import { NotFoundError } from '../../common/errors/AppError';

const router: any = Router();

// GET /api/promocodes - List all (admin)
router.get('/', authenticate, requireAdmin, async (_req: any, res: any, next: any) => {
  try {
    const promocodes = await prisma.promocode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: promocodes });
  } catch (error) { next(error); }
});

// POST /api/promocodes - Create (admin)
router.post('/', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const promocode = await prisma.promocode.create({ data: req.body });
    res.status(201).json({ success: true, data: promocode });
  } catch (error) { next(error); }
});

// PATCH /api/promocodes/:id - Update (admin)
router.patch('/:id', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const promocode = await prisma.promocode.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: promocode });
  } catch (error) { next(error); }
});

// DELETE /api/promocodes/:id - Delete (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    await prisma.promocode.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Promocode deleted' });
  } catch (error) { next(error); }
});

// POST /api/promocodes/validate - Validate code (public)
router.post('/validate', async (req: any, res: any, next: any) => {
  try {
    const { code } = req.body;
    const promocode = await prisma.promocode.findFirst({
      where: {
        code,
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
    });
    if (!promocode) throw new NotFoundError('Promocode', code);
    res.json({ success: true, data: { valid: true, discount: promocode.discountValue, type: promocode.discountType } });
  } catch (error) { next(error); }
});

export default router;
