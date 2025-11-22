'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ordersApi, Order } from '@/lib/api/endpoints/orders';

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
      const status = row.getValue('status') as string;
      const styles = {
        PAID: 'bg-green-100 text-green-700',
        PENDING: 'bg-yellow-100 text-yellow-700',
        SHIPPED: 'bg-blue-100 text-blue-700',
        DELIVERED: 'bg-purple-100 text-purple-700',
        CANCELLED: 'bg-red-100 text-red-700',
      };
      const labels = {
        PAID: 'Оплачен',
        PENDING: 'Ожидает',
        SHIPPED: 'Отправлен',
        DELIVERED: 'Доставлен',
        CANCELLED: 'Отменен',
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'
          }`}
        >
          {labels[status as keyof typeof labels] || status}
        </span>
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
  {
    id: 'actions',
    cell: () => {
      return (
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      );
    },
  },
];

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const orders = await ordersApi.getOrders();
        setData(orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="text-gray-500">Управление заказами клиентов</p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
