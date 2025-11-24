'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/lib/api/types';
import { ProductCard } from '@/components/ProductCard';
import { CategoryPill } from '@/components/ui';
import { SearchIcon } from '@/components/ui/icons';
import { useCartStore } from '@/store/useCartStore';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const haptic = useTelegramHaptic();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'newest'>('popular');

  const { addToCart } = useCartStore();

  useTelegramBackButton(() => {
    router.back();
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoriesApi.getCategories();
        // Ensure categories is always an array
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

      // Map sortBy to API format
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

      if (searchQuery.trim()) {
        const results = await productsApi.searchProducts(searchQuery, {
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          ...getSortParams(),
        });
        // Ensure items is always an array
        setProducts(Array.isArray(results?.items) ? results.items : []);
      } else {
        const results = await productsApi.getProducts({
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          ...getSortParams(),
          limit: 50,
        });
        // Ensure items is always an array
        setProducts(Array.isArray(results?.items) ? results.items : []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      haptic.notificationOccurred('error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, haptic]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchProducts]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    haptic.selectionChanged();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    haptic.selectionChanged();
  };

  const handleSortChange = (value: typeof sortBy) => {
    setSortBy(value);
    haptic.selectionChanged();
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

  return (
    <div className="min-h-screen relative z-10 pb-24">
      {/* Header with Search */}
      <div className="sticky top-24 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="px-6 py-4 space-y-4">
          <h1 className="text-2xl font-light text-gray-900">Поиск</h1>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Искать товары..."
              className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/30 text-sm font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { value: 'popular' as const, label: 'Популярные' },
              { value: 'newest' as const, label: 'Новинки' },
              { value: 'price_asc' as const, label: 'Дешевле' },
              { value: 'price_desc' as const, label: 'Дороже' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-4 py-2 rounded-full border text-xs font-light whitespace-nowrap transition-all duration-300 ${
                  sortBy === option.value
                    ? 'bg-white/60 border-white/50 text-gray-900'
                    : 'bg-white/30 border-white/30 text-gray-600 hover:bg-white/40'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700">Категории</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-light text-gray-600">
              Найдено: {products.length} {products.length === 1 ? 'товар' : 'товаров'}
            </p>
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
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border border-white/30 shadow-lg text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/30 rounded-full flex items-center justify-center">
                <SearchIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-light text-gray-900 mb-3">
                {searchQuery ? 'Ничего не найдено' : 'Начните поиск'}
              </h2>
              <p className="text-sm font-light text-gray-600">
                {searchQuery ? 'Попробуйте изменить запрос или фильтры' : 'Введите название товара в поле поиска'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
