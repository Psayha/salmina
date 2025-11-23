import { apiClient, ApiResponse } from '../client';
import { User } from '../types';

export interface AdminStats {
  revenue: number;
  revenueChange: number;
  activeOrders: number;
  ordersChange: number;
  newCustomers: number;
  customersChange: number;
  averageCheck: number;
  checkChange: number;
  totalProducts?: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN'): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${userId}/role`, { role });
    return response.data.data;
  },

  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/block`);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/unblock`);
  },
};
