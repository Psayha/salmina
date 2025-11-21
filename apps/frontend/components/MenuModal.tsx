'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Heart, ShoppingBag, Search, Package, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_USER_ID = 887567962;

const menuItems = [
  { icon: User, label: 'Профиль', path: '/profile' },
  { icon: Heart, label: 'Избранное', path: '/favorites' },
  { icon: ShoppingBag, label: 'Корзина', path: '/cart' },
  { icon: Package, label: 'Заказы', path: '/orders' },
  { icon: Search, label: 'Поиск', path: '/search' },
];

const adminMenuItem = {
  icon: Settings,
  label: 'Админ-панель',
  path: '/admin',
};

export const MenuModal = ({ isOpen, onClose }: MenuModalProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Check if user is admin
  const isAdmin = user?.telegramId === String(ADMIN_USER_ID);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[101] bg-[var(--card-bg)] backdrop-blur-xl rounded-t-3xl border-t border-[var(--card-border)] shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              maxHeight: '80vh',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
              <h2 className="text-xl font-light tracking-wide uppercase text-[var(--foreground)]">Меню</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-6 h-6 text-[var(--foreground)]" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <item.icon className="w-6 h-6 text-[var(--foreground)]" />
                  </div>
                  <span className="text-base font-light text-[var(--foreground)]">{item.label}</span>
                </motion.button>
              ))}

              {/* Admin Menu Item */}
              {isAdmin && (
                <motion.button
                  onClick={() => handleNavigate(adminMenuItem.path)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 group border border-purple-500/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: menuItems.length * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <adminMenuItem.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-base font-light text-purple-300">{adminMenuItem.label}</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
