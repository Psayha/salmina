'use client';

import { Edit, Trash, Plus, Copy, Ticket, Percent, AlertCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { promocodesApi, Promocode, DiscountType } from '@/lib/api/endpoints/promocodes';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { AdminCardGrid, CardWrapper } from '@/components/admin/AdminCardGrid';

export default function PromocodesPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Promocode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; promocodeId: string; promocodeCode: string }>({
    isOpen: false,
    promocodeId: '',
    promocodeCode: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const promocodes = await promocodesApi.getPromocodes();
      setData(promocodes || []);
    } catch (error) {
      console.error('Failed to fetch promocodes:', error);
      setData([]);
      toast.error('Ошибка загрузки промокодов');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (e: React.MouseEvent, promocode: Promocode) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, promocodeId: promocode.id, promocodeCode: promocode.code });
    haptic?.impactOccurred('light');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    haptic?.impactOccurred('medium');

    try {
      await promocodesApi.deletePromocode(deleteModal.promocodeId);
      setData((prev) => prev.filter((p) => p.id !== deleteModal.promocodeId));
      toast.success('Промокод удален');
      haptic?.notificationOccurred('success');
      setDeleteModal({ isOpen: false, promocodeId: '', promocodeCode: '' });
    } catch (error) {
      console.error('Failed to delete promocode:', error);
      toast.error('Ошибка удаления');
      haptic?.notificationOccurred('error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    haptic?.notificationOccurred('success');
    toast.success('Код скопирован');
  };

  const handleCardClick = (promocodeId: string) => {
    haptic?.impactOccurred('light');
    router.push(`/admin/promocodes/${promocodeId}`);
  };

  const renderPromocodeCard = (promocode: Promocode) => {
    const now = new Date();
    const validFrom = new Date(promocode.validFrom);
    const validTo = new Date(promocode.validTo);
    const isExpired = now > validTo;
    const isNotStarted = now < validFrom;

    return (
      <CardWrapper key={promocode.id}>
        <div className="p-4 space-y-4">
          {/* Header with Code */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-lg">
                  {promocode.code}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {promocode.usageCount}
                  {promocode.usageLimit && ` / ${promocode.usageLimit}`} исп.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleCopyCode(e, promocode.code)}
              className="p-2 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-colors"
              title="Копировать код"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Discount & Status */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-lg font-semibold">
              {promocode.discountType === DiscountType.PERCENTAGE ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  {promocode.discountValue}%
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400">
                  {Number(promocode.discountValue).toLocaleString()} ₽
                </span>
              )}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                promocode.isActive
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {promocode.isActive ? 'Активен' : 'Неактивен'}
            </span>
          </div>

          {/* Validity Dates */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>с {validFrom.toLocaleDateString('ru-RU')} по {validTo.toLocaleDateString('ru-RU')}</div>
            {isExpired && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-3 h-3" />
                Истёк
              </div>
            )}
            {isNotStarted && (
              <div className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="w-3 h-3" />
                Ещё не начался
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => handleCardClick(promocode.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Редактировать
            </button>
            <button
              onClick={(e) => handleDeleteClick(e, promocode)}
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
            <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-52 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
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
        onClose={() => setDeleteModal({ isOpen: false, promocodeId: '', promocodeCode: '' })}
        onConfirm={handleDeleteConfirm}
        title="Удалить промокод?"
        description={`Вы уверены, что хотите удалить промокод "${deleteModal.promocodeCode}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        isLoading={isDeleting}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Промокоды</h1>
            <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
              Управление промокодами и скидками ({data.length} шт.)
            </p>
          </div>
          <button
            onClick={() => {
              haptic?.impactOccurred('light');
              router.push('/admin/promocodes/new');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 font-light"
          >
            <Plus className="w-5 h-5" />
            <span>Создать</span>
          </button>
        </div>

        <AdminCardGrid
          data={data}
          renderCard={renderPromocodeCard}
          emptyMessage="Промокодов пока нет"
          pageSize={9}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
