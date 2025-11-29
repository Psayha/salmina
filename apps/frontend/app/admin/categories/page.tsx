'use client';

import { Plus, Pencil, Trash2, Search, FolderTree } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, deleteCategory } from '@/lib/api/endpoints/categories';
import { Category } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { AdminCardGrid, CardWrapper } from '@/components/admin/AdminCardGrid';

export default function CategoriesPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, category: Category) => {
      e.stopPropagation();
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

  const handleCardClick = (categoryId: string) => {
    haptic?.impactOccurred('light');
    router.push(`/admin/categories/${categoryId}`);
  };

  const renderCategoryCard = (category: Category) => {
    const imageUrl = category.image
      ? category.image.startsWith('http')
        ? category.image
        : `https://app.salminashop.ru${category.image}`
      : null;

    return (
      <CardWrapper key={category.id} onClick={() => handleCardClick(category.id)}>
        <div className="flex gap-3 p-3">
          {/* Image - small square */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={category.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-orange-300 dark:text-orange-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 text-sm">
                {category.name}
              </h3>
              <span
                className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  category.isActive
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {category.isActive ? 'Актив' : 'Скрыта'}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {category._count?.products || 0} товаров
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(category.id);
              }}
              className="p-2 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/30 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDeleteClick(e, category)}
              className="p-2 bg-red-50 dark:bg-red-500/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
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
            <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-3 flex gap-3">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Категории</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            Управление категориями товаров ({filteredData.length} шт.)
          </p>
        </div>

        {/* Search & Add */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-light shadow-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
          <Link
            href="/admin/categories/new"
            onClick={() => haptic?.impactOccurred('light')}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-orange-500/30 flex-shrink-0"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>

        <AdminCardGrid
          data={filteredData}
          renderCard={renderCategoryCard}
          emptyMessage="Категории не найдены"
          pageSize={9}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
