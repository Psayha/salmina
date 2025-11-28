import { useEffect, useState, useMemo } from 'react';

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  showPopup?: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }) => Promise<string | null>;
  showAlert?: (message: string) => Promise<void>;
  showConfirm?: (message: string) => Promise<boolean>;
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  sendData?: (data: string) => void;
  requestFullscreen?: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Global flag to ensure ready() and requestFullscreen() are called only once
let telegramInitialized = false;

/**
 * Hook for Telegram Web App integration
 */
export function useTelegram() {
  const [webApp] = useState<TelegramWebApp | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.Telegram?.WebApp || null;
  });
  const [isReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!window.Telegram?.WebApp;
  });

  useEffect(() => {
    // Only initialize Telegram WebApp once
    if (webApp && !telegramInitialized) {
      telegramInitialized = true;
      webApp.ready();
      if (webApp.requestFullscreen) {
        webApp.requestFullscreen();
      } else {
        webApp.expand();
      }

      // Set safe area CSS variables
      const safeAreaInset = webApp.safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 };
      document.documentElement.style.setProperty('--safe-top', `${safeAreaInset.top}px`);
      document.documentElement.style.setProperty('--safe-bottom', `${safeAreaInset.bottom}px`);
      document.documentElement.style.setProperty('--safe-left', `${safeAreaInset.left}px`);
      document.documentElement.style.setProperty('--safe-right', `${safeAreaInset.right}px`);
    }
  }, [webApp]);

  return useMemo(
    () => ({
      webApp,
      isReady,
      user: webApp?.initDataUnsafe?.user,
      initData: webApp?.initData,
    }),
    [webApp, isReady],
  );
}

/**
 * Hook for Telegram Back Button
 */
export function useTelegramBackButton(onClick: () => void) {
  const { webApp } = useTelegram();

  useEffect(() => {
    if (!webApp) return;

    const backButton = webApp.BackButton;
    backButton.onClick(onClick);
    backButton.show();

    return () => {
      backButton.offClick(onClick);
      backButton.hide();
    };
  }, [webApp, onClick]);
}

/**
 * Hook for Telegram Main Button
 */
export function useTelegramMainButton(
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isVisible?: boolean;
  },
) {
  const { webApp } = useTelegram();

  useEffect(() => {
    if (!webApp) return;

    const mainButton = webApp.MainButton;

    mainButton.setText(text);

    // eslint-disable-next-line react-hooks/immutability
    if (options?.color) mainButton.color = options.color;

    if (options?.textColor) mainButton.textColor = options.textColor;

    mainButton.onClick(onClick);

    if (options?.isActive !== false) {
      mainButton.enable();
    } else {
      mainButton.disable();
    }

    if (options?.isVisible !== false) {
      mainButton.show();
    } else {
      mainButton.hide();
    }

    return () => {
      mainButton.offClick(onClick);
      mainButton.hide();
    };
  }, [webApp, text, onClick, options]);
}

/**
 * Hook for Telegram Haptic Feedback
 */
export function useTelegramHaptic() {
  const { webApp } = useTelegram();

  return useMemo(
    () => ({
      impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
        webApp?.HapticFeedback.impactOccurred(style);
      },
      notificationOccurred: (type: 'error' | 'success' | 'warning') => {
        webApp?.HapticFeedback.notificationOccurred(type);
      },
      selectionChanged: () => {
        webApp?.HapticFeedback.selectionChanged();
      },
    }),
    [webApp],
  );
}

/**
 * Hook for Telegram Theme
 */
export function useTelegramTheme() {
  const { webApp } = useTelegram();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp.colorScheme;
    }
    return 'light';
  });

  useEffect(() => {
    if (!webApp) return;

    // Listen for theme changes
    const handleThemeChange = () => {
      setColorScheme(webApp.colorScheme);

      // Apply theme to document
      if (webApp.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Initial theme application
    handleThemeChange();

    // Telegram WebApp theme changed event
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [webApp]);

  return useMemo(
    () => ({
      colorScheme,
      isDark: colorScheme === 'dark',
      themeParams: webApp?.themeParams || {},
    }),
    [colorScheme, webApp],
  );
}
