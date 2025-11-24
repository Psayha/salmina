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
    try {
      console.log('🔍 Calling GET /api/users with params:', { limit: 100, page: 1 });
      const response = await apiClient.get<ApiResponse<{ users: User[]; pagination: any }>>('/users', {
        params: {
          limit: 100,
          page: 1,
        },
      });
      console.log('✅ Users API response:', response.data);
      console.log('📊 Users count:', response.data.data.users.length);
      return response.data.data.users;
    } catch (error: any) {
      console.error('❌ Users API error:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      throw error;
    }
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
