'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, autoLoginWithTelegram, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // Check if already authenticated
      if (isAuthenticated) {
        // Refresh user data to ensure it's up to date
        try {
          await fetchCurrentUser();
        } catch (error) {
          console.error('Failed to fetch current user:', error);
        }
        return;
      }

      // Try to auto-login with Telegram
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const initData = window.Telegram.WebApp.initData;

        if (initData) {
          try {
            await autoLoginWithTelegram(initData);
          } catch (error) {
            console.error('Auto-login failed:', error);
          }
        }
      }
    };

    initAuth();
  }, [isAuthenticated, autoLoginWithTelegram, fetchCurrentUser]);

  return <>{children}</>;
}
