/**
 * @file backup.service.ts
 * @description Database backup service
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

const execAsync = promisify(exec);

export interface BackupInfo {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  age: string;
}

export interface BackupStatus {
  enabled: boolean;
  lastBackup: string | null;
  nextBackup: string | null;
  backupCount: number;
  totalSize: string;
  backups: BackupInfo[];
}

class BackupService {
  private backupDir: string;
  private maxBackups: number = 7; // Keep last 7 backups

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
  }

  /**
   * Ensure backup directory exists
   */
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * Format file size
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  /**
   * Format age of backup
   */
  private formatAge(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    return `${diffDays} дн назад`;
  }

  /**
   * Create a database backup
   */
  async createBackup(): Promise<string> {
    await this.ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql.gz`;
    const filepath = path.join(this.backupDir, filename);

    // Parse DATABASE_URL
    const dbUrl = new URL(env.DATABASE_URL);
    const host = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const database = dbUrl.pathname.slice(1);
    const user = dbUrl.username;
    const password = dbUrl.password;

    // Create backup using pg_dump
    const command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F c | gzip > ${filepath}`;

    try {
      logger.info(`Creating backup: ${filename}`);
      await execAsync(command, { shell: '/bin/bash' });

      // Verify backup was created
      const stats = await fs.stat(filepath);
      if (stats.size < 100) {
        throw new Error('Backup file is too small, might be empty');
      }

      logger.info(`Backup created successfully: ${filename} (${this.formatSize(stats.size)})`);

      // Cleanup old backups
      await this.cleanupOldBackups();

      return filename;
    } catch (error) {
      logger.error('Backup failed:', error);
      // Try to remove failed backup file
      try {
        await fs.unlink(filepath);
      } catch {
        // Ignore
      }
      throw error;
    }
  }

  /**
   * Remove old backups keeping only the last N
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.sql.gz'));

      if (backupFiles.length <= this.maxBackups) return;

      // Sort by name (timestamp) descending
      backupFiles.sort().reverse();

      // Remove old backups
      const toDelete = backupFiles.slice(this.maxBackups);
      for (const file of toDelete) {
        await fs.unlink(path.join(this.backupDir, file));
        logger.info(`Deleted old backup: ${file}`);
      }
    } catch (error) {
      logger.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Get list of all backups
   */
  async getBackups(): Promise<BackupInfo[]> {
    await this.ensureBackupDir();

    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.sql.gz'));

      const backups: BackupInfo[] = [];

      for (const filename of backupFiles) {
        const filepath = path.join(this.backupDir, filename);
        const stats = await fs.stat(filepath);

        // Parse timestamp from filename
        const match = filename.match(/backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        const createdAt = match
          ? new Date(match[1].replace(/-/g, (m, i) => (i > 9 ? ':' : m)))
          : stats.birthtime;

        backups.push({
          filename,
          size: stats.size,
          sizeFormatted: this.formatSize(stats.size),
          createdAt: createdAt.toISOString(),
          age: this.formatAge(createdAt),
        });
      }

      // Sort by date descending (newest first)
      backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return backups;
    } catch (error) {
      logger.error('Failed to get backups:', error);
      return [];
    }
  }

  /**
   * Get backup status
   */
  async getStatus(): Promise<BackupStatus> {
    const backups = await this.getBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    return {
      enabled: true,
      lastBackup: backups.length > 0 ? backups[0].createdAt : null,
      nextBackup: this.getNextBackupTime(),
      backupCount: backups.length,
      totalSize: this.formatSize(totalSize),
      backups,
    };
  }

  /**
   * Calculate next backup time (daily at 3:00 AM)
   */
  private getNextBackupTime(): string {
    const now = new Date();
    const next = new Date(now);
    next.setHours(3, 0, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toISOString();
  }

  /**
   * Restore from backup (dangerous!)
   */
  async restoreBackup(filename: string): Promise<void> {
    const filepath = path.join(this.backupDir, filename);

    // Validate filename
    if (!filename.startsWith('backup-') || !filename.endsWith('.sql.gz')) {
      throw new Error('Invalid backup filename');
    }

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      throw new Error('Backup file not found');
    }

    // Parse DATABASE_URL
    const dbUrl = new URL(env.DATABASE_URL);
    const host = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const database = dbUrl.pathname.slice(1);
    const user = dbUrl.username;
    const password = dbUrl.password;

    // Restore using pg_restore
    const command = `gunzip -c ${filepath} | PGPASSWORD="${password}" pg_restore -h ${host} -p ${port} -U ${user} -d ${database} --clean --if-exists`;

    try {
      logger.warn(`Restoring backup: ${filename}`);
      await execAsync(command, { shell: '/bin/bash' });
      logger.info(`Backup restored successfully: ${filename}`);
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(filename: string): Promise<void> {
    const filepath = path.join(this.backupDir, filename);

    // Validate filename
    if (!filename.startsWith('backup-') || !filename.endsWith('.sql.gz')) {
      throw new Error('Invalid backup filename');
    }

    try {
      await fs.unlink(filepath);
      logger.info(`Deleted backup: ${filename}`);
    } catch (error) {
      logger.error('Failed to delete backup:', error);
      throw error;
    }
  }
}

export const backupService = new BackupService();
