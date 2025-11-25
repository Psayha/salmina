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
        // @ts-expect-error -- Eruda is loaded dynamically
        window.eruda.init();
        console.log('[Eruda] DevTools loaded');
      }
    };
    document.body.appendChild(script);
  }, [isAdmin]);

  return null;
}
