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
    // Mock data for now as backend might not have this endpoint yet
    return {
      revenue: 1234567,
      revenueChange: 12.5,
      activeOrders: 45,
      ordersChange: 5.2,
      newCustomers: 128,
      customersChange: 2.4,
      averageCheck: 3450,
      checkChange: 1.8,
      totalProducts: 42,
    };
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
