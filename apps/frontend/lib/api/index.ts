/**
 * API client exports
 */

export { apiClient, getErrorMessage } from './client';
export type { ApiResponse } from './client';
export * from './types';
export * as authApi from './endpoints/auth';
export * as productsApi from './endpoints/products';
export * as categoriesApi from './endpoints/categories';
export * as cartApi from './endpoints/cart';
