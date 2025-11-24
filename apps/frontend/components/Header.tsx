'use client';

import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export const Header = ({ cartItemsCount = 0, onMenuClick, onCartClick }: HeaderProps) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: 'var(--safe-top, 0px)',
      }}
    >
      <div className="relative max-w-md mx-auto px-4 py-2 flex items-center justify-center gap-3">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="px-5 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          <span className="text-xs font-medium text-gray-800 tracking-wide">MENU</span>
        </button>

        {/* Cart Icon */}
        <button
          onClick={onCartClick}
          className="relative p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          <ShoppingBag className="w-5 h-5 text-gray-800" strokeWidth={2} />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white text-[9px] font-bold shadow-md">
              {cartItemsCount > 9 ? '9+' : cartItemsCount}
            </span>
          )}
        </button>

        {/* Blur fade-out zone for scrolling content - starts right after buttons */}
        <div
          className="absolute top-full left-0 right-0 h-20 pointer-events-none"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          }}
        />
      </div>
    </header>
  );
};
