'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users } from 'lucide-react';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

const navItems = [
  { icon: LayoutDashboard, label: 'Обзор', href: '/admin' },
  { icon: Package, label: 'Товары', href: '/admin/products' },
  { icon: Tags, label: 'Категории', href: '/admin/categories' },
  { icon: ShoppingCart, label: 'Заказы', href: '/admin/orders' },
  { icon: Users, label: 'Юзеры', href: '/admin/users' },
];

export const AdminBottomNav = () => {
  const pathname = usePathname();
  const haptic = useTelegramHaptic();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-white/30 shadow-lg"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => haptic?.impactOccurred('light')}
              className="flex-1 flex flex-col items-center gap-1 py-2 transition-all"
            >
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-pink-500/20 to-blue-500/20 shadow-lg shadow-pink-500/10'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-pink-600' : 'text-gray-500'
                  }`}
                />
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] font-light transition-colors ${
                  isActive ? 'text-pink-600' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
