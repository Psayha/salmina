'use client';

import { useEffect } from 'react';
import { Ban } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Check if user is blocked based on user state and error message
 */
function checkIsBlocked(user: { isActive?: boolean } | null, error: string | null): boolean {
  // User object exists with isActive === false
  const userBlocked = user && user.isActive === false;
  // Auth error contains blocking-related messages from backend
  const authErrorBlocked =
    error &&
    (error.includes('disabled') ||
      error.includes('deactivated') ||
      error.includes('заблокирован'));

  return !!(userBlocked || authErrorBlocked);
}

export function UserBlockedGuard({ children }: { children: React.ReactNode }) {
  const { user, error } = useAuthStore();

  // Check synchronously on every render - no useState to avoid race condition
  const isBlocked = checkIsBlocked(user, error);

  useEffect(() => {
    // Manage body scroll based on blocked state
    if (isBlocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isBlocked]);

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  if (isBlocked) {
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

  return <>{children}</>;
}
