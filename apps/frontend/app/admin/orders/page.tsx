'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, Order } from '@/lib/api/endpoints/orders';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Номер',
    cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue('orderNumber')}</div>,
  },
  {
    accessorKey: 'customerName',
    header: 'Клиент',
    cell: ({ row }) => <div className="text-gray-600">{row.getValue('customerName')}</div>,
  },
  {
    accessorKey: 'totalAmount',
    header: 'Сумма',
    cell: ({ row }) => {
      const total = parseFloat(row.getValue('totalAmount'));
      const formatted = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(total);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const [status, setStatus] = useState(row.getValue('status') as Order['status']);
      const [isUpdating, setIsUpdating] = useState(false);
      const haptic = useTelegramHaptic();

      const handleStatusChange = async (newStatus: Order['status']) => {
        if (newStatus === status) return;

        setIsUpdating(true);
        haptic?.impactOccurred('medium');

        try {
          await ordersApi.updateStatus(row.original.id, newStatus);
          setStatus(newStatus);
          haptic?.notificationOccurred('success');
        } catch (error) {
          console.error('Failed to update order status:', error);
          haptic?.notificationOccurred('error');
          alert('Ошибка при обновлении статуса');
        } finally {
          setIsUpdating(false);
        }
      };

      const styles = {
        PAID: 'bg-green-100 text-green-700 border-green-200',
        PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        PROCESSING: 'bg-orange-100 text-orange-700 border-orange-200',
        SHIPPED: 'bg-blue-100 text-blue-700 border-blue-200',
        DELIVERED: 'bg-purple-100 text-purple-700 border-purple-200',
        CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      };

      return (
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
          disabled={isUpdating}
          className={`px-2 py-1 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 ${
            styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          <option value="PAID">Оплачен</option>
          <option value="PROCESSING">В обработке</option>
          <option value="SHIPPED">Отправлен</option>
          <option value="DELIVERED">Доставлен</option>
          <option value="CANCELLED">Отменен</option>
        </select>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    cell: ({ row }) => (
      <div className="text-gray-500 text-sm">{new Date(row.getValue('createdAt')).toLocaleDateString('ru-RU')}</div>
    ),
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Telegram back button - возврат в dashboard
  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const orders = await ordersApi.getOrders();
        setData(orders);
        haptic?.notificationOccurred('success');
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        haptic?.notificationOccurred('error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [haptic]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 font-light">Загрузка заказов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-gray-900">Заказы</h1>
        <p className="text-sm font-light text-gray-600 mt-1">
          Управление заказами клиентов ({data.length} шт.)
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
