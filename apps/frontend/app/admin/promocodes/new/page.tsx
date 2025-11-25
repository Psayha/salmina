'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Percent, DollarSign } from 'lucide-react';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { promocodesApi, DiscountType } from '@/lib/api/endpoints/promocodes';

export default function NewPromocodePage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState('');
  const [isActive, setIsActive] = useState(true);

  useTelegramBackButton(() => {
    router.push('/admin/promocodes');
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
    haptic?.impactOccurred('light');
  };

  const handleSave = async () => {
    if (!code || !discountValue || !validTo) {
      alert('Заполните обязательные поля');
      return;
    }

    setIsSaving(true);
    haptic?.impactOccurred('medium');

    try {
      const data = {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo + 'T23:59:59').toISOString(),
        isActive,
      };

      await promocodesApi.createPromocode(data);
      haptic?.notificationOccurred('success');
      router.push('/admin/promocodes');
    } catch (error) {
      console.error('Failed to save promocode:', error);
      haptic?.notificationOccurred('error');
      alert('Ошибка при создании промокода');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Новый промокод</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">Создание промокода на скидку</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Code */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Код промокода <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="SUMMER2024"
            />
            <button
              onClick={generateCode}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Генерировать
            </button>
          </div>
        </div>

        {/* Discount Type */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Тип скидки <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setDiscountType(DiscountType.PERCENTAGE);
                haptic?.impactOccurred('light');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                discountType === DiscountType.PERCENTAGE
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-2 border-cyan-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Процент</span>
            </button>
            <button
              onClick={() => {
                setDiscountType(DiscountType.FIXED);
                haptic?.impactOccurred('light');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                discountType === DiscountType.FIXED
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-2 border-cyan-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Фиксированная</span>
            </button>
          </div>
        </div>

        {/* Discount Value */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Размер скидки <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder={discountType === DiscountType.PERCENTAGE ? '10' : '500'}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {discountType === DiscountType.PERCENTAGE ? '%' : '₽'}
            </span>
          </div>
        </div>

        {/* Optional fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Минимальная сумма заказа
            </label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="1000"
            />
          </div>

          {discountType === DiscountType.PERCENTAGE && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Макс. размер скидки (₽)
              </label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="5000"
              />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Лимит использований
            </label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Оставьте пустым для неограниченного</p>
          </div>
        </div>

        {/* Validity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Действителен с <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Действителен до <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => {
                setIsActive(e.target.checked);
                haptic?.impactOccurred('light');
              }}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Активировать промокод сразу</span>
          </label>
        </div>
      </div>
    </div>
  );
}
