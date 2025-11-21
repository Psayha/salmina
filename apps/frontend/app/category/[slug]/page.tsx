'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/lib/api/types';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { Loading, EmptyState } from '@/components/ui';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'newest'>('popular');

  const { addToCart } = useCartStore();
  const haptic = useTelegramHaptic();

  useTelegramBackButton(() => {
    router.back();
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch category
        const categoryData = await categoriesApi.getCategoryBySlug(slug);
        setCategory(categoryData);

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

        // Fetch products in category
        const productsData = await productsApi.getProducts({
          categoryId: categoryData.id,
          ...getSortParams(),
          limit: 50,
        });
        setProducts(productsData.items);
      } catch (error) {
        console.error('Error fetching category:', error);
        haptic.notificationOccurred('error');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug, sortBy, haptic]);

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

  const handleProductClick = (productSlug: string) => {
    haptic.impactOccurred('light');
    router.push(`/product/${productSlug}`);
  };

  if (isLoading) {
    return <Loading fullScreen size="lg" />;
  }

  if (!category) {
    return (
      <EmptyState
        emoji="❓"
        title="Категория не найдена"
        message="Попробуйте выбрать другую категорию"
        action={{ label: 'На главную', onClick: () => router.push('/') }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen relative z-10 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-light text-gray-900">{category.name}</h1>
          {category.description && <p className="text-sm font-light text-gray-600 mt-2">{category.description}</p>}
        </div>

        {/* Sort Options */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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

      {/* Products Grid */}
      <div className="px-6 py-6">
        {products.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-light text-gray-600">
              {products.length} {products.length === 1 ? 'товар' : 'товаров'}
            </p>
            <div className="grid grid-cols-2 gap-4">
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
          <EmptyState
            emoji="📦"
            title="Товаров пока нет"
            message="В этой категории еще нет товаров"
            action={{ label: 'Вернуться назад', onClick: () => router.back() }}
          />
        )}
      </div>
    </div>
  );
}
