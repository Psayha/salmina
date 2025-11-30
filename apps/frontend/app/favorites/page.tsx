'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCartStore } from '@/store/useCartStore';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/api/types';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState, Loading } from '@/components/ui';
import { HeartIcon } from '@/components/ui/icons';

export default function FavoritesPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const { addToCart } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useTelegramBackButton(() => {
    router.back();
  });

  useEffect(() => {
    async function fetchFavorites() {
      if (favoriteIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Bulk fetch products by IDs (optimized)
        const favoriteProducts = await productsApi.getProductsByIds(favoriteIds);
        setProducts(favoriteProducts);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        haptic.notificationOccurred('error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFavorites();
  }, [favoriteIds, haptic]);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      haptic.notificationOccurred('success');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Error adding to cart:', error);
    }
  };

  const handleProductClick = (slug: string) => {
    haptic.impactOccurred('light');
    router.push(`/product/${slug}`);
  };

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId);
    haptic.impactOccurred('light');
  };

  if (isLoading) {
    return <Loading fullScreen size="lg" />;
  }

  return (
    <div className="min-h-screen relative z-10 pb-8">
      {/* Header */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-light text-gray-900 dark:text-white">Избранное</h1>
          {products.length > 0 && (
            <p className="text-sm font-light text-gray-600 dark:text-gray-400">
              {products.length} {products.length === 1 ? 'товар' : 'товаров'}
            </p>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          emoji="💝"
          title="Избранное пусто"
          message="Добавьте товары в избранное, нажав на иконку сердечка"
          action={{ label: 'Перейти к покупкам', onClick: () => router.push('/') }}
          fullScreen
        />
      ) : (
        <div className="px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {products.map((product) => (
              <div key={product.id} className="relative">
                {/* Favorite button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(product.id);
                  }}
                  className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/80 dark:bg-white/20 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 shadow-lg flex items-center justify-center hover:bg-white/90 dark:hover:bg-white/30 transition-all duration-300"
                >
                  <HeartIcon className="w-5 h-5 fill-red-500 text-red-500" />
                </button>

                <ProductCard
                  {...product}
                  imageUrl={product.images && product.images.length > 0 ? product.images[0] : undefined}
                  emoji="🎁"
                  onAddToCart={() => handleAddToCart(product.id)}
                  onClick={() => handleProductClick(product.slug)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
