import { apiClient, ApiResponse } from '../client';
import { Product, PaginatedResponse } from '../types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  hasPromotion?: boolean;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get products list with filters
 */
export async function getProducts(params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params });
  return response.data.data;
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/${slug}`);
  return response.data.data;
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  params?: Omit<GetProductsParams, 'search'>,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/products/search', {
    params: { q: query, ...params },
  });
  return response.data.data;
}

/**
 * Get multiple products by IDs (bulk fetch for favorites)
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const response = await apiClient.post<ApiResponse<Product[]>>('/products/bulk', { ids });
  return response.data.data;
}

/**
 * Get related products
 */
export async function getRelatedProducts(productId: string): Promise<Product[]> {
  const response = await apiClient.get<ApiResponse<Product[]>>(`/products/${productId}/related`);
  return response.data.data;
}

/**
 * Create product
 */
export async function createProduct(data: Partial<Product>): Promise<Product> {
  const response = await apiClient.post<ApiResponse<Product>>('/products', data);
  return response.data.data;
}

/**
 * Update product
 */
export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
  return response.data.data;
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
