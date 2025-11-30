'use client';

import { memo } from 'react';
import Image from 'next/image';
import { CartIcon, HeartIcon } from './ui/icons';
import { useFavoritesStore } from '@/store/useFavoritesStore';

export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  promotionPrice?: number;
  emoji?: string;
  imageUrl?: string;
  isNew?: boolean;
  isHit?: boolean;
  hasPromotion?: boolean;
  onAddToCart?: (id: string) => void;
  onClick?: (slug: string) => void;
}

export const ProductCard = memo(function ProductCard({
  slug,
  id,
  name,
  description: _description,
  price,
  discountPrice,
  promotionPrice,
  emoji = '✨',
  imageUrl,
  isNew,
  isHit,
  hasPromotion,
  onAddToCart,
  onClick,
}: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const isInFavorites = isFavorite(id);

  // Calculate final price (priority: promotionPrice > discountPrice > price)
  const finalPrice = promotionPrice || discountPrice || price;
  const hasDiscount = finalPrice < price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  const handleClick = () => {
    onClick?.(slug);
  };

  return (
    <div
      className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={handleClick}
      role="article"
      aria-label={`Товар: ${name}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <span className="text-5xl opacity-60">{emoji}</span>
        )}

        {/* Badges - minimal style */}
        {(isNew || isHit || hasPromotion) && (
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            {hasPromotion && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-rose-500 text-white rounded-full">
                %
              </span>
            )}
            {isNew && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500 text-white rounded-full">
                NEW
              </span>
            )}
            {isHit && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500 text-white rounded-full">
                HIT
              </span>
            )}
          </div>
        )}

        {/* Favorite button - top right */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full z-10 transition-all duration-200 active:scale-95 ${
            isInFavorites
              ? 'bg-pink-500 text-white'
              : 'bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-pink-500'
          }`}
          aria-label={isInFavorites ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <HeartIcon className="w-4 h-4" filled={isInFavorites} />
        </button>

        {/* Quick add button - always visible on mobile, hover on desktop */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-900 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-10"
          aria-label="Добавить в корзину"
        >
          <CartIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Content - fixed height */}
      <div className="p-3 flex flex-col h-[88px]">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[40px]">{name}</h3>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            {finalPrice.toLocaleString('ru-RU')} ₽
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {price.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
