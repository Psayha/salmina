'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, LogOut, ImageIcon } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Обзор', href: '/admin' },
  { icon: Package, label: 'Товары', href: '/admin/products' },
  { icon: Tags, label: 'Категории', href: '/admin/categories' },
  { icon: ShoppingCart, label: 'Заказы', href: '/admin/orders' },
  { icon: Users, label: 'Пользователи', href: '/admin/users' },
  { icon: ImageIcon, label: 'Загрузки', href: '/admin/uploads' },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 z-50 hidden md:flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-bold bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
          Salmina Admin
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-pink-500 dark:text-pink-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute left-0 w-1 h-8 bg-pink-500 rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  );
};
