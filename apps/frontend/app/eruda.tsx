'use client';

import { useEffect } from 'react';

export function ErudaLoader() {
  useEffect(() => {
    // Загружаем Eruda только в production для отладки
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = () => {
      // @ts-ignore
      if (window.eruda) {
        // @ts-ignore
        window.eruda.init();
      }
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
