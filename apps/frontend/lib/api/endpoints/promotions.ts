import { apiClient } from '../client';
import { ApiResponse, Promotion } from '../types';

export const promotionsApi = {
  getPromotions: async () => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>('/promotions');
    return response.data.data;
  },

  getAdminPromotions: async () => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>('/promotions/admin');
    return response.data.data;
  },

  createPromotion: async (data: Partial<Promotion> & { productIds?: string[] }) => {
    const response = await apiClient.post<ApiResponse<Promotion>>('/promotions', data);
    return response.data.data;
  },

  updatePromotion: async (id: string, data: Partial<Promotion> & { productIds?: string[] }) => {
    const response = await apiClient.patch<ApiResponse<Promotion>>(`/promotions/${id}`, data);
    return response.data.data;
  },

  deletePromotion: async (id: string) => {
    await apiClient.delete(`/promotions/${id}`);
  },

  assignProducts: async (id: string, productIds: string[]) => {
    const response = await apiClient.post<ApiResponse<Promotion>>(`/promotions/${id}/products`, { productIds });
    return response.data.data;
  },
};
