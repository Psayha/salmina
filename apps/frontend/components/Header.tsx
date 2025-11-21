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
    <header className="w-full sticky top-0 z-50 pt-[env(safe-area-inset-top)] bg-white/60 backdrop-blur-md border-b border-white/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center relative">
          {/* Menu Button - Left aligned relative to center content, but kept within safe bounds */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Button variant="icon" onClick={onMenuClick} aria-label="Меню">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>

          {/* Center Logo/Title */}
          <span className="text-lg font-light tracking-widest uppercase text-gray-900">Salmina</span>

          {/* Right Actions */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
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
