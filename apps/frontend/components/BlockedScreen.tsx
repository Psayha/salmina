'use client';

import { useEffect } from 'react';
import { Ban } from 'lucide-react';

export function BlockedScreen() {
  useEffect(() => {
    // Block background scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
      {/* Icon */}
      <div className="w-24 h-24 mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
        <Ban className="w-12 h-12 text-red-500" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-medium text-white mb-3">
        Доступ заблокирован
      </h1>

      {/* Description */}
      <p className="text-gray-400 font-light mb-8 max-w-sm">
        Ваш аккаунт был заблокирован администратором.
        Если вы считаете, что это ошибка, обратитесь в поддержку.
      </p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="px-8 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors"
      >
        Закрыть приложение
      </button>
    </div>
  );
}
