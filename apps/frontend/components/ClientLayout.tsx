'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { MenuModal } from './MenuModal';
import { SearchModal } from './SearchModal';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { itemsCount } = useCartStore();
  const haptic = useTelegramHaptic();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Don't show header/nav on admin pages
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

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header
        cartItemsCount={itemsCount}
        onCartClick={handleCartClick}
        onMenuClick={handleMenuClick}
        onSearchClick={handleSearchClick}
      />
      <main className="pt-28">{children}</main>
      <BottomNav />
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};
