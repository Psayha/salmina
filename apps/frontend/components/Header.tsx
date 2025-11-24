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
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-center gap-3">
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
      </div>

      {/* Gradient blur overlay for content below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
        }}
      />
    </header>
  );
};
