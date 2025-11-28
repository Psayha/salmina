'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useTelegram } from '@/lib/telegram/useTelegram';
import { ToastProvider } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { LoadingScreen } from './LoadingScreen';

// Global flag to track if app has been initialized
let hasInitialized = false;

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
  
  // Show loading only on first app load, not on navigation
  const [showLoading, setShowLoading] = useState(!hasInitialized);
  const initStarted = useRef(false);

  useEffect(() => {
    // Skip if already initialized or init already started
    if (hasInitialized || initStarted.current) {
      return;
    }

    if (!isReady || !webApp) {
      return;
    }

    initStarted.current = true;

    async function initialize() {
      try {
        const initData = webApp?.initData;

        // Always authenticate with Telegram if initData is available
        if (initData) {
          try {
            await autoLoginWithTelegram(initData);
          } catch (error) {
            console.error('[Providers] Telegram authentication failed:', error);
            // Fallback to token-based auth if available
            const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
            if (hasToken) {
              await fetchCurrentUser();
            }
          }
        } else {
          // No Telegram initData, try token-based auth
          const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
          if (hasToken) {
            await fetchCurrentUser();
          }
        }
      } catch (error) {
        console.error('[Providers] Initialization error:', error);
      }

      // Fetch cart
      try {
        await fetchCart();
      } catch (error) {
        console.error('[Providers] Cart fetch error:', error);
      }
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, webApp]);

  const handleLoadingComplete = () => {
    hasInitialized = true;
    setShowLoading(false);
  };

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <>{children}</>;
}
