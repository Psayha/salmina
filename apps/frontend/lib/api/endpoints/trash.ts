import { apiClient, ApiResponse } from '../client';

export interface TrashItem {
  id: string;
  type: 'product' | 'category';
  name: string;
  slug: string;
  image: string | null;
  categoryName?: string;
  deletedAt: string;
}

export interface TrashData {
  products: TrashItem[];
  categories: TrashItem[];
}

export interface TrashCount {
  products: number;
  categories: number;
  total: number;
}

/**
 * Get all items in trash
 */
export async function getTrashItems(): Promise<TrashData> {
  const response = await apiClient.get<ApiResponse<TrashData>>('/trash');
  return response.data.data;
}

/**
 * Get trash items count
 */
export async function getTrashCount(): Promise<TrashCount> {
  const response = await apiClient.get<ApiResponse<TrashCount>>('/trash/count');
  return response.data.data;
}

/**
 * Restore a product from trash
 */
export async function restoreProduct(id: string): Promise<void> {
  await apiClient.post(`/trash/restore/product/${id}`);
}

/**
 * Restore a category from trash
 */
export async function restoreCategory(id: string): Promise<void> {
  await apiClient.post(`/trash/restore/category/${id}`);
}

/**
 * Permanently delete a product
 */
export async function permanentDeleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/trash/product/${id}`);
}

/**
 * Permanently delete a category
 */
export async function permanentDeleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/trash/category/${id}`);
}

/**
 * Empty the entire trash
 */
export async function emptyTrash(): Promise<{ deletedProducts: number; deletedCategories: number }> {
  const response = await apiClient.delete<ApiResponse<{ deletedProducts: number; deletedCategories: number }>>('/trash/empty');
  return response.data.data;
}
