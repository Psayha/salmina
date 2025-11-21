'use client';

import { Button } from './ui/Button';
import { CartIcon, SearchIcon } from './ui/icons';

interface HeaderProps {
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export const Header = ({ cartItemsCount = 0, onMenuClick, onCartClick, onSearchClick }: HeaderProps) => {
  return (
    <header className="w-full sticky top-0 z-50 pt-[env(safe-area-inset-top)] bg-[var(--card-bg)] backdrop-blur-md border-b border-[var(--card-border)] shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={onMenuClick}>
              Меню
            </Button>

            <Button variant="icon" size="sm" onClick={onSearchClick} aria-label="Поиск">
              <SearchIcon className="w-4 h-4 text-[var(--foreground)]" />
            </Button>

            <div className="relative">
              <Button
                variant="icon"
                size="sm"
                onClick={onCartClick}
                aria-label={`Корзина${cartItemsCount > 0 ? `, товаров: ${cartItemsCount}` : ''}`}
              >
                <CartIcon className="w-4 h-4 text-[var(--foreground)]" />
              </Button>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
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
