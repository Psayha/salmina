'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore, isUserBlockedByServer } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useTelegram } from '@/lib/telegram/useTelegram';
import { ToastProvider } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { LoadingScreen } from './LoadingScreen';
import { TelegramOnlyGuard } from './TelegramOnlyGuard';
import { UserBlockedGuard } from './UserBlockedGuard';
import { SafeAreaProvider } from './SafeAreaProvider';

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
            staleTime: 5 * 60 * 1000,      // 5 минут данные считаются свежими
            gcTime: 30 * 60 * 1000,         // 30 минут хранить в кеше
            retry: 2,                        // 2 повторные попытки при ошибке
            refetchOnWindowFocus: false,    // Не обновлять при фокусе
            refetchOnReconnect: true,       // Обновлять при восстановлении сети
            refetchOnMount: false,          // Не перезапрашивать если данные свежие
          },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <ThemeProvider>
              <TelegramOnlyGuard>
                <AppInitializer>{children}</AppInitializer>
              </TelegramOnlyGuard>
            </ThemeProvider>
          </ToastProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
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
  const [initComplete, setInitComplete] = useState(hasInitialized);
  const [animationComplete, setAnimationComplete] = useState(hasInitialized);
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

      // Fetch cart only if user is not blocked
      // Check global flag FIRST (most reliable - completely outside zustand)
      if (!isUserBlockedByServer()) {
        try {
          await fetchCart();
        } catch (error) {
          console.error('[Providers] Cart fetch error:', error);
        }
      }

      // Mark initialization as complete
      setInitComplete(true);
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, webApp]);

  // Called when loading animation completes (~2 sec)
  const handleLoadingComplete = () => {
    setAnimationComplete(true);
  };

  // Hide loading screen only when BOTH animation AND init are complete
  useEffect(() => {
    if (animationComplete && initComplete && showLoading) {
      hasInitialized = true;
      setShowLoading(false);
    }
  }, [animationComplete, initComplete, showLoading]);

  // Show loading screen while animation or init is in progress
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <UserBlockedGuard>{children}</UserBlockedGuard>;
}
