'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, LogOut } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Обзор', href: '/admin' },
  { icon: Package, label: 'Товары', href: '/admin/products' },
  { icon: Tags, label: 'Категории', href: '/admin/categories' },
  { icon: ShoppingCart, label: 'Заказы', href: '/admin/orders' },
  { icon: Users, label: 'Пользователи', href: '/admin/users' },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 z-50 hidden md:flex flex-col">
      <div className="p-6 border-b border-gray-100">
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
                  isActive ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-pink-500' : 'text-gray-400'}`} />
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

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  );
};
