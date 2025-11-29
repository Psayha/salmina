'use client';

import { Plus, Pencil, Trash, Search, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, deleteProduct } from '@/lib/api/endpoints/products';
import { Product } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { AdminCardGrid, CardWrapper } from '@/components/admin/AdminCardGrid';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
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
    return Array.isArray(data)
      ? data.filter(
          (product) => product.name.toLowerCase().includes(query) || product.article.toLowerCase().includes(query),
        )
      : [];
  }, [data, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, productId: string, productName: string) => {
      e.stopPropagation();
      setDeleteModal({ isOpen: true, productId, productName });
      haptic?.impactOccurred('light');
    },
    [haptic],
  );

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

  const handleCardClick = (slug: string) => {
    haptic?.impactOccurred('light');
    router.push(`/admin/products/${slug}`);
  };

  const renderProductCard = (product: Product) => {
    const imageUrl = product.images?.[0]
      ? product.images[0].startsWith('http')
        ? product.images[0]
        : `https://app.salminashop.ru${product.images[0]}`
      : null;

    return (
      <CardWrapper key={product.id} onClick={() => handleCardClick(product.slug)}>
        {/* Image */}
        <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                product.isActive
                  ? 'bg-green-500/90 text-white'
                  : 'bg-gray-500/90 text-white'
              }`}
            >
              {product.isActive ? 'Активен' : 'Черновик'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Name & Category */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {/* @ts-expect-error - category might be an object */}
              {product.category?.name || 'Без категории'}
            </p>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-pink-600 dark:text-pink-400">
              {formatPrice(product.price)}
            </span>
            <span className={`text-sm ${product.quantity === 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {product.quantity} шт.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(product.slug);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-500/30 transition-colors text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Редактировать
            </button>
            <button
              onClick={(e) => handleDeleteClick(e, product.id, product.name)}
              className="p-2 bg-red-50 dark:bg-red-500/20 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardWrapper>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl overflow-hidden">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
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

        <AdminCardGrid
          data={filteredData}
          renderCard={renderProductCard}
          emptyMessage="Товары не найдены"
          pageSize={9}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
