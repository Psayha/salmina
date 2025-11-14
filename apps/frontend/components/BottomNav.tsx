'use client';

import { usePathname, useRouter } from 'next/navigation';
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-white/30 shadow-lg z-50">
      <div className="flex items-center justify-around px-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="relative flex flex-col items-center gap-1 py-2 px-4 transition-all duration-300"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}
                />
                {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-light rounded-full flex items-center justify-center">
                    {item.badgeCount > 9 ? '9+' : item.badgeCount}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-light transition-colors duration-300 ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-900 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
