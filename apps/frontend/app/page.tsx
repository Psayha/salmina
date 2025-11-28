'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { promotionsApi } from '@/lib/api/endpoints/promotions';
import { productsApi, categoriesApi } from '@/lib/api';
import { Promotion } from '@/lib/api/types';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { ProductSection } from '@/components/ProductSection';
import { Stories } from '@/components/Stories';

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Stories state
  const [showStories, setShowStories] = useState(false);
  const [storiesStartIndex, setStoriesStartIndex] = useState(0);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  // React Query - данные кешируются автоматически
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: promotionsApi.getPromotions,
  });

  const { data: newProductsData, isLoading: isLoadingNew } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => productsApi.getProducts({ isNew: true, limit: 8 }),
  });

  const { data: hitProductsData, isLoading: isLoadingHit } = useQuery({
    queryKey: ['products', 'hit'],
    queryFn: () => productsApi.getProducts({ isHit: true, limit: 8 }),
  });

  const { data: discountProductsData, isLoading: isLoadingDiscount } = useQuery({
    queryKey: ['products', 'discount'],
    queryFn: () => productsApi.getProducts({ isDiscount: true, limit: 8 }),
  });

  const { data: allProductsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsApi.getProducts({ limit: 20 }),
  });

  // Подготовка данных
  const categories = [
    { id: 'all', name: 'Все товары', slug: 'all' },
    ...(Array.isArray(categoriesData) ? categoriesData : []),
  ];
  const newProducts = newProductsData?.items || [];
  const hitProducts = hitProductsData?.items || [];
  const discountProducts = discountProductsData?.items || [];
  const allProducts = allProductsData?.items || [];


  // Zustand stores
  const { addToCart } = useCartStore();

  // Telegram SDK
  const haptic = useTelegramHaptic();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      haptic.notificationOccurred('success');
    } catch (error) {
      console.error('Add to cart error:', error);
      haptic.notificationOccurred('error');
    }
  };

  const handleProductClick = (productId: string) => {
    haptic.selectionChanged();
    router.push(`/product/${productId}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    haptic.selectionChanged();
    if (categoryId === 'all') {
      setSelectedCategory(categoryId);
    } else {
      router.push(`/category/${categoryId}`);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-24 relative z-10">
        {/* Banners Section */}
        {promotions.length > 0 && (
          <div className="mb-6 px-4">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-3">
                {promotions.map((promotion: Promotion, index: number) => {
                  const isViewed = viewedStories.has(promotion.id);
                  return (
                    <div
                      key={promotion.id}
                      onClick={() => {
                        haptic.impactOccurred('light');
                        setStoriesStartIndex(index);
                        setShowStories(true);
                        setViewedStories((prev) => new Set([...prev, promotion.id]));
                      }}
                      className="relative shrink-0"
                    >
                      {/* Gradient border for unviewed stories */}
                      <div
                        className={`w-[100px] h-[100px] rounded-2xl p-[2px] ${
                          isViewed
                            ? 'bg-gray-300 dark:bg-gray-700'
                            : 'bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500'
                        }`}
                      >
                        <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-lg cursor-pointer active:scale-95 transition-transform bg-white dark:bg-gray-900">
                          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                          {promotion.image && (
                            <Image
                              src={promotion.image}
                              alt={promotion.title}
                              fill
                              className="object-cover relative z-10"
                              unoptimized
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Categories Scroll */}
        <div className="mb-8 px-4">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2">
              {categories
                .filter((c) => c.id)
                .map((category) => (
                  <CategoryPill
                    key={category.id}
                    active={selectedCategory === category.id}
                    onClick={() => handleCategoryChange(category.id!)}
                  >
                    {category.name}
                  </CategoryPill>
                ))}
            </div>
          </div>
        </div>

        {/* Product Sections */}
        <ProductSection
          title="Новинки"
          products={newProducts}
          isLoading={isLoadingNew}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Хиты продаж"
          products={hitProducts}
          isLoading={isLoadingHit}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Скидки"
          products={discountProducts}
          isLoading={isLoadingDiscount}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        {/* All Products Grid */}
        <div className="px-4">
          <h2 className="text-xl font-light text-gray-900 mb-4">Все товары</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {isLoadingAll
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : allProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id} slug={product.slug} name={product.name} description={product.description} price={product.price} discountPrice={product.discountPrice} promotionPrice={product.promotionPrice} imageUrl={product.images?.[0]}
                    onAddToCart={handleAddToCart}
                    onClick={handleProductClick}
                  />
                ))}
          </div>
        </div>
      </main>

      {/* Stories Modal */}
      {showStories && (
        <Stories
          promotions={promotions}
          initialIndex={storiesStartIndex}
          onClose={() => setShowStories(false)}
        />
      )}
    </div>
  );
}
