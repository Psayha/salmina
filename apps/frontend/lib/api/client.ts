import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Get API base URL based on environment
 * - Production: https://app.salminashop.ru/api
 * - Development: http://localhost:3001/api
 * - Can be overridden with NEXT_PUBLIC_API_URL env variable
 */
function getApiBaseUrl(): string {
  // Allow explicit override via environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Detect production environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production domain
    if (hostname === 'salminashop.ru' || hostname === 'www.salminashop.ru') {
      return 'https://app.salminashop.ru/api';
    }
  }

  // Default to localhost for development
  return 'http://localhost:3001/api';
}

// API base URL
const API_BASE_URL = getApiBaseUrl();

// Log the API URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API Client] Using API base URL:', API_BASE_URL);
}

/**
 * Axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - add auth token and session token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add session token for cart
    const sessionToken = getSessionToken();
    if (sessionToken) {
      config.headers['x-session-token'] = sessionToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor - handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await refreshAuthToken();
        // Retry original request
        return apiClient.request(error.config as AxiosRequestConfig);
      } catch {
        // Refresh failed, clear auth and redirect
        clearAuth();
        // Optionally notify user or redirect to login
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Get session token from localStorage
 */
function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sessionToken');
}

/**
 * Refresh auth token
 */
async function refreshAuthToken(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  const { accessToken } = response.data.data;
  localStorage.setItem('accessToken', accessToken);
}

/**
 * Clear auth tokens
 */
function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Generic API error interface
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Generic API response interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message || error.message || 'Произошла ошибка';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка';
}
