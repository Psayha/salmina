'use client';

import { useEffect, useState } from 'react';
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

  const { addToCart, isLoading: isAddingToCart } = useCartStore();
  const haptic = useTelegramHaptic();

  useTelegramBackButton(() => {
    router.back();
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        const data = await productsApi.getProductBySlug(slug);
        setProduct(data);

        // Fetch related products
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
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug, haptic]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      haptic.notificationOccurred('success');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Error adding to cart:', error);
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

  const handleRelatedProductClick = (productId: string) => {
    haptic.impactOccurred('light');
    router.push(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center">
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-white/30 dark:bg-white/10 rounded-xl"></div>
            <div className="h-8 bg-white/30 dark:bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/30 dark:bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/30 dark:bg-white/10 rounded w-5/6"></div>
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

  return (
    <div className="min-h-screen relative z-10 pb-24">
      {/* Product Image */}
      <div className="relative h-96 w-full bg-white/40 dark:bg-white/10 backdrop-blur-md border-b border-white/30 dark:border-white/10">
        {product.images && product.images.length > 0 ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-9xl">🎁</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-6 right-6 w-12 h-12 bg-white/60 dark:bg-white/20 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 shadow-lg flex items-center justify-center hover:bg-white/70 dark:hover:bg-white/30 transition-all duration-300"
        >
          <HeartIcon className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-200'}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="px-6 py-6 space-y-6">
        {/* Name and Price */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
          <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-gray-900 dark:text-white">{finalPrice.toLocaleString('ru-RU')} ₽</span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">{product.price.toLocaleString('ru-RU')} ₽</span>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">Описание</h2>
            <p className="text-sm font-light text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4">Количество</h2>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-12 h-12 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 shadow-lg flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl font-light text-gray-700 dark:text-gray-200">−</span>
            </button>

            <span className="text-3xl font-light text-gray-900 dark:text-white min-w-[60px] text-center">{quantity}</span>

            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 99}
              className="w-12 h-12 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 shadow-lg flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl font-light text-gray-700 dark:text-gray-200">+</span>
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 px-2">Похожие товары</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.map((related) => (
                <div
                  key={related.id}
                  onClick={() => handleRelatedProductClick(related.slug)}
                  className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/30 dark:border-white/10 shadow-lg cursor-pointer hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-300"
                >
                  <div className="aspect-square relative mb-3 bg-white/30 dark:bg-white/10 rounded-lg overflow-hidden">
                    {related.images && related.images.length > 0 ? (
                      <Image src={related.images[0]} alt={related.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-5xl">🎁</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-light text-gray-900 dark:text-white mb-1 line-clamp-2">{related.name}</p>
                  <p className="text-base font-light text-gray-900 dark:text-white">
                    {(related.promotionPrice || related.discountPrice || related.price).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-white/10 backdrop-blur-md border-t border-white/30 dark:border-white/10 shadow-lg p-6 z-50">
        <Button onClick={handleAddToCart} disabled={isAddingToCart} className="w-full py-4 text-base">
          <CartIcon className="w-5 h-5 mr-2 text-gray-900 dark:text-white" />
          {isAddingToCart ? 'Добавление...' : 'Добавить в корзину'}
        </Button>
      </div>
    </div>
  );
}
