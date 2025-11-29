'use client';

import { Eye, Truck, Package, CheckCircle, XCircle, Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/endpoints/orders';
import { Order } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { AdminCardGrid, CardWrapper } from '@/components/admin/AdminCardGrid';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusConfig: Record<Order['status'], { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PAID: { label: 'Оплачен', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', icon: CheckCircle },
  PROCESSING: { label: 'В обработке', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', icon: Package },
  SHIPPED: { label: 'Отправлен', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: Truck },
  DELIVERED: { label: 'Доставлен', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', icon: CheckCircle },
  CANCELLED: { label: 'Отменен', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: XCircle },
};

export default function OrdersPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const orders = await ordersApi.getOrders();
        setData(Array.isArray(orders) ? orders : []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setData([]);
        toast.error('Ошибка загрузки заказов');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (order) =>
        order.orderNumber?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    haptic?.impactOccurred('medium');

    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setData((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      haptic?.notificationOccurred('success');
      toast.success('Статус обновлен');
    } catch (error) {
      console.error('Failed to update order status:', error);
      haptic?.notificationOccurred('error');
      toast.error('Ошибка обновления статуса');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewOrder = (orderId: string) => {
    haptic?.impactOccurred('light');
    router.push(`/admin/orders/${orderId}`);
  };

  const renderOrderCard = (order: Order) => {
    const config = statusConfig[order.status] || statusConfig.PAID;
    const StatusIcon = config.icon;

    return (
      <CardWrapper key={order.id}>
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.customerName}
              </p>
            </div>
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>

          {/* Amount & Date */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {formatPrice(order.totalAmount)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(order.createdAt)}
            </span>
          </div>

          {/* Status Selector */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
              disabled={updatingOrderId === order.id}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
            >
              <option value="PAID">Оплачен</option>
              <option value="PROCESSING">В обработке</option>
              <option value="SHIPPED">Отправлен</option>
              <option value="DELIVERED">Доставлен</option>
              <option value="CANCELLED">Отменен</option>
            </select>
          </div>

          {/* View Button */}
          <button
            onClick={() => handleViewOrder(order.id)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/30 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Подробнее
          </button>
        </div>
      </CardWrapper>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Заказы</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            Управление заказами клиентов ({filteredData.length} шт.)
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по номеру заказа или имени клиента..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-light shadow-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <AdminCardGrid
          data={filteredData}
          renderCard={renderOrderCard}
          emptyMessage="Заказов пока нет"
          pageSize={9}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
