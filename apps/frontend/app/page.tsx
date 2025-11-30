'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { promotionsApi } from '@/lib/api/endpoints/promotions';
import { productsApi, categoriesApi } from '@/lib/api';
import { Promotion, Product } from '@/lib/api/types';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { StorySkeleton } from '@/components/StorySkeleton';
import { Stories } from '@/components/Stories';
import { SlidersHorizontal, X, Check } from 'lucide-react';

const PRODUCTS_PER_PAGE = 10;

const VIEWED_STORIES_KEY = 'salmina_viewed_stories';

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest';

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  // Stories state
  const [showStories, setShowStories] = useState(false);
  const [storiesStartIndex, setStoriesStartIndex] = useState(0);
  const [viewedStories, setViewedStories] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VIEWED_STORIES_KEY);
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });

  // Сохраняем просмотренные акции в localStorage
  useEffect(() => {
    if (viewedStories.size > 0) {
      localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify([...viewedStories]));
    }
  }, [viewedStories]);

  // React Query
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  const { data: promotions = [], isLoading: isLoadingPromotions } = useQuery({
    queryKey: ['promotions'],
    queryFn: promotionsApi.getPromotions,
  });

  const { data: allProductsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  // Подготовка данных
  const categories = [
    { id: 'all', name: 'Все товары', slug: 'all' },
    ...(Array.isArray(categoriesData) ? categoriesData : []),
  ];
  const allProducts: Product[] = allProductsData?.items || [];

  // Filter products by selected category
  const filteredByCategory = selectedCategory === 'all'
    ? allProducts
    : allProducts.filter((p) => p.categoryId === selectedCategory);

  // Sort products
  const sortedProducts = [...filteredByCategory].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return Number(a.promotionPrice || a.discountPrice || a.price) - Number(b.promotionPrice || b.discountPrice || b.price);
      case 'price_desc':
        return Number(b.promotionPrice || b.discountPrice || b.price) - Number(a.promotionPrice || a.discountPrice || a.price);
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'popular':
      default:
        return (b.orderCount || 0) - (a.orderCount || 0);
    }
  });

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;

  // Infinite scroll - загрузка при достижении конца
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingAll) {
          setVisibleCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, sortedProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingAll, sortedProducts.length]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY.current;
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff * 0.5, 100));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['promotions'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setVisibleCount(PRODUCTS_PER_PAGE);
      setIsRefreshing(false);
    }
    pullStartY.current = null;
    setPullDistance(0);
  }, [pullDistance, queryClient]);


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
    setSelectedCategory(categoryId);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    haptic.selectionChanged();
    setShowFilters(false);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  const sortOptions = [
    { value: 'popular' as const, label: 'Популярные' },
    { value: 'newest' as const, label: 'Новинки' },
    { value: 'price_asc' as const, label: 'Сначала дешевле' },
    { value: 'price_desc' as const, label: 'Сначала дороже' },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || 'Сортировка';

  return (
    <div
      className="min-h-screen relative z-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
          style={{ transform: `translateX(-50%) translateY(${Math.min(pullDistance, 60)}px)` }}
        >
          <div
            className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <svg
              className={`w-5 h-5 text-pink-500 transition-transform ${
                pullDistance > 60 ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-8 relative z-10">
        {/* Stories/Banners Section */}
        <div className="mb-6 px-4">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3">
              {isLoadingPromotions ? (
                Array.from({ length: 4 }).map((_, i) => <StorySkeleton key={i} />)
              ) : promotions.length > 0 ? (
                promotions.map((promotion: Promotion, index: number) => {
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
                      <div
                        className={`w-[100px] h-[100px] rounded-2xl p-[2px] ${
                          isViewed
                            ? 'bg-gray-300 dark:bg-gray-700'
                            : 'bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500'
                        }`}
                      >
                        <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-lg cursor-pointer active:scale-95 transition-transform bg-white dark:bg-gray-900">
                          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                          {(promotion.previewImage || promotion.image) && (
                            <Image
                              src={promotion.previewImage || promotion.image || ''}
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
                })
              ) : null}
            </div>
          </div>
        </div>

        {/* Categories Scroll */}
        <div className="mb-4 px-4">
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

        {/* Products Section */}
        <div className="px-4">
          {/* Header with count and sort */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-light text-gray-600 dark:text-gray-400">
              {isLoadingAll ? 'Загрузка...' : `${sortedProducts.length} товаров`}
            </p>
            <button
              onClick={() => {
                haptic.impactOccurred('light');
                setShowFilters(true);
              }}
              className="text-sm font-light text-pink-500 flex items-center gap-1"
            >
              {currentSortLabel}
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {isLoadingAll
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : visibleProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (index % PRODUCTS_PER_PAGE) * 0.05 }}
                  >
                    <ProductCard
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      discountPrice={product.discountPrice}
                      promotionPrice={product.promotionPrice}
                      imageUrl={product.images?.[0]}
                      isNew={product.isNew}
                      isHit={product.isHit}
                      hasPromotion={product.hasPromotion}
                      onAddToCart={handleAddToCart}
                      onClick={handleProductClick}
                    />
                  </motion.div>
                ))}
          </div>

          {/* Load more trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-pink-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!isLoadingAll && sortedProducts.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">В этой категории пока нет товаров</p>
          )}

          {/* End of list */}
          {!hasMore && sortedProducts.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-8">Все товары загружены</p>
          )}
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

      {/* iOS-style Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Сортировка</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span
                      className={`text-base ${
                        sortBy === option.value
                          ? 'text-pink-500 font-medium'
                          : 'text-gray-700 dark:text-gray-300 font-light'
                      }`}
                    >
                      {option.label}
                    </span>
                    {sortBy === option.value && <Check className="w-5 h-5 text-pink-500" />}
                  </button>
                ))}
              </div>

              <div className="h-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
