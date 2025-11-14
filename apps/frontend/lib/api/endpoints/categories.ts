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
  const response = await apiClient.get<ApiResponse<Category[]>>(
    '/categories/home',
  );
  return response.data.data;
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await apiClient.get<ApiResponse<Category>>(
    `/categories/${slug}`,
  );
  return response.data.data;
}
