'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/lib/api/types';
import { ProductCard } from '@/components/ProductCard';
import { CategoryPill } from '@/components/ui';
import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check } from 'lucide-react';

function SearchPageContent() {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCartStore();

  useTelegramBackButton(() => {
    if (showFilters) {
      setShowFilters(false);
    } else {
      router.back();
    }
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoriesApi.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Search products
  const searchProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const getSortParams = () => {
        switch (sortBy) {
          case 'price_asc':
            return { sortBy: 'price' as const, sortOrder: 'asc' as const };
          case 'price_desc':
            return { sortBy: 'price' as const, sortOrder: 'desc' as const };
          case 'newest':
            return { sortBy: 'createdAt' as const, sortOrder: 'desc' as const };
          default:
            return {};
        }
      };

      const results = await productsApi.getProducts({
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        ...getSortParams(),
        limit: 50,
      });
      setProducts(Array.isArray(results?.items) ? results.items : []);
    } catch (error) {
      console.error('Error searching products:', error);
      haptic.notificationOccurred('error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, sortBy, haptic]);

  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    haptic.selectionChanged();
  };

  const handleSortChange = (value: typeof sortBy) => {
    setSortBy(value);
    haptic.selectionChanged();
    setShowFilters(false);
  };

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

  const sortOptions = [
    { value: 'popular' as const, label: 'Популярные' },
    { value: 'newest' as const, label: 'Новинки' },
    { value: 'price_asc' as const, label: 'Сначала дешевле' },
    { value: 'price_desc' as const, label: 'Сначала дороже' },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || 'Сортировка';

  return (
    <div className="min-h-screen relative z-10 pb-24">
      {/* Header */}
      <div className="sticky top-24 z-40 bg-white/60 dark:bg-white/10 backdrop-blur-md border-b border-white/30 dark:border-white/10 shadow-lg">
        <div className="px-4 py-4 space-y-3">
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Каталог</h1>

          {/* Categories with Filter Icon */}
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide">
            {/* Filter Button */}
            <button
              onClick={() => {
                haptic.impactOccurred('light');
                setShowFilters(true);
              }}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Category Pills */}
            <CategoryPill active={selectedCategory === 'all'} onClick={() => handleCategoryChange('all')}>
              Все
            </CategoryPill>
            {categories.map((category) => (
              <CategoryPill
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </CategoryPill>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Results Count & Current Sort */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-light text-gray-600 dark:text-gray-400">
            {isLoading ? 'Загрузка...' : `${products.length} товаров`}
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

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                imageUrl={product.images && product.images.length > 0 ? product.images[0] : undefined}
                emoji="🎁"
                onAddToCart={() => handleAddToCart(product.id)}
                onClick={() => handleProductClick(product.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/30 dark:border-white/10 shadow-lg text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/30 dark:bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <h2 className="text-xl font-light text-gray-900 dark:text-white mb-3">Товары не найдены</h2>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                Попробуйте выбрать другую категорию
              </p>
            </div>
          </div>
        )}
      </div>

      {/* iOS-style Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Сортировка</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sort Options */}
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

              {/* Bottom padding */}
              <div className="h-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
