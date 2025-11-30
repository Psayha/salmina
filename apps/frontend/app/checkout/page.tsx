'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Check, X, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Button } from '@/components/ui';
import { ordersApi } from '@/lib/api/endpoints/orders';
import { promocodesApi } from '@/lib/api/endpoints/promocodes';

interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  comment: string;
  deliveryMethod: 'pickup' | 'courier' | 'post';
  paymentMethod: 'card' | 'cash' | 'online';
  promocode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const haptic = useTelegramHaptic();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.firstName || '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    comment: '',
    deliveryMethod: 'courier',
    paymentMethod: 'card',
    promocode: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promocodeStatus, setPromocodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [promocodeDiscount, setPromocodeDiscount] = useState<number>(0);
  const [promocodeError, setPromocodeError] = useState<string>('');

  useTelegramBackButton(() => {
    router.back();
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Reset promocode validation when code changes
    if (field === 'promocode') {
      setPromocodeStatus('idle');
      setPromocodeDiscount(0);
      setPromocodeError('');
    }
    haptic?.selectionChanged();
  };

  const validatePromocode = async () => {
    if (!formData.promocode.trim()) return;

    setPromocodeStatus('checking');
    setPromocodeError('');

    try {
      const result = await promocodesApi.validatePromocode(formData.promocode.toUpperCase());
      if (result.valid && result.promocode) {
        setPromocodeStatus('valid');
        // Calculate discount
        const subtotal = cart?.totals.subtotal || 0;
        if (result.promocode.discountType === 'PERCENT') {
          const discount = (subtotal * result.promocode.discountValue) / 100;
          setPromocodeDiscount(result.promocode.maxDiscountAmount
            ? Math.min(discount, result.promocode.maxDiscountAmount)
            : discount);
        } else {
          setPromocodeDiscount(result.promocode.discountValue);
        }
        haptic?.notificationOccurred('success');
      } else {
        setPromocodeStatus('invalid');
        setPromocodeError(result.message || 'Недействительный промокод');
        haptic?.notificationOccurred('error');
      }
    } catch {
      setPromocodeStatus('invalid');
      setPromocodeError('Ошибка проверки промокода');
      haptic?.notificationOccurred('error');
    }
  };

  const clearPromocode = () => {
    setFormData((prev) => ({ ...prev, promocode: '' }));
    setPromocodeStatus('idle');
    setPromocodeDiscount(0);
    setPromocodeError('');
    haptic?.impactOccurred('light');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Укажите ваше имя';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Укажите номер телефона';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = 'Некорректный номер телефона';
    }

    if (formData.deliveryMethod === 'courier') {
      if (!formData.address.trim()) {
        newErrors.address = 'Укажите адрес доставки';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'Укажите город';
      }
    }

    if (formData.deliveryMethod === 'post' && !formData.postalCode.trim()) {
      newErrors.postalCode = 'Укажите почтовый индекс';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      haptic?.notificationOccurred('error');
      return;
    }

    if (!cart) {
      haptic?.notificationOccurred('error');
      return;
    }

    setIsSubmitting(true);

    try {
      await ordersApi.createOrder({
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email || undefined,
        deliveryAddress:
          formData.deliveryMethod === 'pickup'
            ? 'Самовывоз'
            : `${formData.city}, ${formData.address}${formData.postalCode ? ', ' + formData.postalCode : ''}`,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        comment: formData.comment || undefined,
        promocodeCode: promocodeStatus === 'valid' ? formData.promocode.toUpperCase() : undefined,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      haptic?.notificationOccurred('success');
      await clearCart();
      router.push('/checkout/success');
    } catch (error) {
      haptic?.notificationOccurred('error');
      console.error('Error creating order:', error);
      alert('Ошибка при создании заказа. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.totals.subtotal || cart.totals.total;
  const finalTotal = subtotal - promocodeDiscount;

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-gray-900 dark:text-white">Оформление</h1>
        <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
          {cart.items.length} товаров на сумму {subtotal.toLocaleString('ru-RU')} ₽
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Information */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400">Контакты</h2>

          <div>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              placeholder="Имя и фамилия *"
            />
            {errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              placeholder="Телефон *"
            />
            {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            placeholder="Email (необязательно)"
          />
        </div>

        {/* Delivery Method */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400">Доставка</h2>

          <div className="space-y-2">
            {[
              { value: 'courier' as const, label: 'Курьером' },
              { value: 'pickup' as const, label: 'Самовывоз' },
              { value: 'post' as const, label: 'Почта России' },
            ].map((method) => (
              <label
                key={method.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.deliveryMethod === method.value
                    ? 'bg-white/60 dark:bg-white/20 border-pink-300 dark:border-pink-500/50'
                    : 'bg-white/30 dark:bg-white/5 border-white/30 dark:border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method.value}
                  checked={formData.deliveryMethod === method.value}
                  onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                  className="accent-pink-500"
                />
                <span className="text-sm text-gray-900 dark:text-white">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        {formData.deliveryMethod !== 'pickup' && (
          <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400">Адрес</h2>

            <div>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                placeholder="Город *"
              />
              {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city}</p>}
            </div>

            {formData.deliveryMethod === 'courier' && (
              <div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  placeholder="Адрес *"
                />
                {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
              </div>
            )}

            {formData.deliveryMethod === 'post' && (
              <div>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  placeholder="Почтовый индекс *"
                />
                {errors.postalCode && <p className="text-[10px] text-red-500 mt-1">{errors.postalCode}</p>}
              </div>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400">Оплата</h2>

          <div className="space-y-2">
            {[
              { value: 'card' as const, label: 'Картой онлайн' },
              { value: 'online' as const, label: 'СБП / ЮMoney' },
              { value: 'cash' as const, label: 'При получении' },
            ].map((method) => (
              <label
                key={method.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === method.value
                    ? 'bg-white/60 dark:bg-white/20 border-pink-300 dark:border-pink-500/50'
                    : 'bg-white/30 dark:bg-white/5 border-white/30 dark:border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.paymentMethod === method.value}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="accent-pink-500"
                />
                <span className="text-sm text-gray-900 dark:text-white">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Promocode */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5" />
            Промокод
          </h2>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={formData.promocode}
                onChange={(e) => handleInputChange('promocode', e.target.value.toUpperCase())}
                disabled={promocodeStatus === 'valid'}
                className={`w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 ${
                  promocodeStatus === 'valid'
                    ? 'border-green-300 dark:border-green-500/50'
                    : promocodeStatus === 'invalid'
                    ? 'border-red-300 dark:border-red-500/50'
                    : 'border-white/30 dark:border-white/10'
                }`}
                placeholder="SUMMER2024"
              />
              {promocodeStatus === 'valid' && (
                <button
                  type="button"
                  onClick={clearPromocode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={validatePromocode}
              disabled={!formData.promocode.trim() || promocodeStatus === 'checking' || promocodeStatus === 'valid'}
              className="px-4 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
            >
              {promocodeStatus === 'checking' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : promocodeStatus === 'valid' ? (
                <Check className="w-4 h-4" />
              ) : (
                'Применить'
              )}
            </button>
          </div>

          {promocodeStatus === 'valid' && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Скидка {promocodeDiscount.toLocaleString('ru-RU')} ₽ применена
            </p>
          )}
          {promocodeStatus === 'invalid' && (
            <p className="text-xs text-red-500">{promocodeError}</p>
          )}
        </div>

        {/* Comment */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg">
          <textarea
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 resize-none"
            placeholder="Комментарий к заказу (необязательно)"
          />
        </div>
      </form>

      {/* Fixed Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-t border-white/30 dark:border-white/10 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="px-4 py-3 space-y-2">
          {/* Price breakdown */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Товары</span>
            <span className="text-gray-900 dark:text-white">{subtotal.toLocaleString('ru-RU')} ₽</span>
          </div>
          {promocodeDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-600 dark:text-green-400">Скидка</span>
              <span className="text-green-600 dark:text-green-400">-{promocodeDiscount.toLocaleString('ru-RU')} ₽</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-white/30 dark:border-white/10">
            <span className="text-base font-medium text-gray-900 dark:text-white">Итого</span>
            <span className="text-xl font-medium text-gray-900 dark:text-white">{finalTotal.toLocaleString('ru-RU')} ₽</span>
          </div>

          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3">
            {isSubmitting ? 'Оформление...' : 'Подтвердить заказ'}
          </Button>
        </div>
      </div>
    </div>
  );
}
