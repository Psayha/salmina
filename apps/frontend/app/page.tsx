'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { MenuModal } from '@/components/MenuModal';

// Mock data - TODO: replace with API calls
const CATEGORIES = [
  { id: 'all', name: 'Все товары' },
  { id: 'creams', name: 'Кремы' },
  { id: 'serums', name: 'Сыворотки' },
  { id: 'masks', name: 'Маски' },
  { id: 'toners', name: 'Тонеры' },
  { id: 'eye', name: 'Для глаз' },
  { id: 'cleansing', name: 'Очищение' },
  { id: 'body', name: 'Уход за телом' },
];

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Крем для лица',
    description:
      'Увлажняющий крем для лица с глубоким проникновением, насыщает кожу влагой и создает защитный барьер от внешних воздействий окружающей среды',
    price: 1500,
    emoji: '✨',
  },
  {
    id: '2',
    name: 'Сыворотка',
    description: 'Омолаживающая',
    price: 2300,
    emoji: '🌸',
  },
  {
    id: '3',
    name: 'Маска для лица',
    description: 'Очищающая',
    price: 890,
    emoji: '💅',
  },
  {
    id: '4',
    name: 'Тонер',
    description: 'Очищающий',
    price: 650,
    emoji: '🧴',
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMenu, setShowMenu] = useState(false);

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
      <Header
        cartItemsCount={itemsCount}
        onCartClick={handleCartClick}
        onMenuClick={handleMenuClick}
        onSearchClick={handleSearchClick}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 pt-24 pb-20 relative z-10">
        {/* Categories Scroll */}
        <div className="mb-8 -mx-4 px-4">
          <div
            className="overflow-x-auto scrollbar-hide"
            style={{
              padding: '16px 16px 16px 0',
              margin: '-16px -16px -16px 0',
            }}
          >
            <div className="flex gap-3 pl-4">
              {CATEGORIES.map((category) => (
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

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} onAddToCart={handleAddToCart} onClick={handleProductClick} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/30 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-center text-xs text-gray-700/70 font-light tracking-wider uppercase">© 2024</p>
        </div>
      </footer>

      {/* Menu Modal */}
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
}
