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
    const response = await apiClient.get<ApiResponse<{ users: User[]; pagination: any }>>('/users', {
      params: {
        limit: 100, // Fetch up to 100 users
        page: 1,
      },
    });
    return response.data.data.users;
  },

  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN'): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${userId}/role`, { role });
    return response.data.data;
  },

  blockUser: async (userId: string): Promise<User> => {
    const response = await apiClient.delete<ApiResponse<User>>(`/users/${userId}`);
    return response.data.data;
  },

  unblockUser: async (userId: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(`/users/${userId}/reactivate`);
    return response.data.data;
  },
};
