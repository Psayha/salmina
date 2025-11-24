'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Home, LayoutGrid, Heart, User } from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  href: string;
  showBadge?: boolean;
  badgeCount?: number;
}

export const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { favoriteIds } = useFavoritesStore();
  const haptic = useTelegramHaptic();

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: 'Главная',
      href: '/',
    },
    {
      icon: LayoutGrid,
      label: 'Каталог',
      href: '/search',
    },
    {
      icon: Heart,
      label: 'Избранное',
      href: '/favorites',
      showBadge: true,
      badgeCount: favoriteIds.length,
    },
    {
      icon: User,
      label: 'Профиль',
      href: '/profile',
    },
  ];

  const handleNavClick = (href: string) => {
    haptic?.impactOccurred('light');
    router.push(href);
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <motion.nav
      className="fixed bottom-6 left-4 right-4 z-40 mx-auto max-w-md bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="relative flex flex-col items-center gap-1 p-2 transition-colors"
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive ? 'text-pink-500 scale-110' : 'text-gray-400'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.showBadge && item.badgeCount! > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white border-2 border-white">
                      {item.badgeCount! > 9 ? '9+' : item.badgeCount}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-pink-500' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
