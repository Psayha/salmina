import { Router } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { asyncHandler, TypedRequest } from '../../types/express.js';

export enum LegalDocumentType {
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  OFFER = 'OFFER',
  DELIVERY_PAYMENT = 'DELIVERY_PAYMENT',
}

const router: Router = Router();

interface LegalDocumentBody {
  type: LegalDocumentType;
  title: string;
  content: string;
  version: string;
  isActive?: boolean;
  publishedAt?: string;
}

// GET /api/legal - Get all active legal documents (public)
router.get('/', asyncHandler(async (_req: TypedRequest, res) => {
  const documents = await prisma.legalDocument.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' },
  });
  res.json({ success: true, data: documents });
}));

// GET /api/legal/:type - Get specific document type (public)
router.get('/:type', asyncHandler(async (req: TypedRequest<never, { type: string }>, res) => {
  const type = req.params.type.toUpperCase() as LegalDocumentType;
  const document = await prisma.legalDocument.findFirst({
    where: { type, isActive: true },
    orderBy: { publishedAt: 'desc' },
  });
  res.json({ success: true, data: document });
}));

// POST /api/legal - Create document (admin)
router.post('/', authenticate, requireAdmin, asyncHandler(async (req: TypedRequest<LegalDocumentBody>, res) => {
  const document = await prisma.legalDocument.create({ data: req.body });
  res.status(201).json({ success: true, data: document });
}));

// PATCH /api/legal/:id - Update document (admin)
router.patch('/:id', authenticate, requireAdmin, asyncHandler(async (
  req: TypedRequest<Partial<LegalDocumentBody>, { id: string }>,
  res,
) => {
  const document = await prisma.legalDocument.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: document });
}));

export default router;
