'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminStats } from '@/lib/api/endpoints/admin';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

export default function AdminDashboard() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Telegram back button - возврат на главную
  useTelegramBackButton(() => {
    router.push('/');
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statItems = [
    {
      label: 'Общая выручка',
      value: stats ? `₽${stats.revenue.toLocaleString()}` : '...',
      change: stats ? `+${stats.revenueChange}%` : '...',
      icon: DollarSign,
      color: 'from-green-400 to-emerald-500',
    },
    {
      label: 'Активные заказы',
      value: stats ? stats.activeOrders.toString() : '...',
      change: stats ? `+${stats.ordersChange}%` : '...',
      icon: ShoppingBag,
      color: 'from-blue-400 to-indigo-500',
    },
    {
      label: 'Новые клиенты',
      value: stats ? stats.newCustomers.toString() : '...',
      change: stats ? `+${stats.customersChange}%` : '...',
      icon: Users,
      color: 'from-purple-400 to-pink-500',
    },
    {
      label: 'Средний чек',
      value: stats ? `₽${stats.averageCheck.toLocaleString()}` : '...',
      change: stats ? `+${stats.checkChange}%` : '...',
      icon: TrendingUp,
      color: 'from-orange-400 to-red-500',
    },
    {
      label: 'Всего товаров',
      value: stats ? stats.totalProducts?.toString() || '0' : '...',
      change: '',
      icon: Package,
      color: 'from-pink-400 to-rose-500',
    },
  ];

  const quickActions = [
    {
      label: 'Добавить товар',
      description: 'Создать новый товар',
      href: '/admin/products',
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Просмотр заказов',
      description: 'Управление заказами',
      href: '/admin/orders',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Категории',
      description: 'Управление категориями',
      href: '/admin/categories',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 font-light">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-gray-900">
          Обзор{' '}
          <span className="text-base text-gray-500 font-light">панели управления</span>
        </h1>
        <p className="text-sm font-light text-gray-600 mt-1">Статистика магазина за сегодня</p>
      </div>

      {/* Stats Grid: 3 in a row on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {stat.change && (
                  <span className="text-xs font-light text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-600 font-light uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-light text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-light text-gray-900 mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => {
                haptic?.impactOccurred('light');
                router.push(action.href);
              }}
              className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-light text-gray-900 mb-1">{action.label}</h3>
                  <p className="text-xs font-light text-gray-600">{action.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
