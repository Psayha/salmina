'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, HelpCircle, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_USER_ID = 887567962;

export const MenuModal = ({ isOpen, onClose }: MenuModalProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const haptic = useTelegramHaptic();

  const isAdmin = user?.telegramId === String(ADMIN_USER_ID);

  const handleNavigate = (path: string) => {
    haptic?.impactOccurred('light');
    router.push(path);
    onClose();
  };

  const menuItems = [
    { icon: Package, label: 'Мои заказы', path: '/orders' },
    { icon: HelpCircle, label: 'Поддержка', path: '/support' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Меню</h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-base font-light text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Admin Button */}
              {isAdmin && (
                <button
                  onClick={() => handleNavigate('/admin')}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-5 h-5 text-purple-500" />
                  <span className="text-base font-light text-purple-600 dark:text-purple-400">
                    Админ-панель
                  </span>
                </button>
              )}
            </div>

            {/* User Info */}
            {user && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.firstName || user.username || 'Пользователь'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {user.telegramId}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom padding */}
            <div className="h-4" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
