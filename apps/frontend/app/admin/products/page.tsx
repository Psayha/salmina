'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, deleteProduct } from '@/lib/api/endpoints/products';
import { Product } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';

export default function ProductsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: '',
    productName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getProducts({ limit: 100 });
        // Ensure items is always an array
        setData(Array.isArray(response?.items) ? response.items : []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    // Ensure data is array before filtering
    return Array.isArray(data)
      ? data.filter(
          (product) => product.name.toLowerCase().includes(query) || product.article.toLowerCase().includes(query),
        )
      : [];
  }, [data, searchQuery]);

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteModal({ isOpen: true, productId, productName });
    haptic?.impactOccurred('light');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    haptic?.impactOccurred('medium');

    try {
      await deleteProduct(deleteModal.productId);
      setData((prev) => prev.filter((p) => p.id !== deleteModal.productId));
      toast.success('Товар успешно удален');
      haptic?.notificationOccurred('success');
      setDeleteModal({ isOpen: false, productId: '', productName: '' });
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Ошибка при удалении товара');
      haptic?.notificationOccurred('error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Название',
        cell: ({ row }) => <div className="font-medium text-gray-900 dark:text-white">{row.getValue('name')}</div>,
      },
      {
        accessorKey: 'category',
        header: 'Категория',
        cell: ({ row }) => (
          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
            {/* @ts-expect-error - category might be an object or string depending on API */}
            {row.original.category?.name || row.getValue('category') || 'Без категории'}
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
        accessorKey: 'quantity',
        header: 'Остаток',
        cell: ({ row }) => {
          const quantity = (row.original.quantity || 0) as number;
          return (
            <div className={`font-medium ${quantity === 0 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
              {quantity} шт.
            </div>
          );
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
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  haptic?.impactOccurred('light');
                  router.push(`/admin/products/${row.original.id}`);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(row.original.id, row.original.name)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [router, haptic],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
          <SkeletonTable rows={5} columns={5} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: '', productName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Удалить товар?"
        description={`Вы уверены, что хотите удалить товар "${deleteModal.productName}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        isLoading={isDeleting}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Товары</h1>
            <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
              Управление каталогом товаров ({filteredData.length} шт.)
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по названию или артикулу..."
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
