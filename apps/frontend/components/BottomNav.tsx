'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { CartIcon, UserIcon, HeartIcon, SearchIcon } from './ui/icons';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  showBadge?: boolean;
  badgeCount?: number;
}

export const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { itemsCount } = useCartStore();
  const { favoriteIds } = useFavoritesStore();
  const haptic = useTelegramHaptic();

  const navItems: NavItem[] = [
    {
      icon: SearchIcon,
      label: 'Каталог',
      href: '/',
    },
    {
      icon: HeartIcon,
      label: 'Избранное',
      href: '/favorites',
      showBadge: true,
      badgeCount: favoriteIds.length,
    },
    {
      icon: CartIcon,
      label: 'Корзина',
      href: '/cart',
      showBadge: true,
      badgeCount: itemsCount,
    },
    {
      icon: UserIcon,
      label: 'Профиль',
      href: '/profile',
    },
  ];

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      haptic.selectionChanged();
      router.push(href);
    }
  };

  // Don't show on checkout pages
  if (pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-4 px-4 pointer-events-none">
      <motion.nav
        className="mx-auto max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 pointer-events-auto"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-pink-100 to-blue-100 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}

                <div className="relative z-10">
                  <Icon
                    className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}
                  />
                  {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-400 to-pink-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {item.badgeCount > 9 ? '9+' : item.badgeCount}
                    </motion.span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-light transition-colors duration-300 relative z-10 ${
                    isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
};
