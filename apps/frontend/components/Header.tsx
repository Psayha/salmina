'use client';

import { Search, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export const Header = ({ cartItemsCount = 0, onMenuClick, onCartClick, onSearchClick }: HeaderProps) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-sm"
      style={{
        paddingTop: 'var(--safe-top, 0px)',
      }}
    >
      <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
        {/* Menu Text */}
        <button
          onClick={onMenuClick}
          className="text-sm font-medium text-gray-900 hover:text-pink-500 transition-colors"
        >
          Меню
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <button onClick={onSearchClick} className="text-gray-700 hover:text-pink-500 transition-colors">
            <Search className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Cart Icon with Badge */}
          <button onClick={onCartClick} className="relative text-gray-700 hover:text-pink-500 transition-colors">
            <ShoppingBag className="w-5 h-5" strokeWidth={2} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-white text-[9px] font-bold">
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
