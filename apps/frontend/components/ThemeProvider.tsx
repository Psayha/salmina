'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/lib/telegram/useTelegram';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { webApp } = useTelegram();

  useEffect(() => {
    if (!webApp) return;

    const applyTheme = () => {
      const colorScheme = webApp.colorScheme;
      const root = document.documentElement;

      if (colorScheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Set CSS variables from Telegram theme params
      const params = webApp.themeParams;
      if (params) {
        if (params.bg_color) root.style.setProperty('--tg-theme-bg-color', params.bg_color);
        if (params.text_color) root.style.setProperty('--tg-theme-text-color', params.text_color);
        if (params.hint_color) root.style.setProperty('--tg-theme-hint-color', params.hint_color);
        if (params.link_color) root.style.setProperty('--tg-theme-link-color', params.link_color);
        if (params.button_color) root.style.setProperty('--tg-theme-button-color', params.button_color);
        if (params.button_text_color) root.style.setProperty('--tg-theme-button-text-color', params.button_text_color);
        if (params.secondary_bg_color)
          root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color);
      }
    };

    // Apply initial theme
    applyTheme();

    // Listen for theme changes (Telegram WebApp event)
    // Note: The official types might not have onEvent for themeChanged yet,
    // but it's good practice to re-apply if webApp changes or if we could listen to it.
    // For now, we rely on webApp prop updates or initial load.
  }, [webApp]);

  return <>{children}</>;
}
