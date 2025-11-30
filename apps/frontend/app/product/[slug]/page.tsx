'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/api/types';
import { Button } from '@/components/ui';
import { CartIcon, HeartIcon } from '@/components/ui/icons';
import Image from 'next/image';

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const haptic = useTelegramHaptic();

  useTelegramBackButton(() => {
    router.back();
  });

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productsApi.getProductBySlug(slug);
      setProduct(data);

      if (data.id) {
        const related = await productsApi.getRelatedProducts(data.id);
        setRelatedProducts(related.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      haptic.notificationOccurred('error');
    } finally {
      setIsLoading(false);
    }
  }, [slug, haptic]);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug, fetchProduct]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
      haptic.notificationOccurred('success');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
      haptic.selectionChanged();
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite(product.id);
    haptic.impactOccurred('light');
  };

  const handleRelatedProductClick = (productSlug: string) => {
    haptic.impactOccurred('light');
    router.push(`/product/${productSlug}`);
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
    setImageError(false);
    haptic.selectionChanged();
  };

  // Get full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    // If it's already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a relative path starting with /
    if (imagePath.startsWith('/')) {
      return `https://app.salminashop.ru${imagePath}`;
    }
    return `https://app.salminashop.ru/uploads/${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center">
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-80 bg-white/30 dark:bg-white/10 rounded-xl w-72"></div>
            <div className="h-6 bg-white/30 dark:bg-white/10 rounded w-48"></div>
            <div className="h-8 bg-white/30 dark:bg-white/10 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-lg text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">Товар не найден</p>
          <Button onClick={() => router.push('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  const finalPrice = product.promotionPrice || product.discountPrice || product.price;
  const hasDiscount = finalPrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - finalPrice / product.price) * 100) : 0;
  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen relative z-10 pb-36">
      {/* Image Gallery - Full bleed from top */}
      <div className="relative -mt-28">
        {/* Main Image */}
        <div className="relative aspect-[4/5] w-full bg-gray-100 dark:bg-gray-800 rounded-b-3xl overflow-hidden">
          {currentImage && !imageError ? (
            <Image
              src={getImageUrl(currentImage) || ''}
              alt={product.name}
              fill
              className="object-cover"
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <span className="text-8xl opacity-50">📦</span>
            </div>
          )}

          {/* Discount Badge - positioned lower to account for header */}
          {hasDiscount && (
            <div className="absolute top-32 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
              -{discountPercent}%
            </div>
          )}

          {/* Favorite Button - positioned lower to account for header */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-32 right-4 w-11 h-11 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all ${
              isFavorite(product.id) ? 'bg-pink-500' : 'bg-white/90 dark:bg-gray-800/90'
            }`}
          >
            <HeartIcon
              className={`w-6 h-6 ${isFavorite(product.id) ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
              filled={isFavorite(product.id)}
            />
          </button>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto -mt-6 relative z-10">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all shadow-lg ${
                  index === currentImageIndex
                    ? 'border-pink-500 ring-2 ring-pink-500/30'
                    : 'border-white/50 dark:border-gray-700'
                }`}
              >
                <Image
                  src={getImageUrl(img) || ''}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-5 space-y-4">
        {/* Name */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
          {product.name}
        </h1>

        {/* Price Block */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {finalPrice.toLocaleString('ru-RU')} ₽
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        {/* Stock Info */}
        {product.quantity !== undefined && (
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.quantity > 0 ? `В наличии: ${product.quantity} шт.` : 'Нет в наличии'}
            </span>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center justify-between bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Количество</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-10 h-10 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full shadow-sm border border-white/30 dark:border-white/10 flex items-center justify-center text-xl font-light text-gray-700 dark:text-gray-200 disabled:opacity-40 active:scale-95 transition-all"
            >
              −
            </button>
            <span className="text-xl font-semibold text-gray-900 dark:text-white w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 99}
              className="w-10 h-10 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full shadow-sm border border-white/30 dark:border-white/10 flex items-center justify-center text-xl font-light text-gray-700 dark:text-gray-200 disabled:opacity-40 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Итого:</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {(finalPrice * quantity).toLocaleString('ru-RU')} ₽
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Описание</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Похожие товары
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {relatedProducts.map((related) => {
                const relatedImage = related.images?.[0];
                const relatedPrice =
                  related.promotionPrice || related.discountPrice || related.price;

                return (
                  <div
                    key={related.id}
                    onClick={() => handleRelatedProductClick(related.slug)}
                    className="flex-shrink-0 w-32 cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-2">
                      {relatedImage ? (
                        <Image
                          src={getImageUrl(relatedImage) || ''}
                          alt={related.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-3xl opacity-50">📦</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
                      {related.name}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {relatedPrice.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar - iOS style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-t-3xl border-t border-white/30 dark:border-white/10 shadow-2xl z-50">
        <div className="px-4 pt-4 pb-6">
          {/* Info Row */}
          <div className="flex items-center justify-between mb-3">
            {/* Stock & Quantity Info */}
            <div className="flex items-center gap-3">
              {product.quantity !== undefined && product.quantity > 0 && (
                <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {product.quantity} шт.
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full">
                <span className="text-xs text-gray-500 dark:text-gray-400">Кол-во:</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{quantity}</span>
              </div>
            </div>

            {/* Total Price */}
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Итого</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(finalPrice * quantity).toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          {/* Add to Cart Button - iOS style */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.quantity === 0}
            className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 ${
              product.quantity === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Добавление...</span>
              </>
            ) : product.quantity === 0 ? (
              <span>Нет в наличии</span>
            ) : (
              <>
                <CartIcon className="w-5 h-5" />
                <span>Добавить в корзину</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
