'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, autoLoginWithTelegram, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 AuthProvider: Starting authentication...');
      console.log('🔐 isAuthenticated:', isAuthenticated);

      // Check if already authenticated
      if (isAuthenticated) {
        console.log('✅ Already authenticated, fetching current user...');
        // Refresh user data to ensure it's up to date
        try {
          await fetchCurrentUser();
          console.log('✅ Current user fetched successfully');
        } catch (error) {
          console.error('❌ Failed to fetch current user:', error);
        }
        return;
      }

      // Try to auto-login with Telegram
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const initData = window.Telegram.WebApp.initData;
        console.log('📱 Telegram WebApp detected');
        console.log('📱 initData length:', initData?.length || 0);
        console.log('📱 initData (first 100 chars):', initData?.substring(0, 100));

        if (initData) {
          try {
            console.log('🔄 Attempting auto-login with Telegram...');
            await autoLoginWithTelegram(initData);
            console.log('✅ Auto-login successful!');
          } catch (error) {
            console.error('❌ Auto-login failed:', error);
          }
        } else {
          console.warn('⚠️ No initData available from Telegram WebApp');
        }
      } else {
        console.warn('⚠️ Telegram WebApp not available');
      }
    };

    initAuth();
  }, [isAuthenticated, autoLoginWithTelegram, fetchCurrentUser]);

  return <>{children}</>;
}
