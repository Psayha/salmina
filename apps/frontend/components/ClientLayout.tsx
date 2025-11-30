'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Header } from './Header';
import { MenuModal } from './MenuModal';
import { SearchModal } from './SearchModal';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { itemsCount } = useCartStore();
  const { favoriteIds } = useFavoritesStore();
  const haptic = useTelegramHaptic();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Don't show header on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  const handleCartClick = () => {
    haptic?.impactOccurred('light');
    router.push('/cart');
  };

  const handleMenuClick = () => {
    haptic?.impactOccurred('light');
    setShowMenu(true);
  };

  const handleSearchClick = () => {
    haptic?.impactOccurred('light');
    setShowSearch(true);
  };

  const handleFavoritesClick = () => {
    haptic?.impactOccurred('light');
    router.push('/favorites');
  };

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header
        cartItemsCount={itemsCount}
        favoritesCount={favoriteIds.length}
        pathname={pathname || '/'}
        isSearchOpen={showSearch}
        onCartClick={handleCartClick}
        onMenuClick={handleMenuClick}
        onSearchClick={handleSearchClick}
        onFavoritesClick={handleFavoritesClick}
      />
      <main className="pt-28">{children}</main>
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};
