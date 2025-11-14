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
export async function getProducts(
  params?: GetProductsParams,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
    '/products',
    { params },
  );
  return response.data.data;
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await apiClient.get<ApiResponse<Product>>(
    `/products/${slug}`,
  );
  return response.data.data;
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  params?: Omit<GetProductsParams, 'search'>,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
    '/products/search',
    {
      params: { q: query, ...params },
    },
  );
  return response.data.data;
}

/**
 * Get related products
 */
export async function getRelatedProducts(productId: string): Promise<Product[]> {
  const response = await apiClient.get<ApiResponse<Product[]>>(
    `/products/${productId}/related`,
  );
  return response.data.data;
}
