import { apiClient } from '../client';
import { ApiResponse, User } from '../types';

export interface AcceptTermsResponse {
  success: boolean;
  termsAcceptedAt: string;
}

export const usersApi = {
  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  /**
   * Accept legal terms for current user
   */
  acceptTerms: async (): Promise<AcceptTermsResponse> => {
    const response = await apiClient.post<ApiResponse<AcceptTermsResponse>>('/users/me/accept-terms');
    return response.data.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: { phone?: string; email?: string }): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return response.data.data;
  },
};
