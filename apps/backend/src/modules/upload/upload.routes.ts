/**
 * @file upload.routes.ts
 * @description Upload routes
 */

import { Router } from 'express';
import { upload, uploadSingle, uploadMultiple, deleteFile } from './upload.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Upload single file
router.post('/single', upload.single('file'), uploadSingle);

// Upload multiple files
router.post('/multiple', upload.array('files', 10), uploadMultiple);

// Delete file
router.delete('/:filename', deleteFile);

export default router;
