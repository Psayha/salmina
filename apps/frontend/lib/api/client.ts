import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { setUserBlockedByServer } from '@/store/useAuthStore';

// Production API URL - hardcoded to ensure correct value
const PRODUCTION_API_URL = 'https://app.salminashop.ru/api';
const DEVELOPMENT_API_URL = 'http://localhost:3001/api';

/**
 * Get API base URL dynamically based on current environment
 * Called on each request to ensure correct URL even after hydration
 */
function getApiBaseUrl(): string {
  // Client-side: detect production by hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production domains
    if (
      hostname === 'salminashop.ru' ||
      hostname === 'www.salminashop.ru' ||
      hostname.endsWith('.salminashop.ru')
    ) {
      return PRODUCTION_API_URL;
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return DEVELOPMENT_API_URL;
    }
  }

  // Server-side or unknown: check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API_URL;
  }

  return DEVELOPMENT_API_URL;
}

/**
 * Axios instance with default configuration
 * Note: baseURL is set dynamically in request interceptor
 */
export const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - set baseURL dynamically and add auth tokens
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Set baseURL dynamically on each request
    // This ensures correct URL after hydration
    config.baseURL = getApiBaseUrl();

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

// Flag to prevent multiple simultaneous re-login attempts
let isReloginInProgress = false;
let reloginPromise: Promise<boolean> | null = null;

/**
 * Check if error message indicates user is blocked
 */
function isBlockedUserError(error: AxiosError): boolean {
  const apiError = error.response?.data as ApiError | undefined;
  const message = apiError?.message || '';
  return (
    message.includes('disabled') ||
    message.includes('deactivated') ||
    message.includes('заблокирован')
  );
}

/**
 * Response interceptor - handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Skip re-login for auth endpoints to avoid infinite loops
    if (originalRequest?.url?.includes('/auth/')) {
      // Check if this is a blocked user error and set global flag
      if (isBlockedUserError(error)) {
        setUserBlockedByServer(true);
      }
      return Promise.reject(error);
    }

    // Don't retry for blocked users (401/403) - let the error propagate to show blocking screen
    if ((error.response?.status === 401 || error.response?.status === 403) && isBlockedUserError(error)) {
      setUserBlockedByServer(true);
      clearAuth();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // Try to refresh token first
      try {
        await refreshAuthToken();
        // Retry original request
        return apiClient.request(originalRequest);
      } catch {
        // Refresh failed, try re-login with Telegram
        try {
          const success = await reloginWithTelegram();
          if (success) {
            // Retry original request with new token
            return apiClient.request(originalRequest);
          }
        } catch {
          // Re-login also failed
        }

        // All auth attempts failed, clear auth
        clearAuth();
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

  const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
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
 * Re-login with Telegram initData
 * Used when both access and refresh tokens are invalid
 */
async function reloginWithTelegram(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Prevent multiple simultaneous re-login attempts
  if (isReloginInProgress && reloginPromise) {
    return reloginPromise;
  }

  // Check if Telegram WebApp is available
  const telegram = window.Telegram?.WebApp;
  if (!telegram?.initData) {
    return false;
  }

  isReloginInProgress = true;
  reloginPromise = (async () => {
    try {
      // Call auth endpoint directly with axios to avoid interceptor loop
      const response = await axios.post(`${getApiBaseUrl()}/auth/telegram`, {
        initData: telegram.initData,
      });

      const { accessToken, refreshToken } = response.data.data;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('[Auth] Re-login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Auth] Re-login failed:', error);
      return false;
    } finally {
      isReloginInProgress = false;
      reloginPromise = null;
    }
  })();

  return reloginPromise;
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

// Default export for convenience
export default apiClient;
