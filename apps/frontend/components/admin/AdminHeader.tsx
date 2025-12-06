'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

export const AdminHeader = () => {
  const router = useRouter();
  const { impactOccurred } = useTelegramHaptic();

  const handleExitAdmin = () => {
    impactOccurred('medium');
    router.push('/');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 md:left-64"
      style={{
        paddingTop: 'var(--safe-top, env(safe-area-inset-top))',
      }}
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-center">
        {/* Admin Badge - clickable to exit admin */}
        <button
          onClick={handleExitAdmin}
          className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          <span className="text-xs font-medium tracking-wide">
            <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-semibold">
              SALMINA
            </span>{' '}
            <span className="text-gray-800 dark:text-gray-200">ADMIN</span>
          </span>
          <LogOut className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </header>
  );
};
