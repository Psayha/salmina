/**
 * @file upload.routes.ts
 * @description Upload routes
 */

import { Router } from 'express';
import { upload, uploadSingle, uploadMultiple, deleteFile } from './upload.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

// All upload routes require authentication
router.use(authenticateToken);

// Upload single file
router.post('/single', upload.single('file'), uploadSingle);

// Upload multiple files
router.post('/multiple', upload.array('files', 10), uploadMultiple);

// Delete file
router.delete('/:filename', deleteFile);

export default router;
