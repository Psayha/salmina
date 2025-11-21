'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useTelegram } from '@/lib/telegram/useTelegram';
import { ToastProvider } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { LoadingScreen } from './LoadingScreen';

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
 * Initialize app on mount with loading screen
 */
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { webApp, isReady } = useTelegram();
  const autoLoginWithTelegram = useAuthStore((state) => state.autoLoginWithTelegram);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !webApp) return;

    async function initialize() {
      try {
        // Get Telegram initData (the raw string from Telegram)
        const initData = webApp?.initData;
        console.log('[Providers] Initializing app...');
        console.log('[Providers] initData exists:', !!initData);
        console.log('[Providers] initData length:', initData?.length || 0);

        if (initData) {
          // Auto-login with Telegram initData
          console.log('[Providers] Attempting auto-login with Telegram initData...');
          await autoLoginWithTelegram(initData);
          console.log('[Providers] Auto-login completed');
        } else {
          // Fallback: try to fetch current user if token exists
          const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
          console.log('[Providers] No initData, checking for existing token:', !!hasToken);
          if (hasToken) {
            await fetchCurrentUser();
          }
        }
      } catch (error) {
        console.error('[Providers] Initialization error:', error);
      }

      // Always fetch cart (works for both authenticated and anonymous)
      try {
        await fetchCart();
      } catch (error) {
        console.error('[Providers] Cart fetch error:', error);
      }
    }

    initialize();
  }, [isReady, webApp, fetchCart, fetchCurrentUser, autoLoginWithTelegram]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <>{children}</>;
}
