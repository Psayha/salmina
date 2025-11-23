'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, deleteCategory } from '@/lib/api/endpoints/categories';
import { Category } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => <span className="text-gray-500 font-mono text-xs">/{row.getValue('slug')}</span>,
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
          {isActive ? 'Активна' : 'Скрыта'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const handleDelete = async () => {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
          try {
            await deleteCategory(row.original.id);
            window.location.reload();
          } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Ошибка при удалении категории');
          }
        }
      };

      return (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
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

export default function CategoriesPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Telegram back button - возврат в dashboard
  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const categories = await getCategories();
        setData(categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 font-light">Загрузка категорий...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Категории</h1>
          <p className="text-sm font-light text-gray-600 mt-1">
            Управление категориями товаров ({data.length} шт.)
          </p>
        </div>
        <Link
          href="/admin/categories/new"
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
