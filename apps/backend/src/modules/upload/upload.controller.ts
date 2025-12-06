/**
 * @file upload.controller.ts
 * @description File upload controller with security hardening
 */

import { Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Upload directory
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// SECURITY: Whitelist of safe file extensions based on MIME type
// Never trust originalname extension - always derive from MIME
const MIME_TO_SAFE_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
};

// Magic bytes signatures for file type validation
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header, WebP has additional check
  'video/mp4': [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]], // ftyp box
  'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]], // EBML header
  'video/quicktime': [[0x00, 0x00, 0x00]], // MOV/QT
};

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    logger.info(`Created upload directory: ${UPLOAD_DIR}`);
  }
}

// Configure multer storage with secure filename generation
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // SECURITY FIX: Use cryptographically secure random bytes
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();

    // SECURITY FIX: Get extension from MIME type whitelist, NOT from originalname
    // This prevents double-extension attacks like "shell.jpg.php"
    const safeExt = MIME_TO_SAFE_EXT[file.mimetype];
    if (!safeExt) {
      // This shouldn't happen if fileFilter works correctly
      cb(new Error('Invalid MIME type'), '');
      return;
    }

    // Generate safe filename: timestamp-randomhex.ext
    cb(null, `${timestamp}-${randomBytes}${safeExt}`);
  },
});

// File filter - validate MIME type against whitelist
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // SECURITY: Only allow whitelisted MIME types
  if (MIME_TO_SAFE_EXT[file.mimetype]) {
    cb(null, true);
  } else {
    logger.warn(`Rejected file upload with invalid MIME type: ${file.mimetype}, original name: ${file.originalname}`);
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP images and MP4, WebM, MOV videos are allowed.'));
  }
};

// Multer upload instance with reduced file size limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max (reduced from 50MB for security)
    files: 10, // Max 10 files per request
  },
});

/**
 * Validate file magic bytes against expected MIME type
 * SECURITY: Prevents upload of files with spoofed MIME types
 */
async function validateMagicBytes(filePath: string, mimetype: string): Promise<boolean> {
  try {
    const signatures = MAGIC_BYTES[mimetype];
    if (!signatures) {
      // No signature defined, accept based on MIME only (already validated)
      return true;
    }

    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(16);
    await fileHandle.read(buffer, 0, 16, 0);
    await fileHandle.close();

    // Check if file starts with any of the valid signatures
    for (const signature of signatures) {
      let match = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }

    return false;
  } catch (error) {
    logger.error('Magic bytes validation error:', error);
    return false;
  }
}

/**
 * Upload single file with magic bytes validation
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

    const filePath = path.join(UPLOAD_DIR, req.file.filename);

    // SECURITY: Validate magic bytes to prevent MIME type spoofing
    const isValidMagic = await validateMagicBytes(filePath, req.file.mimetype);
    if (!isValidMagic) {
      // Delete the suspicious file
      await fs.unlink(filePath).catch(() => {});
      logger.warn(`Rejected file with invalid magic bytes: ${req.file.originalname}, claimed MIME: ${req.file.mimetype}`);
      res.status(400).json({
        success: false,
        error: 'File content does not match declared type',
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
 * Upload multiple files with magic bytes validation
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

    const validFiles: Array<{
      filename: string;
      url: string;
      size: number;
      mimetype: string;
    }> = [];
    const rejectedFiles: string[] = [];

    // SECURITY: Validate magic bytes for each file
    for (const file of req.files) {
      const filePath = path.join(UPLOAD_DIR, file.filename);
      const isValidMagic = await validateMagicBytes(filePath, file.mimetype);

      if (isValidMagic) {
        validFiles.push({
          filename: file.filename,
          url: `/uploads/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
        });
      } else {
        // Delete suspicious file
        await fs.unlink(filePath).catch(() => {});
        rejectedFiles.push(file.originalname);
        logger.warn(`Rejected file with invalid magic bytes: ${file.originalname}, claimed MIME: ${file.mimetype}`);
      }
    }

    if (validFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'All files were rejected due to invalid content',
      });
      return;
    }

    logger.info(`${validFiles.length} files uploaded, ${rejectedFiles.length} rejected`);

    res.json({
      success: true,
      data: validFiles,
      ...(rejectedFiles.length > 0 && {
        warning: `${rejectedFiles.length} file(s) were rejected due to invalid content`
      }),
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
