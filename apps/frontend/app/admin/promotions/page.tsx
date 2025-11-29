'use client';

import { Edit, Trash, Plus, Megaphone, Search } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (promotion) =>
        promotion.title?.toLowerCase().includes(query) ||
        promotion.description?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

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
        <div className="flex gap-3 p-3">
          {/* Image - small square */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={promotion.title}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Megaphone className="w-8 h-8 text-red-300 dark:text-red-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* Top: Title, Status, Discount */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 text-sm">
                  {promotion.title}
                </h3>
                <span
                  className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    promotion.isActive
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {promotion.isActive ? 'Актив' : 'Скрыта'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                {promotion.description}
              </p>
            </div>

            {/* Bottom: Discount & Dates */}
            <div className="flex items-center justify-between mt-1">
              {(promotion.discountPercent || promotion.discountAmount) && (
                <span className="text-sm font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-0.5">
                  {promotion.discountPercent ? (
                    <>-{promotion.discountPercent}%</>
                  ) : (
                    <>-{Number(promotion.discountAmount).toLocaleString()} ₽</>
                  )}
                </span>
              )}
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {!from && !to ? 'Бессрочно' : `${from || ''} — ${to || ''}`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(promotion.id);
              }}
              className="p-2 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDeleteClick(e, promotion)}
              className="p-2 bg-red-50 dark:bg-red-500/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors"
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Акции</h1>
            <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
              Управление акциями и скидками ({filteredData.length} шт.)
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-light shadow-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <AdminCardGrid
          data={filteredData}
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
