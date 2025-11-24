'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, ShoppingBag, Package, Calendar } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-center text-gray-500">Не удалось загрузить данные</div>;
  }

  const maxRevenue = Math.max(...data.revenueChart.map((d) => Number(d.revenue)), 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Аналитика</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Выручка</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{Number(data.totalRevenue).toLocaleString('ru-RU')} ₽</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-medium">Заказы</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{data.totalOrders}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Клиенты</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{data.totalUsers}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium">Товары</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{data.totalProducts}</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            Выручка за 7 дней
          </h3>

          <div className="h-40 flex items-end justify-between gap-2">
            {data.revenueChart.map((item, index) => {
              const height = (Number(item.revenue) / maxRevenue) * 100;
              const date = new Date(item.date).toLocaleDateString('ru-RU', { weekday: 'short' });

              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full relative group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      className="w-full bg-pink-100 rounded-t-sm hover:bg-pink-200 transition-colors relative min-h-[4px]"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                        {Number(item.revenue).toLocaleString()} ₽
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize">{date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Последние заказы</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentOrders.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Нет заказов</div>
            ) : (
              data.recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {Number(order.totalAmount).toLocaleString()} ₽
                    </div>
                    <div
                      className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 ${
                        order.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
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
    </div>
  );
}
