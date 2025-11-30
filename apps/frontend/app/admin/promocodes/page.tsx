'use client';

import { Trash, Plus, Copy, Ticket, Percent, Search, X, Save, DollarSign } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { promocodesApi, Promocode, DiscountType } from '@/lib/api/endpoints/promocodes';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { AdminCardGrid, CardWrapper } from '@/components/admin/AdminCardGrid';
import { motion, AnimatePresence } from 'framer-motion';

interface EditModalState {
  isOpen: boolean;
  promocode: Promocode | null;
  isNew: boolean;
}

const defaultFormData = {
  code: '',
  discountType: DiscountType.PERCENT,
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  validFrom: new Date().toISOString().split('T')[0],
  validTo: '',
  isActive: true,
};

export default function PromocodesPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<Promocode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; promocodeId: string; promocodeCode: string }>({
    isOpen: false,
    promocodeId: '',
    promocodeCode: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    promocode: null,
    isNew: false,
  });
  const [formData, setFormData] = useState(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  useTelegramBackButton(() => {
    if (editModal.isOpen) {
      setEditModal({ isOpen: false, promocode: null, isNew: false });
    } else {
      router.push('/admin');
    }
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

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((promocode) => promocode.code?.toLowerCase().includes(query));
  }, [data, searchQuery]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

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

  const handleEditClick = (promocode: Promocode) => {
    haptic?.impactOccurred('light');
    setFormData({
      code: promocode.code,
      discountType: promocode.discountType,
      discountValue: String(promocode.discountValue),
      minOrderAmount: promocode.minOrderAmount ? String(promocode.minOrderAmount) : '',
      maxDiscountAmount: promocode.maxDiscountAmount ? String(promocode.maxDiscountAmount) : '',
      usageLimit: promocode.usageLimit ? String(promocode.usageLimit) : '',
      validFrom: new Date(promocode.validFrom).toISOString().split('T')[0],
      validTo: new Date(promocode.validTo).toISOString().split('T')[0],
      isActive: promocode.isActive,
    });
    setEditModal({ isOpen: true, promocode, isNew: false });
  };

  const handleNewClick = () => {
    haptic?.impactOccurred('light');
    setFormData(defaultFormData);
    setEditModal({ isOpen: true, promocode: null, isNew: true });
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: result }));
    haptic?.impactOccurred('light');
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discountValue || !formData.validTo) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSaving(true);
    haptic?.impactOccurred('medium');

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo + 'T23:59:59').toISOString(),
        isActive: formData.isActive,
      };

      if (editModal.isNew) {
        await promocodesApi.createPromocode(payload);
        toast.success('Промокод создан');
      } else if (editModal.promocode) {
        await promocodesApi.updatePromocode(editModal.promocode.id, payload);
        toast.success('Промокод обновлен');
      }

      haptic?.notificationOccurred('success');
      setEditModal({ isOpen: false, promocode: null, isNew: false });
      fetchData();
    } catch (error) {
      console.error('Failed to save promocode:', error);
      haptic?.notificationOccurred('error');
      toast.error('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPromocodeCard = (promocode: Promocode) => {
    const now = new Date();
    const validFrom = new Date(promocode.validFrom);
    const validTo = new Date(promocode.validTo);
    const isExpired = now > validTo;
    const isNotStarted = now < validFrom;

    return (
      <CardWrapper key={promocode.id} onClick={() => handleEditClick(promocode)}>
        <div className="p-3 space-y-3">
          {/* Header with Code */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-base">
                  {promocode.code}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {promocode.usageCount}{promocode.usageLimit && ` / ${promocode.usageLimit}`} исп.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleCopyCode(e, promocode.code)}
              className="p-1.5 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Discount & Status */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-base font-semibold">
              {promocode.discountType === DiscountType.PERCENT ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
                  <Percent className="w-3.5 h-3.5" />
                  {promocode.discountValue}%
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400">
                  {Number(promocode.discountValue).toLocaleString()} ₽
                </span>
              )}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                promocode.isActive
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {promocode.isActive ? 'Актив' : 'Выкл'}
            </span>
          </div>

          {/* Validity & Delete */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              {validFrom.toLocaleDateString('ru-RU')} — {validTo.toLocaleDateString('ru-RU')}
              {isExpired && <span className="text-red-500 ml-1">Истёк</span>}
              {isNotStarted && <span className="text-orange-500 ml-1">Не начался</span>}
            </div>
            <button
              onClick={(e) => handleDeleteClick(e, promocode)}
              className="p-1.5 bg-red-50 dark:bg-red-500/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors"
            >
              <Trash className="w-3.5 h-3.5" />
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
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
        onClose={() => setDeleteModal({ isOpen: false, promocodeId: '', promocodeCode: '' })}
        onConfirm={handleDeleteConfirm}
        title="Удалить промокод?"
        description={`Вы уверены, что хотите удалить промокод "${deleteModal.promocodeCode}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditModal({ isOpen: false, promocode: null, isNew: false })}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editModal.isNew ? 'Новый промокод' : 'Редактирование'}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? '...' : 'Сохранить'}
                  </button>
                  <button
                    onClick={() => setEditModal({ isOpen: false, promocode: null, isNew: false })}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-4 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Код <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="SUMMER2024"
                    />
                    <button
                      onClick={generateCode}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
                    >
                      Генерировать
                    </button>
                  </div>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Тип скидки
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, discountType: DiscountType.PERCENT }))}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                        formData.discountType === DiscountType.PERCENT
                          ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 ring-2 ring-cyan-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Percent className="w-4 h-4" /> Процент
                    </button>
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, discountType: DiscountType.FIXED }))}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                        formData.discountType === DiscountType.FIXED
                          ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 ring-2 ring-cyan-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" /> Фикс.
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Размер скидки <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder={formData.discountType === DiscountType.PERCENT ? '10' : '500'}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {formData.discountType === DiscountType.PERCENT ? '%' : '₽'}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      С даты <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData((prev) => ({ ...prev, validFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      До даты <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData((prev) => ({ ...prev, validTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Мин. сумма
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Лимит исп.
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="∞"
                    />
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Активен</span>
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Промокоды</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            Управление промокодами ({filteredData.length} шт.)
          </p>
        </div>

        {/* Search & Add */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-light shadow-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
            />
          </div>
          <button
            onClick={handleNewClick}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <AdminCardGrid
          data={filteredData}
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
