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
    haptic.impactOccurred('light');
    router.push(href);
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="mx-auto max-w-md px-4 pb-2">
        <div className="relative flex items-center justify-around gap-2 rounded-2xl bg-card-bg/80 backdrop-blur-xl border border-card-border/50 px-4 py-2 shadow-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {/* Icon container */}
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-pink-500' : 'text-foreground/60'}`} />
                  {/* Badge */}
                  {item.showBadge && item.badgeCount! > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-semibold text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      {item.badgeCount! > 9 ? '9+' : item.badgeCount}
                    </motion.span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-pink-500' : 'text-foreground/50'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 left-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-pink-500 to-blue-500"
                    layoutId="activeTab"
                    style={{ x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
