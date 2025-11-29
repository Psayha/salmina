'use client';

import { Edit, Trash, Plus, Tag, Percent, Megaphone } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { promotionsApi } from '@/lib/api/endpoints/promotions';
import { Promotion } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { AdminCardGrid, CardWrapper } from '@/components/admin/AdminCardGrid';

export default function PromotionsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; promotionId: string; promotionTitle: string }>({
    isOpen: false,
    promotionId: '',
    promotionTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const promotions = await promotionsApi.getAdminPromotions();
      setData(promotions);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      toast.error('Ошибка загрузки акций');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (e: React.MouseEvent, promotion: Promotion) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, promotionId: promotion.id, promotionTitle: promotion.title });
    haptic?.impactOccurred('light');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    haptic?.impactOccurred('medium');

    try {
      await promotionsApi.deletePromotion(deleteModal.promotionId);
      setData((prev) => prev.filter((p) => p.id !== deleteModal.promotionId));
      toast.success('Акция удалена');
      haptic?.notificationOccurred('success');
      setDeleteModal({ isOpen: false, promotionId: '', promotionTitle: '' });
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      toast.error('Ошибка удаления');
      haptic?.notificationOccurred('error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (promotionId: string) => {
    haptic?.impactOccurred('light');
    router.push(`/admin/promotions/${promotionId}`);
  };

  const renderPromotionCard = (promotion: Promotion) => {
    const imageUrl = promotion.image
      ? promotion.image.startsWith('http')
        ? promotion.image
        : `https://app.salminashop.ru${promotion.image}`
      : null;

    const from = promotion.validFrom ? new Date(promotion.validFrom).toLocaleDateString('ru-RU') : null;
    const to = promotion.validTo ? new Date(promotion.validTo).toLocaleDateString('ru-RU') : null;

    return (
      <CardWrapper key={promotion.id} onClick={() => handleCardClick(promotion.id)}>
        {/* Image */}
        <div className="relative h-32 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={promotion.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Megaphone className="w-12 h-12 text-red-300 dark:text-red-600" />
            </div>
          )}
          {/* Status & Discount Badge */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                promotion.isActive
                  ? 'bg-green-500/90 text-white'
                  : 'bg-gray-500/90 text-white'
              }`}
            >
              {promotion.isActive ? 'Активна' : 'Скрыта'}
            </span>
            {(promotion.discountPercent || promotion.discountAmount) && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-500/90 text-white backdrop-blur-sm flex items-center gap-1">
                {promotion.discountPercent ? (
                  <>
                    <Percent className="w-3 h-3" />
                    {promotion.discountPercent}%
                  </>
                ) : (
                  <>{Number(promotion.discountAmount).toLocaleString()} ₽</>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title & Description */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
              {promotion.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
              {promotion.description}
            </p>
          </div>

          {/* Dates */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {!from && !to ? (
              'Бессрочно'
            ) : (
              <span>
                {from && `с ${from} `}
                {to && `по ${to}`}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(promotion.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Редактировать
            </button>
            <button
              onClick={(e) => handleDeleteClick(e, promotion)}
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
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl overflow-hidden">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse" />
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
        onClose={() => setDeleteModal({ isOpen: false, promotionId: '', promotionTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Удалить акцию?"
        description={`Вы уверены, что хотите удалить акцию "${deleteModal.promotionTitle}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        isLoading={isDeleting}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Акции</h1>
            <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
              Управление акциями и скидками ({data.length} шт.)
            </p>
          </div>
          <Link
            href="/admin/promotions/new"
            onClick={() => haptic?.impactOccurred('light')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-red-500/30 font-light"
          >
            <Plus className="w-5 h-5" />
            <span>Создать</span>
          </Link>
        </div>

        <AdminCardGrid
          data={data}
          renderCard={renderPromotionCard}
          emptyMessage="Акций пока нет"
          pageSize={9}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
