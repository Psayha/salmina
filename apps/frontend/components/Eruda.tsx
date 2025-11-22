'use client';

import { useEffect } from 'react';

export function Eruda() {
  useEffect(() => {
    // Загружаем Eruda для отладки в production
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = () => {
      // @ts-ignore
      if (window.eruda) {
        // @ts-ignore
        window.eruda.init();
        console.log('[Eruda] DevTools loaded');
      }
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
