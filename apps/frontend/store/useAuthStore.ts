import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api/types';
import { authApi, getErrorMessage } from '@/lib/api';

// Module-level flag - completely outside zustand, cannot be affected by persist/rehydration
let _globalBlockedFlag = false;

export function isUserBlockedByServer(): boolean {
  return _globalBlockedFlag;
}

export function setUserBlockedByServer(blocked: boolean): void {
  _globalBlockedFlag = blocked;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Flag set when server explicitly blocks user - NOT persisted, immune to rehydration race conditions
  _isBlockedByServer: boolean;

  // Actions
  setUser: (user: User | null) => void;
  loginWithTelegram: (initData: string) => Promise<void>;
  autoLoginWithTelegram: (initData: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _isBlockedByServer: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      loginWithTelegram: async (initData: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithTelegram({ initData });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Ошибка авторизации';
          set({
            error: message,
            isLoading: false,
          });
        }
      },

      autoLoginWithTelegram: async (initData: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithTelegram({ initData });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          // Use getErrorMessage to extract API error message properly
          const message = getErrorMessage(error);
          console.error('Auto login failed:', message, error);

          // Check if user is blocked (backend returns "User account is disabled")
          const isBlocked = message.includes('disabled') || message.includes('заблокирован');

          if (isBlocked) {
            // Set global flag FIRST - this is outside zustand and cannot be affected by rehydration
            setUserBlockedByServer(true);
            // Clear persisted auth state to prevent rehydration from overwriting
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-storage');
            }
            // Set blocked flag in store as well
            set({
              error: message,
              isLoading: false,
              user: { isActive: false } as User,
              isAuthenticated: false,
              _isBlockedByServer: true,
            });
          } else {
            // For other errors (network, server, etc.) - keep existing user data
            // Just set error and stop loading
            set({
              error: message,
              isLoading: false,
            });
          }
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          // Use getErrorMessage to extract API error message properly
          const message = getErrorMessage(error);

          // Check if user is blocked (backend returns "deactivated" or similar)
          const isBlocked =
            message.includes('disabled') ||
            message.includes('deactivated') ||
            message.includes('заблокирован');

          if (isBlocked) {
            // Set global flag FIRST - this is outside zustand and cannot be affected by rehydration
            setUserBlockedByServer(true);
            // Clear persisted auth state to prevent rehydration from overwriting
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-storage');
            }
            // User is blocked - set flag so UserBlockedGuard shows blocking screen
            set({
              error: message,
              isLoading: false,
              user: { isActive: false } as User,
              isAuthenticated: false,
              _isBlockedByServer: true,
            });
          } else {
            // Other errors (network, server, etc.)
            set({
              error: message,
              isLoading: false,
              user: null,
              isAuthenticated: false,
            });
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
