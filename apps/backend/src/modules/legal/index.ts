import { Router } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { LegalDocumentType } from '@prisma/client';

const router: any = Router();

// GET /api/legal - Get all active legal documents (public)
router.get('/', async (_req: any, res: any, next: any) => {
  try {
    const documents = await prisma.legalDocument.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json({ success: true, data: documents });
  } catch (error) {
 next(error); 
}
});

// GET /api/legal/:type - Get specific document type (public)
router.get('/:type', async (req: any, res: any, next: any) => {
  try {
    const type = req.params.type.toUpperCase() as LegalDocumentType;
    const document = await prisma.legalDocument.findFirst({
      where: { type, isActive: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json({ success: true, data: document });
  } catch (error) {
 next(error); 
}
});

// POST /api/legal - Create document (admin)
router.post('/', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const document = await prisma.legalDocument.create({ data: req.body });
    res.status(201).json({ success: true, data: document });
  } catch (error) {
 next(error); 
}
});

// PATCH /api/legal/:id - Update document (admin)
router.patch('/:id', authenticate, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const document = await prisma.legalDocument.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: document });
  } catch (error) {
 next(error); 
}
});

export default router;
