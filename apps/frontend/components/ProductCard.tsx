'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Button } from './ui/Button';
import { CartIcon } from './ui/icons';

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
  description,
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
  // Calculate final price (priority: promotionPrice > discountPrice > price)
  const finalPrice = promotionPrice || discountPrice || price;
  const hasDiscount = finalPrice < price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(id);
  };

  const handleClick = () => {
    onClick?.(slug);
  };

  return (
    <div
      className="group bg-[var(--card-bg)] backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--card-border)] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={handleClick}
      role="article"
      aria-label={`Товар: ${name}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-white/30 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center border-b border-[var(--card-border)] shrink-0 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <span className="text-6xl group-hover:scale-105 transition-transform duration-500 ease-out">{emoji}</span>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded-full shadow-sm">
              Новинка
            </span>
          )}
          {isHit && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-orange-500 text-white rounded-full shadow-sm">
              Хит
            </span>
          )}
          {hasPromotion && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-red-500 text-white rounded-full shadow-sm">
              Акция
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-1 flex flex-col grow">
        <h3 className="text-sm font-normal text-[var(--foreground)] tracking-wide uppercase">{name}</h3>

        {description && (
          <p className="text-xs text-[var(--foreground)]/70 font-light line-clamp-2 grow">{description}</p>
        )}

        {/* Price & Add to Cart */}
        <div className="pt-1.5 flex items-center justify-between border-t border-[var(--card-border)] shrink-0">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {finalPrice.toLocaleString('ru-RU')} ₽
            </span>
            {hasDiscount && (
              <span className="text-xs text-[var(--foreground)]/60 line-through">
                {price.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>

          <Button
            variant="icon"
            size="sm"
            onClick={handleAddToCart}
            aria-label="Добавить в корзину"
            className="shrink-0"
          >
            <CartIcon className="w-4 h-4 text-[var(--foreground)]/80" />
          </Button>
        </div>
      </div>
    </div>
  );
});
