'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { MenuModal } from './MenuModal';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { itemsCount } = useCartStore();
  const haptic = useTelegramHaptic();
  const [showMenu, setShowMenu] = useState(false);

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
    router.push('/search');
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          className="pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomNav />
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
};
