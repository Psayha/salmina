'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, Package, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useTelegramBackButton } from '@/lib/telegram/useTelegram';
import { Order, Product } from '@/lib/api/types';

interface StatsData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  topProducts: Product[];
  revenueChart: { date: string; revenue: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Не удалось загрузить данные
      </div>
    );
  }

  const maxRevenue = Math.max(...data.revenueChart.map((d) => Number(d.revenue)), 1);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-light text-gray-900 dark:text-white">Аналитика</h1>
        <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
          Статистика и отчеты магазина
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Выручка</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {Number(data.totalRevenue).toLocaleString('ru-RU')} ₽
          </p>
        </div>

        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-medium">Заказы</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data.totalOrders}</p>
        </div>

        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Клиенты</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data.totalUsers}</p>
        </div>

        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <Package className="w-4 h-4" />
            <span className="text-xs font-medium">Товары</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data.totalProducts}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          Выручка за 7 дней
        </h3>

        <div className="h-32 flex items-end justify-between gap-2">
          {data.revenueChart.map((item, index) => {
            const height = (Number(item.revenue) / maxRevenue) * 100;
            const date = new Date(item.date).toLocaleDateString('ru-RU', { weekday: 'short' });

            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full relative group">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className="w-full bg-pink-200 dark:bg-pink-500/30 rounded-t-sm hover:bg-pink-300 dark:hover:bg-pink-500/50 transition-colors relative min-h-[4px]"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                      {Number(item.revenue).toLocaleString()} ₽
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-white/30 dark:border-white/10">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Последние заказы</h3>
        </div>
        <div className="divide-y divide-white/30 dark:divide-white/10">
          {data.recentOrders.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Нет заказов</div>
          ) : (
            data.recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.orderNumber}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {Number(order.totalAmount).toLocaleString()} ₽
                  </div>
                  <div
                    className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 ${
                      order.status === 'PAID'
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                        : order.status === 'SHIPPED'
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {order.status === 'PAID' ? 'Оплачен' : order.status === 'SHIPPED' ? 'Отправлен' : order.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
