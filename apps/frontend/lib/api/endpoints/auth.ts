import { apiClient, ApiResponse } from '../client';
import { LoginResponse, User } from '../types';

export interface TelegramAuthInput {
  initData: string;
}

/**
 * Authenticate with Telegram
 */
export async function loginWithTelegram(
  input: TelegramAuthInput,
): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/telegram',
    input,
  );

  const { accessToken, refreshToken } = response.data.data;

  // Save tokens
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  return response.data.data;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    // Clear tokens even if request fails
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<string> {
  const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
    '/auth/refresh',
    { refreshToken },
  );

  const { accessToken } = response.data.data;

  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
  }

  return accessToken;
}
