'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Settings, HelpCircle } from 'lucide-react';
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

  // Simplified menu - only items not in BottomNav or Header
  const menuItems = [
    { icon: Package, label: 'Мои заказы', path: '/orders', badge: null },
    { icon: HelpCircle, label: 'Поддержка', path: '/support', badge: null },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal - appears below header */}
          <motion.div
            className="fixed left-0 right-0 z-[101] mx-auto max-w-md px-3"
            style={{
              top: 'calc(var(--safe-top, 0px) + 56px)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Меню</h2>
                <motion.button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>

              {/* Menu Items */}
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Admin Button */}
                {isAdmin && (
                  <motion.button
                    onClick={() => handleNavigate('/admin')}
                    className="w-full mt-3 flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 hover:from-purple-500/20 hover:to-pink-500/20 dark:hover:from-purple-500/30 dark:hover:to-pink-500/30 border border-purple-200 dark:border-purple-500/30 transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      Админ-панель
                    </span>
                  </motion.button>
                )}
              </div>

              {/* User Info */}
              {user && (
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
