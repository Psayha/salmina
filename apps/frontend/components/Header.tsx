'use client';

import { Button } from './ui/Button';
import { CartIcon, SearchIcon } from './ui/icons';

interface HeaderProps {
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export const Header = ({
  cartItemsCount = 0,
  onMenuClick,
  onCartClick,
  onSearchClick,
}: HeaderProps) => {
  return (
    <header className="w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={onMenuClick}>
              Menu
            </Button>

            <Button variant="icon" onClick={onSearchClick} aria-label="Поиск">
              <SearchIcon className="w-5 h-5 text-gray-900" />
            </Button>

            <div className="relative">
              <Button
                variant="icon"
                onClick={onCartClick}
                aria-label={`Корзина${cartItemsCount > 0 ? `, товаров: ${cartItemsCount}` : ''}`}
              >
                <CartIcon className="w-5 h-5 text-gray-900" />
              </Button>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
