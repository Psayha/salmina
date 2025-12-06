'use client';

import { ShoppingBag, Search, Heart } from 'lucide-react';

interface HeaderProps {
  cartItemsCount?: number;
  favoritesCount?: number;
  pathname?: string;
  isSearchOpen?: boolean;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  onFavoritesClick?: () => void;
}

export const Header = ({
  cartItemsCount = 0,
  favoritesCount = 0,
  pathname = '/',
  isSearchOpen = false,
  onMenuClick,
  onCartClick,
  onSearchClick,
  onFavoritesClick,
}: HeaderProps) => {
  const isFavoritesActive = pathname === '/favorites';
  const isCartActive = pathname === '/cart';
  const isSearchActive = isSearchOpen || pathname === '/search';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: 'var(--safe-top, 0px)',
      }}
    >
      {/* px-14 (56px) на каждую сторону чтобы не заезжать на системные кнопки Telegram */}
      <div className="max-w-md mx-auto px-14 py-2 flex items-center justify-center gap-2">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          <span className="text-xs font-medium text-gray-800 tracking-wide">MENU</span>
        </button>

        {/* Search Button */}
        <button
          onClick={onSearchClick}
          className={`p-2 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 ${
            isSearchActive ? 'bg-pink-500' : 'bg-white/90'
          }`}
        >
          <Search className={`w-5 h-5 ${isSearchActive ? 'text-white' : 'text-gray-800'}`} strokeWidth={2} />
        </button>

        {/* Favorites Button */}
        <button
          onClick={onFavoritesClick}
          className={`relative p-2 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 ${
            isFavoritesActive ? 'bg-pink-500' : 'bg-white/90'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavoritesActive ? 'text-white' : 'text-gray-800'}`} strokeWidth={2} />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white text-[9px] font-bold shadow-md border-2 border-white">
              {favoritesCount > 9 ? '9+' : favoritesCount}
            </span>
          )}
        </button>

        {/* Cart Button */}
        <button
          onClick={onCartClick}
          className={`relative p-2 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 ${
            isCartActive ? 'bg-pink-500' : 'bg-white/90'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${isCartActive ? 'text-white' : 'text-gray-800'}`} strokeWidth={2} />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white text-[9px] font-bold shadow-md border-2 border-white">
              {cartItemsCount > 9 ? '9+' : cartItemsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
