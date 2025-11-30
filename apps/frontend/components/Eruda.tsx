'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function Eruda() {
  const { user } = useAuthStore();

  // Only show for admins
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    // Only load Eruda for admins
    if (!isAdmin) return;

    // Загружаем Eruda для отладки в production
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = () => {
      // @ts-expect-error -- Eruda is loaded dynamically
      if (window.eruda) {
        // Detect dark theme from system or Telegram
        const isDark =
          window.matchMedia('(prefers-color-scheme: dark)').matches ||
          document.documentElement.classList.contains('dark');

        // @ts-expect-error -- Eruda is loaded dynamically
        window.eruda.init({
          defaults: {
            theme: isDark ? 'Dark' : 'Light',
          },
        });
        console.log('[Eruda] DevTools loaded with theme:', isDark ? 'Dark' : 'Light');
      }
    };
    document.body.appendChild(script);
  }, [isAdmin]);

  return null;
}
