'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/endpoints/orders';
import { Order } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { ArrowLeft, Package, User, Truck, MapPin, Phone, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin/orders');
  });

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await ordersApi.getOrder(params.id);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        alert('Ошибка при загрузке заказа');
        router.push('/admin/orders');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [params.id, router]);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order || isUpdating) return;

    setIsUpdating(true);
    haptic?.impactOccurred('medium');

    try {
      const updatedOrder = await ordersApi.updateStatus(order.id, newStatus);
      setOrder(updatedOrder);
      haptic?.notificationOccurred('success');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Ошибка при обновлении статуса');
      haptic?.notificationOccurred('error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 font-light">Загрузка заказа...</div>
      </div>
    );
  }

  if (!order) return null;

  const statusColors = {
    PAID: 'bg-green-100 text-green-700 border-green-200',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PROCESSING: 'bg-orange-100 text-orange-700 border-orange-200',
    SHIPPED: 'bg-blue-100 text-blue-700 border-blue-200',
    DELIVERED: 'bg-purple-100 text-purple-700 border-purple-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusLabels = {
    PAID: 'Оплачен',
    PENDING: 'Ожидает оплаты',
    PROCESSING: 'В обработке',
    SHIPPED: 'Отправлен',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменен',
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-gray-900">Заказ #{order.orderNumber}</h1>
          <p className="text-sm font-light text-gray-600 mt-1">
            от{' '}
            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-500" />
              Товары ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.productName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Артикул: {item.productArticle}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-600">
                        {item.quantity} шт. × {item.price.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="font-medium text-gray-900">
                        {(item.quantity * item.price).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Сумма товаров</span>
                <span>{order.subtotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              {order.itemsDiscount > 0 && (
                <div className="flex justify-between text-sm text-pink-600">
                  <span>Скидка на товары</span>
                  <span>-{order.itemsDiscount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              {order.promocodeDiscount > 0 && (
                <div className="flex justify-between text-sm text-pink-600">
                  <span>Промокод</span>
                  <span>-{order.promocodeDiscount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-medium text-gray-900 pt-2 border-t border-gray-100">
                <span>Итого</span>
                <span>{order.totalAmount.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Status */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Статус заказа</h2>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
              disabled={isUpdating}
              className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                statusColors[order.status]
              }`}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-500" />
              Клиент
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500">Имя получателя</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customerPhone}</p>
                  <p className="text-xs text-gray-500">Телефон</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.shippingAddress}</p>
                  <p className="text-xs text-gray-500">Адрес доставки</p>
                </div>
              </div>

              {order.notes && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.notes}</p>
                    <p className="text-xs text-gray-500">Комментарий к заказу</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          {order.trackingNumber && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-pink-500" />
                Доставка
              </h2>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Трек-номер</p>
                <p className="font-mono text-gray-900">{order.trackingNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
