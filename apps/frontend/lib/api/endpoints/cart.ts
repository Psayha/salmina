import { apiClient, ApiResponse } from '../client';
import { Cart } from '../types';

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

/**
 * Get current cart
 */
export async function getCart(): Promise<Cart> {
  const response = await apiClient.get<ApiResponse<Cart>>('/cart');
  return response.data.data;
}

/**
 * Add item to cart
 */
export async function addToCart(input: AddToCartInput): Promise<Cart> {
  const response = await apiClient.post<ApiResponse<Cart>>('/cart/items', input);
  return response.data.data;
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput,
): Promise<Cart> {
  const response = await apiClient.patch<ApiResponse<Cart>>(
    `/cart/items/${itemId}`,
    input,
  );
  return response.data.data;
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await apiClient.delete<ApiResponse<Cart>>(
    `/cart/items/${itemId}`,
  );
  return response.data.data;
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<void> {
  await apiClient.delete('/cart');
}
