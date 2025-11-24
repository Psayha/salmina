'use client';

import { Menu, Search, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export const Header = ({ cartItemsCount = 0, onMenuClick, onCartClick, onSearchClick }: HeaderProps) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        paddingTop: 'var(--safe-top, 0px)',
      }}
    >
      <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-center gap-3">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/50 transition-all duration-300 active:scale-95"
        >
          <Menu className="w-5 h-5 text-gray-800" strokeWidth={2} />
        </button>

        {/* Cart Button */}
        <button
          onClick={onCartClick}
          className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/50 transition-all duration-300 active:scale-95"
        >
          <ShoppingBag className="w-5 h-5 text-gray-800" strokeWidth={2} />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white text-[10px] font-bold border-2 border-white shadow-md">
              {cartItemsCount > 9 ? '9+' : cartItemsCount}
            </span>
          )}
        </button>

        {/* Search Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/50 transition-all duration-300 active:scale-95"
        >
          <Search className="w-5 h-5 text-gray-800" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};
