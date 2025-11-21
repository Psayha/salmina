'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { CartIcon, SearchIcon } from './ui/icons';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCartButton?: boolean;
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export const Header = ({
  title,
  showBackButton = false,
  showCartButton = true,
  cartItemsCount = 0,
  onMenuClick,
  onCartClick,
  onSearchClick,
}: HeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header
      className="w-full fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      style={{
        paddingTop: 'var(--safe-top, 0px)',
        paddingLeft: 'var(--safe-left, 0px)',
        paddingRight: 'var(--safe-right, 0px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        {title ? (
          // Title mode - for internal pages
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Назад"
                >
                  <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-light text-foreground">{title}</h1>
            </div>
            {showCartButton && (
              <div className="relative">
                <Button
                  variant="icon"
                  size="sm"
                  onClick={onCartClick}
                  aria-label={`Корзина${cartItemsCount > 0 ? `, товаров: ${cartItemsCount}` : ''}`}
                >
                  <CartIcon className="w-4 h-4 text-foreground" />
                </Button>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          // Button mode - for main page
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={onMenuClick}>
                Меню
              </Button>

              <Button variant="icon" size="sm" onClick={onSearchClick} aria-label="Поиск">
                <SearchIcon className="w-4 h-4 text-foreground" />
              </Button>

              <div className="relative">
                <Button
                  variant="icon"
                  size="sm"
                  onClick={onCartClick}
                  aria-label={`Корзина${cartItemsCount > 0 ? `, товаров: ${cartItemsCount}` : ''}`}
                >
                  <CartIcon className="w-4 h-4 text-foreground" />
                </Button>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
