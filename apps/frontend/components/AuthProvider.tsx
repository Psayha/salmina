'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useRef } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, autoLoginWithTelegram, fetchCurrentUser } = useAuthStore();
  const authAttempted = useRef(false);

  useEffect(() => {
    console.log('🎯 AuthProvider useEffect triggered');
    console.log('🎯 authAttempted.current:', authAttempted.current);

    // Prevent multiple authentication attempts
    if (authAttempted.current) {
      console.log('⏭️ Auth already attempted, skipping...');
      return;
    }

    const initAuth = async () => {
      authAttempted.current = true;
      console.log('🔐 AuthProvider: Starting authentication...');
      console.log('🔐 isAuthenticated (from localStorage):', isAuthenticated);

      // IMPORTANT: Always authenticate with Telegram if we're in a Telegram WebApp
      // This ensures users are created in the database even if localStorage says we're authenticated
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const initData = window.Telegram.WebApp.initData;
        console.log('📱 Telegram WebApp detected');
        console.log('📱 initData length:', initData?.length || 0);
        console.log('📱 initData (first 100 chars):', initData?.substring(0, 100));

        if (initData) {
          try {
            console.log('🔄 Authenticating with Telegram (always authenticate in Telegram WebApp)...');
            await autoLoginWithTelegram(initData);
            console.log('✅ Telegram authentication successful!');
          } catch (error) {
            console.error('❌ Telegram authentication failed:', error);
            // If Telegram auth fails but we're already authenticated (from localStorage),
            // try to fetch current user as fallback
            if (isAuthenticated) {
              console.log('🔄 Falling back to fetchCurrentUser...');
              try {
                await fetchCurrentUser();
                console.log('✅ Current user fetched successfully');
              } catch (fetchError) {
                console.error('❌ Failed to fetch current user:', fetchError);
              }
            }
          }
        } else {
          console.warn('⚠️ No initData available from Telegram WebApp');
          // If no initData but we're authenticated (from localStorage), fetch current user
          if (isAuthenticated) {
            console.log('🔄 No initData, fetching current user from localStorage state...');
            try {
              await fetchCurrentUser();
              console.log('✅ Current user fetched successfully');
            } catch (error) {
              console.error('❌ Failed to fetch current user:', error);
            }
          }
        }
      } else {
        console.warn('⚠️ Telegram WebApp not available');
        // Not in Telegram WebApp, but if authenticated (from localStorage), fetch current user
        if (isAuthenticated) {
          console.log('🔄 Not in Telegram WebApp, fetching current user...');
          try {
            await fetchCurrentUser();
            console.log('✅ Current user fetched successfully');
          } catch (error) {
            console.error('❌ Failed to fetch current user:', error);
          }
        }
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps array - only run once on mount

  return <>{children}</>;
}
