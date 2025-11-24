'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Tag, Percent, Calendar } from 'lucide-react';
import { promotionsApi } from '@/lib/api/endpoints/promotions';
import { Promotion } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';

export default function PromotionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const haptic = useTelegramHaptic();
  const { addToCart } = useCartStore();

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const promotionId = params.id as string;

  useTelegramBackButton(() => {
    router.push('/');
  });

  useEffect(() => {
    async function fetchPromotion() {
      try {
        setIsLoading(true);
        const data = await promotionsApi.getPromotion(promotionId);
        setPromotion(data);
      } catch (err) {
        console.error('Failed to fetch promotion:', err);
        setError('Не удалось загрузить акцию');
      } finally {
        setIsLoading(false);
      }
    }

    if (promotionId) {
      fetchPromotion();
    }
  }, [promotionId]);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      haptic?.notificationOccurred('success');
    } catch (error) {
      console.error('Add to cart error:', error);
      haptic?.notificationOccurred('error');
    }
  };

  const handleProductClick = (productId: string) => {
    haptic?.selectionChanged();
    router.push(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-4">
          <Tag className="w-16 h-16 text-gray-400 mx-auto" />
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            {error || 'Акция не найдена'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header Image */}
      <div className="relative w-full h-64 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-900">
        {promotion.image && (
          <Image
            src={promotion.image}
            alt={promotion.title}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10">
        {/* Title Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-white/10 p-6 space-y-4">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
            {promotion.title}
          </h1>

          {promotion.description && (
            <p className="text-gray-600 dark:text-gray-300 font-light">
              {promotion.description}
            </p>
          )}

          {/* Discount Badge */}
          {(promotion.discountPercent || promotion.discountAmount) && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg">
                {promotion.discountPercent ? (
                  <>
                    <Percent className="w-4 h-4" />
                    <span className="font-semibold">{promotion.discountPercent}%</span>
                  </>
                ) : (
                  <span className="font-semibold">
                    -{Number(promotion.discountAmount).toLocaleString()} ₽
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          {(promotion.validFrom || promotion.validTo) && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <div className="flex flex-col">
                {promotion.validFrom && (
                  <span>с {new Date(promotion.validFrom).toLocaleDateString('ru-RU')}</span>
                )}
                {promotion.validTo && (
                  <span>по {new Date(promotion.validTo).toLocaleDateString('ru-RU')}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        {promotion.products && promotion.products.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Товары по акции
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {promotion.products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={handleAddToCart}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
