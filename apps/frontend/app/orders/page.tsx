'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Button } from '@/components/ui';
import Image from 'next/image';
import { ordersApi, Order as ApiOrder } from '@/lib/api/endpoints/orders';

// UI display type for orders
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  total: number;
  itemsCount: number;
  items: Array<{
    id: string;
    productName: string;
    productEmoji?: string;
    productImage?: string;
    quantity: number;
    price: number;
  }>;
}

const statusLabels: Record<Order['status'], string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-700',
  paid: 'bg-blue-500/20 border-blue-500/30 text-blue-700',
  shipped: 'bg-purple-500/20 border-purple-500/30 text-purple-700',
  delivered: 'bg-green-500/20 border-green-500/30 text-green-700',
  cancelled: 'bg-red-500/20 border-red-500/30 text-red-700',
};

// Transform API order to UI order
function transformOrder(apiOrder: ApiOrder): Order {
  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    status: apiOrder.status.toLowerCase() as Order['status'],
    createdAt: apiOrder.createdAt,
    total: apiOrder.totalAmount,
    itemsCount: apiOrder.items.length,
    items: apiOrder.items,
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const haptic = useTelegramHaptic();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useTelegramBackButton(() => {
    if (selectedOrder) {
      setSelectedOrder(null);
      haptic.impactOccurred('light');
    } else {
      router.back();
    }
  });

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);

        // Fetch orders from API
        const apiOrders = await ordersApi.getOrders();

        // Transform API orders to UI format
        const transformedOrders = apiOrders.map(transformOrder);

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        haptic.notificationOccurred('error');
        setOrders([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, haptic]);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId);
    haptic.impactOccurred('light');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border border-white/30 shadow-lg text-center max-w-md">
          <h2 className="text-xl font-light text-gray-900 mb-3">Требуется авторизация</h2>
          <p className="text-sm font-light text-gray-600 mb-6">
            Войдите в аккаунт, чтобы просматривать историю заказов
          </p>
          <Button onClick={() => router.push('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white/30 rounded-xl w-80"></div>
            <div className="h-24 bg-white/30 rounded-xl w-80"></div>
            <div className="h-24 bg-white/30 rounded-xl w-80"></div>
          </div>
        </div>
      </div>
    );
  }

  // Order details view
  if (selectedOrder) {
    const order = orders.find((o) => o.id === selectedOrder);
    if (!order) {
      setSelectedOrder(null);
      return null;
    }

    return (
      <div className="min-h-screen relative z-10 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
          <div className="px-6 py-6">
            <h1 className="text-2xl font-light text-gray-900">Заказ {order.orderNumber}</h1>
            <p className="text-sm font-light text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Status */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-3">Статус заказа</h2>
            <div
              className={`inline-block px-4 py-2 rounded-full border backdrop-blur-md ${statusColors[order.status]}`}
            >
              <span className="text-sm font-light">{statusLabels[order.status]}</span>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg space-y-4">
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-4">Состав заказа</h2>

            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-white/30 last:border-0 last:pb-0">
                <div className="relative w-16 h-16 bg-white/30 rounded-xl overflow-hidden shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-3xl">{item.productEmoji || '🎁'}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-base font-light text-gray-900 mb-1">{item.productName}</p>
                  <p className="text-sm font-light text-gray-600">
                    {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-base font-light text-gray-900">
                    {(item.quantity * item.price).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-base font-light text-gray-900">Итого:</span>
              <span className="text-2xl font-light text-gray-900">{order.total.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Actions */}
          {order.status === 'delivered' && <Button className="w-full">Повторить заказ</Button>}
        </div>
      </div>
    );
  }

  // Orders list view
  const isEmpty = orders.length === 0;

  return (
    <div className="min-h-screen relative z-10 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-light text-gray-900">Мои заказы</h1>
          {!isEmpty && <p className="text-sm font-light text-gray-600 mt-1">Всего заказов: {orders.length}</p>}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border border-white/30 shadow-lg text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-5xl">📦</span>
            </div>
            <h2 className="text-xl font-light text-gray-900 mb-3">Заказов пока нет</h2>
            <p className="text-sm font-light text-gray-600 mb-6">Оформите первый заказ и он появится здесь</p>
            <Button onClick={() => router.push('/')}>Перейти к покупкам</Button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-6 space-y-4">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => handleOrderClick(order.id)}
              className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-lg hover:bg-white/50 transition-all duration-300 text-left"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-base font-light text-gray-900 mb-1">Заказ {order.orderNumber}</p>
                  <p className="text-xs font-light text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full border backdrop-blur-md ${statusColors[order.status]}`}>
                  <span className="text-xs font-light">{statusLabels[order.status]}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/30">
                <span className="text-sm font-light text-gray-600">
                  {order.itemsCount} {order.itemsCount === 1 ? 'товар' : 'товаров'}
                </span>
                <span className="text-lg font-light text-gray-900">{order.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
