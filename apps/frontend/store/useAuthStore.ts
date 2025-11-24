import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

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
          console.log('🔄 useAuthStore: Calling loginWithTelegram API...');
          // Use the actual Telegram initData string
          const response = await authApi.loginWithTelegram({ initData });
          console.log('✅ useAuthStore: Login response:', response);
          console.log('✅ useAuthStore: User created/updated:', response.user);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const message = error instanceof Error ? error.message : 'Ошибка авторизации';
          console.error('❌ Auto login failed:', error);
          console.error('❌ Error response:', error?.response?.data);
          console.error('❌ Error status:', error?.response?.status);
          set({
            error: message,
            isLoading: false,
          });
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
          const message = error instanceof Error ? error.message : 'Ошибка загрузки пользователя';
          set({
            error: message,
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });
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
