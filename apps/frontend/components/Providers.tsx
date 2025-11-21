'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useTelegram } from '@/lib/telegram/useTelegram';
import { ToastProvider } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';

/**
 * App providers with React Query and initialization
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ThemeProvider>
            <AppInitializer>{children}</AppInitializer>
          </ThemeProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

/**
 * Initialize app on mount
 */
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { initData, isReady } = useTelegram();
  const loginWithTelegram = useAuthStore((state) => state.loginWithTelegram);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (!isReady) return;

    async function initialize() {
      try {
        // Check if we have access token
        const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');

        if (hasToken) {
          // Try to fetch current user
          await fetchCurrentUser();
        } else if (initData) {
          // Login with Telegram init data
          await loginWithTelegram(initData);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }

      // Always fetch cart (works for both authenticated and anonymous)
      try {
        await fetchCart();
      } catch (error) {
        console.error('Cart fetch error:', error);
      }
    }

    initialize();
  }, [isReady, initData, fetchCart, fetchCurrentUser, loginWithTelegram]);

  return <>{children}</>;
}
