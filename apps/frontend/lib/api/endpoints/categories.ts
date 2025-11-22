import { apiClient, ApiResponse } from '../client';
import { Category } from '../types';

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return response.data.data;
}

/**
 * Get home page categories
 */
export async function getHomeCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiResponse<Category[]>>('/categories/home');
  return response.data.data;
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}`);
  return response.data.data;
}

/**
 * Create category
 */
export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
  return response.data.data;
}

/**
 * Update category
 */
export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data);
  return response.data.data;
}

/**
 * Delete category
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
