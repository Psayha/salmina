/**
 * @file backup.routes.ts
 * @description Backup API routes (admin only)
 */

import { Router } from 'express';
import { asyncHandler, TypedRequest } from '../../types/express.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { backupService } from './backup.service.js';
import { logger } from '../../utils/logger.js';

const router: Router = Router();

// All backup routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/backups - Get backup status and list
 */
router.get('/', asyncHandler(async (_req, res) => {
  const status = await backupService.getStatus();
  res.json({ success: true, data: status });
}));

/**
 * POST /api/backups - Create new backup
 */
router.post('/', asyncHandler(async (_req, res) => {
  logger.info('Manual backup triggered by admin');
  const filename = await backupService.createBackup();
  res.json({
    success: true,
    message: 'Backup created successfully',
    data: { filename },
  });
}));

/**
 * DELETE /api/backups/:filename - Delete a backup
 */
router.delete('/:filename', asyncHandler(async (
  req: TypedRequest<never, { filename: string }>,
  res
) => {
  const { filename } = req.params;
  await backupService.deleteBackup(filename);
  res.json({
    success: true,
    message: 'Backup deleted successfully',
  });
}));

/**
 * POST /api/backups/:filename/restore - Restore from backup (dangerous!)
 */
router.post('/:filename/restore', asyncHandler(async (
  req: TypedRequest<never, { filename: string }>,
  res
) => {
  const { filename } = req.params;
  logger.warn(`Restore triggered for backup: ${filename}`);
  await backupService.restoreBackup(filename);
  res.json({
    success: true,
    message: 'Backup restored successfully',
  });
}));

export default router;
