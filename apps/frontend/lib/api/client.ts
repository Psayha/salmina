import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Production API URL - hardcoded to ensure correct value
const PRODUCTION_API_URL = 'https://app.salminashop.ru/api';
const DEVELOPMENT_API_URL = 'http://localhost:3001/api';

/**
 * Get API base URL dynamically based on current environment
 * Called on each request to ensure correct URL even after hydration
 */
function getApiBaseUrl(): string {
  // Allow explicit override via environment variable (for development only)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

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
