'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/lib/telegram/useTelegram';

export const TelegramOnlyGuard = ({ children }: { children: React.ReactNode }) => {
  const { webApp, isReady } = useTelegram();
  const [isChecking, setIsChecking] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Give some time for Telegram WebApp to initialize
    const timer = setTimeout(() => {
      const hasTelegram = !!window.Telegram?.WebApp?.initData;
      setIsTelegram(hasTelegram);
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [webApp, isReady]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-light">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Block access from regular browsers
  if (!isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-md w-full text-center">
          {/* Telegram Logo */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Salmina Shop
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6 font-light leading-relaxed">
            Это приложение доступно только через Telegram.
            <br />
            Откройте магазин в Telegram для покупок.
          </p>

          {/* Telegram Bot Link */}
          <a
            href="https://t.me/SalminaShopBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Открыть в Telegram
          </a>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
            @SalminaShopBot
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
