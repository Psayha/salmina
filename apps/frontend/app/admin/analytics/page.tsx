'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminStats } from '@/lib/api/endpoints/admin';
import { useTelegramBackButton } from '@/lib/telegram/useTelegram';
import { SkeletonStats } from '@/components/ui/Skeleton';

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Telegram back button - возврат в админку
  useTelegramBackButton(() => {
    router.push('/admin');
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

  const statItems = stats ? [
    {
      label: 'Общая выручка',
      value: `₽${stats.revenue.toLocaleString()}`,
      change: `+${stats.revenueChange}%`,
      icon: DollarSign,
      color: 'from-green-400 to-emerald-500',
      isPositive: stats.revenueChange > 0,
    },
    {
      label: 'Активные заказы',
      value: stats.activeOrders.toString(),
      change: `+${stats.ordersChange}%`,
      icon: ShoppingBag,
      color: 'from-blue-400 to-indigo-500',
      isPositive: stats.ordersChange > 0,
    },
    {
      label: 'Новые клиенты',
      value: stats.newCustomers.toString(),
      change: `+${stats.customersChange}%`,
      icon: Users,
      color: 'from-purple-400 to-pink-500',
      isPositive: stats.customersChange > 0,
    },
    {
      label: 'Средний чек',
      value: `₽${stats.averageCheck.toLocaleString()}`,
      change: `+${stats.checkChange}%`,
      icon: TrendingUp,
      color: 'from-orange-400 to-red-500',
      isPositive: stats.checkChange > 0,
    },
    {
      label: 'Всего товаров',
      value: stats.totalProducts?.toString() || '0',
      change: '',
      icon: Package,
      color: 'from-pink-400 to-rose-500',
      isPositive: true,
    },
  ] : [];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin')}
          className="p-2 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Аналитика</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            Статистика магазина за сегодня
          </p>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <SkeletonStats count={5} />
      ) : (
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
                    <span
                      className={`text-xs font-light px-2 py-1 rounded-lg ${
                        stat.isPositive
                          ? 'text-green-600 bg-green-50'
                          : 'text-red-600 bg-red-50'
                      }`}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info */}
      {!isLoading && stats && (
        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-white/10 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Данные в реальном времени
          </h2>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300">
            Статистика обновляется автоматически и отображает актуальные данные из базы данных.
            Все значения рассчитываются на основе реальных заказов, пользователей и товаров.
          </p>
        </div>
      )}
    </div>
  );
}
