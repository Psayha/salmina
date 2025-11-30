import { Router } from 'express';
import { LegalDocumentType } from '@prisma/client';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { asyncHandler, TypedRequest } from '../../types/express.js';

export { LegalDocumentType };

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

// GET /api/legal/all - Get ALL legal documents including inactive (admin)
router.get('/all', authenticate, requireAdmin, asyncHandler(async (_req: TypedRequest, res) => {
  const documents = await prisma.legalDocument.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ success: true, data: documents });
}));

// GET /api/legal/admin/:type - Get specific document type regardless of status (admin)
// Must be before /:type to avoid route conflict
router.get('/admin/:type', authenticate, requireAdmin, asyncHandler(async (req: TypedRequest<never, { type: string }>, res) => {
  const type = req.params.type.toUpperCase() as LegalDocumentType;
  const document = await prisma.legalDocument.findFirst({
    where: { type },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ success: true, data: document });
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

// POST /api/legal - Create or update document (admin) - upsert by type
router.post('/', authenticate, requireAdmin, asyncHandler(async (req: TypedRequest<LegalDocumentBody>, res) => {
  const { type, ...data } = req.body;

  // Check if document with this type already exists
  const existing = await prisma.legalDocument.findFirst({
    where: { type },
  });

  let document;
  if (existing) {
    // Update existing document
    document = await prisma.legalDocument.update({
      where: { id: existing.id },
      data: { type, ...data },
    });
  } else {
    // Create new document
    document = await prisma.legalDocument.create({
      data: { type, ...data },
    });
  }

  res.status(existing ? 200 : 201).json({ success: true, data: document });
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
