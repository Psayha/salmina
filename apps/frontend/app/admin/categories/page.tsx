'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, deleteCategory } from '@/lib/api/endpoints/categories';
import { Category } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';

export default function CategoriesPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: string; categoryName: string }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((category) => category.name.toLowerCase().includes(query));
  }, [data, searchQuery]);

  const handleDeleteClick = useCallback(
    (category: Category) => {
      setDeleteModal({ isOpen: true, categoryId: category.id, categoryName: category.name });
      haptic?.impactOccurred('light');
    },
    [haptic],
  );

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    haptic?.impactOccurred('medium');

    try {
      await deleteCategory(deleteModal.categoryId);
      setData((prev) => prev.filter((c) => c.id !== deleteModal.categoryId));
      toast.success('Категория успешно удалена');
      haptic?.notificationOccurred('success');
      setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Ошибка при удалении категории');
      haptic?.notificationOccurred('error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Category>[] = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Фото',
        cell: ({ row }) => (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {row.original.image ? (
              <Image src={row.original.image} alt={row.original.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Название',
        cell: ({ row }) => <div className="font-medium text-gray-900 dark:text-white">{row.original.name}</div>,
      },
      {
        accessorKey: 'productsCount',
        header: 'Товары',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.original._count?.products || 0} шт.</div>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Статус',
        cell: ({ row }) => (
          <div
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              row.original.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {row.original.isActive ? 'Активна' : 'Скрыта'}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  haptic?.impactOccurred('light');
                  router.push(`/admin/categories/${row.original.id}`);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(row.original)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [handleDeleteClick, router, haptic],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
          <SkeletonTable rows={5} columns={3} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Удалить категорию?"
        description={`Вы уверены, что хотите удалить категорию "${deleteModal.categoryName}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        isLoading={isDeleting}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Категории</h1>
            <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
              Управление категориями товаров ({filteredData.length} шт.)
            </p>
          </div>
          <Link
            href="/admin/categories/new"
            onClick={() => haptic?.impactOccurred('light')}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-pink-500/30 font-light"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить</span>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light shadow-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-white/10 overflow-hidden">
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>
    </>
  );
}
