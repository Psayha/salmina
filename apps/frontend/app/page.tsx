'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { MenuModal } from '@/components/MenuModal';
import { promotionsApi } from '@/lib/api/endpoints/promotions';
import { productsApi, categoriesApi } from '@/lib/api';
import { Promotion, Product, Category } from '@/lib/api/types';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { ProductSection } from '@/components/ProductSection';
// ...

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMenu, setShowMenu] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Partial<Category>[]>([{ id: 'all', name: 'Все товары', slug: 'all' }]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Product sections states
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [hitProducts, setHitProducts] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // ...

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [categoriesResponse, promotionsResponse, newResponse, hitResponse, discountResponse, allResponse] =
          await Promise.all([
            categoriesApi.getCategories(),
            promotionsApi.getPromotions(),
            productsApi.getProducts({ isNew: true, limit: 8 }),
            productsApi.getProducts({ isHit: true, limit: 8 }),
            productsApi.getProducts({ isDiscount: true, limit: 8 }),
            productsApi.getProducts({ limit: 20 }),
          ]);

        setCategories([
          { id: 'all', name: 'Все товары', slug: 'all' },
          ...(Array.isArray(categoriesResponse) ? categoriesResponse : []),
        ]);
        setPromotions(Array.isArray(promotionsResponse) ? promotionsResponse : []);

        setNewProducts(newResponse.items || []);
        setHitProducts(hitResponse.items || []);
        setDiscountProducts(discountResponse.items || []);
        setAllProducts(allResponse.items || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setCategories([{ id: 'all', name: 'Все товары', slug: 'all' }]);
        setPromotions([]);
        setNewProducts([]);
        setHitProducts([]);
        setDiscountProducts([]);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Zustand stores
  const { addToCart, itemsCount } = useCartStore();

  // Telegram SDK
  const haptic = useTelegramHaptic();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      return;
    }

    const tg = window.Telegram.WebApp;
    const setHeaderColor = tg.setHeaderColor;

    if (!setHeaderColor) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 0) {
        // При прокрутке - скрываем статус бар
        setHeaderColor('#00000000'); // Прозрачный цвет
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const handleCartClick = () => {
    haptic.impactOccurred('light');
    router.push('/cart');
  };

  const handleMenuClick = () => {
    haptic.impactOccurred('light');
    setShowMenu(true);
  };

  const handleSearchClick = () => {
    haptic.impactOccurred('light');
    router.push('/search');
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
      {/* ... Header ... */}
      <Header
        cartItemsCount={itemsCount}
        onCartClick={handleCartClick}
        onMenuClick={handleMenuClick}
        onSearchClick={handleSearchClick}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-20 pb-24 relative z-10">
        {/* Banners Section */}
        {promotions.length > 0 && (
          <div className="mb-8 px-4">
            <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
              <div className="flex gap-4 w-max">
                {promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    onClick={() => {
                      haptic.impactOccurred('light');
                      if (promotion.link) router.push(promotion.link);
                    }}
                    className="w-[85vw] sm:w-80 aspect-square rounded-2xl overflow-hidden relative snap-center shadow-lg cursor-pointer active:scale-95 transition-transform"
                  >
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
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent z-20">
                      <h3 className="text-white font-medium text-lg">{promotion.title}</h3>
                      {promotion.description && (
                        <p className="text-white/80 text-sm line-clamp-1">{promotion.description}</p>
                      )}
                    </div>
                  </div>
                ))}
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
          isLoading={isLoading}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Хиты продаж"
          products={hitProducts}
          isLoading={isLoading}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Скидки"
          products={discountProducts}
          isLoading={isLoading}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />

        {/* All Products Grid */}
        <div className="px-4">
          <h2 className="text-xl font-light text-gray-900 mb-4">Все товары</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : allProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={handleAddToCart}
                    onClick={handleProductClick}
                  />
                ))}
          </div>
        </div>
      </main>

      {/* Menu Modal */}
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
}
