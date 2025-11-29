import { apiClient } from '../client';
import { ApiResponse } from '../types';

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export interface Promocode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatePromocodeResponse {
  valid: boolean;
  discount: number;
  type: DiscountType;
}

export const promocodesApi = {
  // Admin endpoints
  getPromocodes: async () => {
    const response = await apiClient.get<ApiResponse<Promocode[]>>('/promocodes');
    return response.data.data;
  },

  createPromocode: async (data: Partial<Promocode>) => {
    const response = await apiClient.post<ApiResponse<Promocode>>('/promocodes', data);
    return response.data.data;
  },

  updatePromocode: async (id: string, data: Partial<Promocode>) => {
    const response = await apiClient.patch<ApiResponse<Promocode>>(`/promocodes/${id}`, data);
    return response.data.data;
  },

  deletePromocode: async (id: string) => {
    await apiClient.delete(`/promocodes/${id}`);
  },

  // Public endpoint
  validatePromocode: async (code: string) => {
    const response = await apiClient.post<ApiResponse<ValidatePromocodeResponse>>('/promocodes/validate', { code });
    return response.data.data;
  },
};
