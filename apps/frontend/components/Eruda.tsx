'use client';

import { useEffect } from 'react';

export function Eruda() {
  useEffect(() => {
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
  }, []);

  return null;
}
