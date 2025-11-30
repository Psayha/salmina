'use client';

import { Plus, Trash, Search, Package, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, deleteProduct } from '@/lib/api/endpoints/products';
import { getCategories } from '@/lib/api/endpoints/categories';
import { Product, Category } from '@/lib/api/types';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
        const [productsResponse, categoriesData] = await Promise.all([
          getProducts({ limit: 100 }),
          getCategories(),
        ]);
        setData(Array.isArray(productsResponse?.items) ? productsResponse.items : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setData([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? data : [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) => product.name.toLowerCase().includes(query) || product.article?.toLowerCase().includes(query),
      );
    }

    if (selectedCategory) {
      result = result.filter((product) => product.categoryId === selectedCategory);
    }

    return result;
  }, [data, searchQuery, selectedCategory]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategory]);

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

    const categoryName = categories.find((c) => c.id === product.categoryId)?.name;

    return (
      <CardWrapper key={product.id} onClick={() => handleCardClick(product.slug)}>
        <div className="flex gap-3 p-3">
          {/* Image - small square */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            {/* Top: Name & Category */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 text-sm">
                {product.name}
              </h3>
              {categoryName && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                  {categoryName}
                </p>
              )}
            </div>

            {/* Bottom: Price & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                {formatPrice(product.price)}
              </span>
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                product.quantity === 0
                  ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {product.quantity} шт
              </span>
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                product.isActive
                  ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {product.isActive ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
              </span>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => handleDeleteClick(e, product.id, product.name)}
            className="self-center p-2 bg-red-50 dark:bg-red-500/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors flex-shrink-0"
          >
            <Trash className="w-4 h-4" />
          </button>
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
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-3 flex gap-3">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Товары</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            Управление каталогом товаров ({filteredData.length} шт.)
          </p>
        </div>

        {/* Search, Filter & Add */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light shadow-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light shadow-lg text-gray-900 dark:text-white flex-shrink-0 text-sm max-w-[120px]"
          >
            <option value="">Все</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Link
            href="/admin/products/new"
            onClick={() => haptic?.impactOccurred('light')}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-pink-500/30 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </Link>
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
