'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const { addToCart, isLoading: isAddingToCart } = useCartStore();
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
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      haptic.notificationOccurred('success');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Add to cart error:', error);
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
    setIsFavorite(!isFavorite);
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
    <div className="min-h-screen relative z-10 pb-28">
      {/* Image Gallery */}
      <div className="relative bg-white dark:bg-gray-900">
        {/* Main Image */}
        <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800">
          {currentImage && !imageError ? (
            <Image
              src={getImageUrl(currentImage) || ''}
              alt={product.name}
              fill
              className="object-contain"
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <span className="text-8xl opacity-50">📦</span>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
              -{discountPercent}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 w-11 h-11 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <HeartIcon
              className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
            />
          </button>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-gray-200 dark:border-gray-700'
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
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Количество</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center text-xl font-light text-gray-700 dark:text-gray-200 disabled:opacity-40 active:scale-95 transition-transform"
            >
              −
            </button>
            <span className="text-xl font-semibold text-gray-900 dark:text-white w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 99}
              className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center text-xl font-light text-gray-700 dark:text-gray-200 disabled:opacity-40 active:scale-95 transition-transform"
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

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4 z-50">
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.quantity === 0}
          className="w-full py-4 text-base font-semibold"
        >
          <CartIcon className="w-5 h-5 mr-2" />
          {isAddingToCart
            ? 'Добавление...'
            : product.quantity === 0
              ? 'Нет в наличии'
              : `В корзину • ${(finalPrice * quantity).toLocaleString('ru-RU')} ₽`}
        </Button>
      </div>
    </div>
  );
}
