'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi, AdminStats } from '@/lib/api/endpoints/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      value: stats ? `₽ ${stats.revenue.toLocaleString()}` : '...',
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
      value: stats ? `₽ ${stats.averageCheck.toLocaleString()}` : '...',
      change: stats ? `+${stats.checkChange}%` : '...',
      icon: TrendingUp,
      color: 'from-orange-400 to-red-500',
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Загрузка...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>
        <p className="text-gray-500">Статистика магазина за сегодня</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color} text-white shadow-lg shadow-gray-200`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex items-center justify-center text-gray-400">
          График продаж (Placeholder)
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex items-center justify-center text-gray-400">
          Последние заказы (Placeholder)
        </div>
      </div>
    </div>
  );
}
