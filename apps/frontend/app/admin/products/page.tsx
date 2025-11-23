'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, deleteProduct } from '@/lib/api/endpoints/products';
import { Product } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Категория',
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
        {/* @ts-expect-error - category might be an object or string depending on API */}
        {row.original.category?.name || row.getValue('category')}
      </span>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Цена',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'stock',
    header: 'Остаток',
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      return <div className={`font-medium ${stock === 0 ? 'text-red-500' : 'text-gray-600'}`}>{stock} шт.</div>;
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Статус',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isActive ? 'Активен' : 'Черновик'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const router = useRouter();

      const handleDelete = async () => {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
          try {
            await deleteProduct(row.original.id);
            window.location.reload(); // Simple reload for now
          } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Ошибка при удалении товара');
          }
        }
      };

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/products/${row.original.id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Telegram back button - возврат в dashboard
  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getProducts({ limit: 100 });
        setData(response.items);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 font-light">Загрузка товаров...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Товары</h1>
          <p className="text-sm font-light text-gray-600 mt-1">
            Управление каталогом товаров ({data.length} шт.)
          </p>
        </div>
        <Link
          href="/admin/products/new"
          onClick={() => haptic?.impactOccurred('light')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-pink-500/30 font-light"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить</span>
        </Link>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
