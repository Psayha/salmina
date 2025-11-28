/**
 * @file upload.controller.ts
 * @description File upload controller
 */

import { Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Upload directory
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    logger.info(`Created upload directory: ${UPLOAD_DIR}`);
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitized = basename.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${sanitized}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

/**
 * Upload single file
 */
export async function uploadSingle(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    logger.info(`File uploaded: ${req.file.filename}`);

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
    });
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultiple(req: Request, res: Response) {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
      return;
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    logger.info(`${files.length} files uploaded`);

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files',
    });
  }
}

/**
 * List all uploaded files
 */
export async function listFiles(_req: Request, res: Response) {
  try {
    await ensureUploadDir();

    const files = await fs.readdir(UPLOAD_DIR);
    const fileStats = await Promise.all(
      files
        .filter((file) => !file.startsWith('.')) // Skip hidden files
        .map(async (filename) => {
          const filePath = path.join(UPLOAD_DIR, filename);
          try {
            const stat = await fs.stat(filePath);
            return {
              filename,
              url: `/uploads/${filename}`,
              size: stat.size,
              createdAt: stat.birthtime,
              modifiedAt: stat.mtime,
            };
          } catch {
            return null;
          }
        }),
    );

    // Filter out null values and sort by creation date (newest first)
    const validFiles = fileStats
      .filter((f): f is NonNullable<typeof f> => f !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    logger.info(`Listed ${validFiles.length} files`);

    res.json({
      success: true,
      data: {
        files: validFiles,
        total: validFiles.length,
      },
    });
  } catch (error) {
    logger.error('List files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list files',
    });
  }
}

/**
 * Delete file
 */
export async function deleteFile(req: Request, res: Response) {
  try {
    const { filename } = req.params;

    if (!filename) {
      res.status(400).json({
        success: false,
        error: 'Filename is required',
      });
      return;
    }

    // Security: prevent path traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    await fs.unlink(filePath);

    logger.info(`File deleted: ${sanitizedFilename}`);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
    });
  }
}
