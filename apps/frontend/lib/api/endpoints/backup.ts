import { apiClient, ApiResponse } from '../client';

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

/**
 * Get backup status and list
 */
export async function getBackups(): Promise<BackupStatus> {
  const response = await apiClient.get<ApiResponse<BackupStatus>>('/backups');
  return response.data.data;
}

/**
 * Create new backup
 */
export async function createBackup(): Promise<{ filename: string }> {
  const response = await apiClient.post<ApiResponse<{ filename: string }>>('/backups');
  return response.data.data;
}

/**
 * Delete a backup
 */
export async function deleteBackup(filename: string): Promise<void> {
  await apiClient.delete(`/backups/${filename}`);
}

/**
 * Restore from backup
 */
export async function restoreBackup(filename: string): Promise<void> {
  await apiClient.post(`/backups/${filename}/restore`);
}

export const backupApi = {
  getBackups,
  createBackup,
  deleteBackup,
  restoreBackup,
};
