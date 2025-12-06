'use client';

import { useEffect, useState } from 'react';

/**
 * SafeAreaProvider sets CSS custom properties for safe area insets
 * and ensures they are available before rendering children
 */
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function updateSafeArea() {
      const root = document.documentElement;

      // Get Telegram WebApp safe area if available
      const tgWebApp = window.Telegram?.WebApp;

      if (tgWebApp?.safeAreaInset) {
        // Use Telegram's safe area values
        root.style.setProperty('--safe-top', `${tgWebApp.safeAreaInset.top}px`);
        root.style.setProperty('--safe-bottom', `${tgWebApp.safeAreaInset.bottom}px`);
        root.style.setProperty('--safe-left', `${tgWebApp.safeAreaInset.left}px`);
        root.style.setProperty('--safe-right', `${tgWebApp.safeAreaInset.right}px`);
      } else if (tgWebApp?.contentSafeAreaInset) {
        // Fallback to content safe area
        root.style.setProperty('--safe-top', `${tgWebApp.contentSafeAreaInset.top}px`);
        root.style.setProperty('--safe-bottom', `${tgWebApp.contentSafeAreaInset.bottom}px`);
        root.style.setProperty('--safe-left', `${tgWebApp.contentSafeAreaInset.left}px`);
        root.style.setProperty('--safe-right', `${tgWebApp.contentSafeAreaInset.right}px`);
      } else {
        // Use CSS env() values with computed style check
        const testEl = document.createElement('div');
        testEl.style.paddingTop = 'env(safe-area-inset-top)';
        document.body.appendChild(testEl);
        const computedPadding = window.getComputedStyle(testEl).paddingTop;
        document.body.removeChild(testEl);

        const safeTop = parseInt(computedPadding) || 0;

        // Set minimum safe area for iOS devices
        // iPhone notch typically needs ~47px, iPhone 14 Pro Dynamic Island ~59px
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const minSafeTop = isIOS ? Math.max(safeTop, 44) : safeTop;

        root.style.setProperty('--safe-top', `${minSafeTop}px`);
        root.style.setProperty('--safe-bottom', `${safeTop > 0 ? 34 : 0}px`);
        root.style.setProperty('--safe-left', '0px');
        root.style.setProperty('--safe-right', '0px');
      }

      setIsReady(true);
    }

    // Initial update
    updateSafeArea();

    // Listen for Telegram WebApp events
    const tgWebApp = window.Telegram?.WebApp;
    if (tgWebApp) {
      tgWebApp.onEvent?.('viewportChanged', updateSafeArea);
      tgWebApp.onEvent?.('safeAreaChanged', updateSafeArea);
    }

    // Also update on resize
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
      if (tgWebApp) {
        tgWebApp.offEvent?.('viewportChanged', updateSafeArea);
        tgWebApp.offEvent?.('safeAreaChanged', updateSafeArea);
      }
    };
  }, []);

  // Show nothing until safe area is calculated to prevent layout shift
  if (!isReady) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #ffb6c1 0%, #ffd4b3 100%)',
          zIndex: 9999
        }}
      />
    );
  }

  return <>{children}</>;
}
