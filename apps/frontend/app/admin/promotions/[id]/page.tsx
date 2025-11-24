'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { promotionsApi } from '@/lib/api/endpoints/promotions';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { ProductSelector } from '@/components/admin/ProductSelector';

export default function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercent: '',
    discountAmount: '',
    image: '',
    link: '',
    order: '0',
    isActive: true,
    validFrom: '',
    validTo: '',
    productIds: [] as string[],
  });

  useTelegramBackButton(() => {
    router.push('/admin/promotions');
  });

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const promotions = await promotionsApi.getAdminPromotions();
        const promotion = promotions.find((p) => p.id === id);

        if (promotion) {
          setFormData({
            title: promotion.title,
            description: promotion.description || '',
            discountPercent: promotion.discountPercent?.toString() || '',
            discountAmount: promotion.discountAmount?.toString() || '',
            image: promotion.image || '',
            link: promotion.link || '',
            order: promotion.order.toString(),
            isActive: promotion.isActive,
            validFrom: promotion.validFrom ? new Date(promotion.validFrom).toISOString().slice(0, 16) : '',
            validTo: promotion.validTo ? new Date(promotion.validTo).toISOString().slice(0, 16) : '',
            productIds: promotion.products?.map((p) => p.id) || [],
          });
        } else {
          alert('Акция не найдена');
          router.push('/admin/promotions');
        }
      } catch (error) {
        console.error('Failed to fetch promotion:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromotion();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image) {
      alert('Заполните обязательные поля (Название, Изображение)');
      haptic?.notificationOccurred('error');
      return;
    }

    setIsSubmitting(true);
    haptic?.impactOccurred('medium');

    try {
      await promotionsApi.updatePromotion(id, {
        title: formData.title,
        description: formData.description,
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : undefined,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        image: formData.image,
        link: formData.link,
        order: parseInt(formData.order),
        isActive: formData.isActive,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
        validTo: formData.validTo ? new Date(formData.validTo).toISOString() : undefined,
        productIds: formData.productIds,
      });

      haptic?.notificationOccurred('success');
      router.push('/admin/promotions');
    } catch (error) {
      console.error('Failed to update promotion:', error);
      alert('Ошибка при обновлении акции');
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту акцию?')) return;

    try {
      haptic?.impactOccurred('medium');
      await promotionsApi.deletePromotion(id);
      haptic?.notificationOccurred('success');
      router.push('/admin/promotions');
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      haptic?.notificationOccurred('error');
      alert('Ошибка при удалении');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/promotions')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-gray-900">Редактирование акции</h1>
            <p className="text-sm font-light text-gray-600 mt-1">Изменение параметров акции</p>
          </div>
        </div>
        <button onClick={handleDelete} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
          <Trash className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 space-y-4">
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              placeholder="Например: Летняя распродажа"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              placeholder="Подробности акции..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Скидка (%)</label>
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Скидка (сумма)</label>
              <input
                type="number"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Начало</label>
              <input
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Окончание</label>
              <input
                type="datetime-local"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">
              Изображение <span className="text-red-500">*</span>
            </label>
            <ImageUpload
              value={formData.image ? [formData.image] : []}
              onChange={(urls) => setFormData({ ...formData, image: urls[0] || '' })}
              maxFiles={1}
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Товары в акции</label>
            <ProductSelector
              selectedIds={formData.productIds}
              onChange={(ids) => setFormData({ ...formData, productIds: ids })}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-light text-gray-700">Активна</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/promotions')}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-light"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-linear-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all font-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
