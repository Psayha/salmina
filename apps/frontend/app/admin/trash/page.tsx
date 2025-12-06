'use client';

import { Trash2, RotateCcw, Package, FolderTree, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getTrashItems,
  restoreProduct,
  restoreCategory,
  permanentDeleteProduct,
  permanentDeleteCategory,
  emptyTrash,
  TrashItem,
  TrashData,
} from '@/lib/api/endpoints/trash';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

export default function TrashPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<TrashData>({ products: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'restore' | 'delete' | 'empty';
    item?: TrashItem;
  }>({
    isOpen: false,
    type: 'restore',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  const fetchData = useCallback(async () => {
    try {
      const trashData = await getTrashItems();
      setData(trashData);
    } catch (error) {
      console.error('Failed to fetch trash:', error);
      toast.error('Ошибка загрузки корзины');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRestore = async () => {
    if (!actionModal.item) return;
    setIsProcessing(true);
    haptic?.impactOccurred('medium');

    try {
      if (actionModal.item.type === 'product') {
        await restoreProduct(actionModal.item.id);
      } else {
        await restoreCategory(actionModal.item.id);
      }
      toast.success('Элемент восстановлен');
      haptic?.notificationOccurred('success');
      await fetchData();
    } catch (error) {
      console.error('Failed to restore:', error);
      toast.error('Ошибка восстановления');
      haptic?.notificationOccurred('error');
    } finally {
      setIsProcessing(false);
      setActionModal({ isOpen: false, type: 'restore' });
    }
  };

  const handlePermanentDelete = async () => {
    if (!actionModal.item) return;
    setIsProcessing(true);
    haptic?.impactOccurred('heavy');

    try {
      if (actionModal.item.type === 'product') {
        await permanentDeleteProduct(actionModal.item.id);
      } else {
        await permanentDeleteCategory(actionModal.item.id);
      }
      toast.success('Элемент удалён навсегда');
      haptic?.notificationOccurred('success');
      await fetchData();
    } catch (error: any) {
      console.error('Failed to delete permanently:', error);
      const message = error?.response?.data?.message || 'Ошибка удаления';
      toast.error(message);
      haptic?.notificationOccurred('error');
    } finally {
      setIsProcessing(false);
      setActionModal({ isOpen: false, type: 'delete' });
    }
  };

  const handleEmptyTrash = async () => {
    setIsProcessing(true);
    haptic?.impactOccurred('heavy');

    try {
      const result = await emptyTrash();
      toast.success(`Удалено: ${result.deletedProducts} товаров, ${result.deletedCategories} категорий`);
      haptic?.notificationOccurred('success');
      await fetchData();
    } catch (error) {
      console.error('Failed to empty trash:', error);
      toast.error('Ошибка очистки корзины');
      haptic?.notificationOccurred('error');
    } finally {
      setIsProcessing(false);
      setActionModal({ isOpen: false, type: 'empty' });
    }
  };

  const totalItems = data.products.length + data.categories.length;
  const currentItems = activeTab === 'products' ? data.products : data.categories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Корзина</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalItems} {totalItems === 1 ? 'элемент' : totalItems < 5 ? 'элемента' : 'элементов'}
            </p>
          </div>
        </div>

        {totalItems > 0 && (
          <button
            onClick={() => {
              haptic?.impactOccurred('light');
              setActionModal({ isOpen: true, type: 'empty' });
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Очистить
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => {
            haptic?.impactOccurred('light');
            setActiveTab('products');
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'products'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Package className="w-4 h-4" />
          Товары ({data.products.length})
        </button>
        <button
          onClick={() => {
            haptic?.impactOccurred('light');
            setActiveTab('categories');
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Категории ({data.categories.length})
        </button>
      </div>

      {/* Items List */}
      {currentItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'products' ? 'Нет удалённых товаров' : 'Нет удалённых категорий'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'product' ? (
                        <Package className="w-6 h-6 text-gray-400" />
                      ) : (
                        <FolderTree className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.type === 'product' && item.categoryName
                      ? item.categoryName
                      : new Date(item.deletedAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      haptic?.impactOccurred('light');
                      setActionModal({ isOpen: true, type: 'restore', item });
                    }}
                    className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    title="Восстановить"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      haptic?.impactOccurred('light');
                      setActionModal({ isOpen: true, type: 'delete', item });
                    }}
                    className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="Удалить навсегда"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Modal */}
      <Modal
        isOpen={actionModal.isOpen && actionModal.type === 'restore'}
        onClose={() => setActionModal({ isOpen: false, type: 'restore' })}
        onConfirm={handleRestore}
        title="Восстановить элемент?"
        description={`Элемент "${actionModal.item?.name}" будет восстановлен и снова станет активным.`}
        confirmText="Восстановить"
        cancelText="Отмена"
        type="info"
        isLoading={isProcessing}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={actionModal.isOpen && actionModal.type === 'delete'}
        onClose={() => setActionModal({ isOpen: false, type: 'delete' })}
        onConfirm={handlePermanentDelete}
        title="Удалить навсегда?"
        description={`Элемент "${actionModal.item?.name}" будет удалён безвозвратно. Это действие нельзя отменить.`}
        confirmText="Удалить навсегда"
        cancelText="Отмена"
        type="danger"
        isLoading={isProcessing}
      />

      {/* Empty Trash Modal */}
      <Modal
        isOpen={actionModal.isOpen && actionModal.type === 'empty'}
        onClose={() => setActionModal({ isOpen: false, type: 'empty' })}
        onConfirm={handleEmptyTrash}
        title="Очистить корзину?"
        description={`Все элементы (${data.products.length} товаров, ${data.categories.length} категорий) будут удалены безвозвратно. Это действие нельзя отменить.`}
        confirmText="Очистить всё"
        cancelText="Отмена"
        type="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
