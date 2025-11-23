'use client';

import { useRouter } from 'next/navigation';
import { Menu, Search, ShoppingBag, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCartButton?: boolean;
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  className?: string;
}

export const Header = ({
  title,
  showBackButton = false,
  showCartButton = true,
  cartItemsCount = 0,
  onMenuClick,
  onCartClick,
  onSearchClick,
  className,
}: HeaderProps) => {
  const router = useRouter();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300',
        className,
      )}
      style={{
        paddingTop: 'var(--safe-top, 0px)',
      }}
    >
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left Section: Back Button or Logo */}
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
          ) : (
            <div className="font-bold text-xl text-gray-900 tracking-tight">
              Salmina<span className="text-pink-500">.</span>
            </div>
          )}

          {title && <h1 className="text-lg font-medium text-gray-900">{title}</h1>}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1">
          {onSearchClick && (
            <button onClick={onSearchClick} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {showCartButton && (
            <button onClick={onCartClick} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>
          )}

          {onMenuClick && !showBackButton && (
            <button onClick={onMenuClick} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-gray-800" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
