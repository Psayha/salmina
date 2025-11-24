'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Button } from '@/components/ui';
import { ordersApi } from '@/lib/api/endpoints/orders';

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
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useTelegramBackButton(() => {
    router.back();
  });

  useEffect(() => {
    // Redirect if cart is empty
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    haptic.selectionChanged();
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
      haptic.notificationOccurred('error');
      return;
    }

    if (!cart) {
      haptic.notificationOccurred('error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order with API
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
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      haptic.notificationOccurred('success');
      await clearCart();

      // Redirect to success page
      router.push('/checkout/success');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Error creating order:', error);
      // Show error message to user
      alert('Ошибка при создании заказа. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen relative z-10 pb-32">
      {/* Header */}
      <div className="sticky top-24 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-light text-gray-900">Оформление заказа</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Contact Information */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg space-y-4">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-4">Контактные данные</h2>

          <div>
            <label className="block text-sm font-light text-gray-600 mb-2">Имя и фамилия *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Иван Иванов"
            />
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-light text-gray-600 mb-2">Телефон *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="+7 (999) 123-45-67"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-light text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="example@mail.com"
            />
          </div>
        </div>

        {/* Delivery Method */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg space-y-4">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-4">Способ доставки</h2>

          <div className="space-y-3">
            {[
              { value: 'courier' as const, label: 'Курьером', desc: 'Доставка по адресу' },
              { value: 'pickup' as const, label: 'Самовывоз', desc: 'Забрать в магазине' },
              { value: 'post' as const, label: 'Почта России', desc: 'Отправка почтой' },
            ].map((method) => (
              <label
                key={method.value}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  formData.deliveryMethod === method.value
                    ? 'bg-white/60 border-white/50'
                    : 'bg-white/30 border-white/30 hover:bg-white/40'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method.value}
                  checked={formData.deliveryMethod === method.value}
                  onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-light text-gray-900">{method.label}</p>
                  <p className="text-xs font-light text-gray-600">{method.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        {formData.deliveryMethod !== 'pickup' && (
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg space-y-4">
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-4">Адрес доставки</h2>

            <div>
              <label className="block text-sm font-light text-gray-600 mb-2">Город *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Москва"
              />
              {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
            </div>

            {formData.deliveryMethod === 'courier' && (
              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">Адрес *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="ул. Примерная, д. 1, кв. 1"
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>
            )}

            {formData.deliveryMethod === 'post' && (
              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">Почтовый индекс *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="123456"
                />
                {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
              </div>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg space-y-4">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-4">Способ оплаты</h2>

          <div className="space-y-3">
            {[
              { value: 'card' as const, label: 'Картой онлайн', desc: 'Visa, Mastercard, Мир' },
              { value: 'online' as const, label: 'Другие методы', desc: 'СБП, ЮMoney и др.' },
              { value: 'cash' as const, label: 'При получении', desc: 'Наличными или картой' },
            ].map((method) => (
              <label
                key={method.value}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  formData.paymentMethod === method.value
                    ? 'bg-white/60 border-white/50'
                    : 'bg-white/30 border-white/30 hover:bg-white/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.paymentMethod === method.value}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-light text-gray-900">{method.label}</p>
                  <p className="text-xs font-light text-gray-600">{method.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
          <label className="block text-sm font-light text-gray-600 mb-2">Комментарий к заказу</label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
            placeholder="Дополнительная информация для курьера или пожелания"
          />
        </div>
      </form>

      {/* Fixed Bottom Bar with Total and Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-white/30 shadow-lg z-50">
        <div className="px-6 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-light text-gray-900">Итого к оплате:</span>
            <span className="text-2xl font-light text-gray-900">{cart.totals.total.toLocaleString('ru-RU')} ₽</span>
          </div>

          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 text-base">
            {isSubmitting ? 'Оформление...' : 'Подтвердить заказ'}
          </Button>
        </div>
      </div>
    </div>
  );
}
