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

// THIS MUST EXECUTE WHEN MODULE LOADS
console.log('🚀🚀🚀 PROVIDERS.TSX MODULE LOADED! 🚀🚀🚀');
console.log('🚀 Timestamp:', new Date().toISOString());

/**
 * App providers with React Query and initialization
 */
export function Providers({ children }: { children: React.ReactNode }) {
  console.log('🎨 Providers component rendering!');
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
  console.log('💥 AppInitializer function called!');

  const { webApp, isReady } = useTelegram();
  console.log('💥 After useTelegram - isReady:', isReady, 'webApp:', !!webApp);

  const autoLoginWithTelegram = useAuthStore((state) => state.autoLoginWithTelegram);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const [showLoading, setShowLoading] = useState(true);

  console.log('💥 Before useEffect - showLoading:', showLoading);

  useEffect(() => {
    console.log('🎯 [AppInitializer] useEffect triggered!');
    console.log('🎯 [AppInitializer] isReady:', isReady);
    console.log('🎯 [AppInitializer] webApp:', !!webApp);

    if (!isReady || !webApp) {
      console.log('⏭️ [AppInitializer] Skipping initialization - Telegram not ready');
      return;
    }

    async function initialize() {
      try {

        // Get Telegram initData (the raw string from Telegram)
        const initData = webApp?.initData;
        console.log('🔐 [Providers] Initializing app...');
        console.log('📱 [Providers] initData exists:', !!initData);
        console.log('📱 [Providers] initData length:', initData?.length || 0);
        console.log('📱 [Providers] initData (first 100 chars):', initData?.substring(0, 100));

        // ALWAYS authenticate with Telegram if initData is available
        // This ensures users are created in the database
        if (initData) {
          console.log('🔄 [Providers] Authenticating with Telegram (ALWAYS in Telegram WebApp)...');
          try {
            await autoLoginWithTelegram(initData);
            console.log('✅ [Providers] Telegram authentication successful!');
          } catch (error) {
            console.error('❌ [Providers] Telegram authentication failed:', error);
            // Fallback: try to fetch current user if token exists
            const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
            if (hasToken) {
              console.log('🔄 [Providers] Falling back to fetchCurrentUser...');
              await fetchCurrentUser();
            }
          }
        } else {
          console.warn('⚠️ [Providers] No initData from Telegram WebApp');
          // Fallback: try to fetch current user if token exists
          const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
          console.log('[Providers] No initData, checking for existing token:', !!hasToken);
          if (hasToken) {
            await fetchCurrentUser();
          }
        }
      } catch (error) {
        console.error('❌ [Providers] Initialization error:', error);
      }

      // Always fetch cart (works for both authenticated and anonymous)
      try {
        await fetchCart();
      } catch (error) {
        console.error('[Providers] Cart fetch error:', error);
      }
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount, not dependent on isReady/webApp changes

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <>{children}</>;
}
