'use client';

import { memo } from 'react';
import { Button } from './ui/Button';
import { CartIcon } from './ui/icons';

export interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  promotionPrice?: number;
  emoji?: string;
  imageUrl?: string;
  onAddToCart?: (id: string) => void;
  onClick?: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({
  id,
  name,
  description,
  price,
  discountPrice,
  promotionPrice,
  emoji = '✨',
  imageUrl,
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
    onClick?.(id);
  };

  return (
    <div
      className="group bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={handleClick}
      role="article"
      aria-label={`Товар: ${name}`}
    >
      {/* Image */}
      <div className="w-full aspect-square bg-white/30 backdrop-blur-sm flex items-center justify-center border-b border-white/20 flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <span className="text-6xl group-hover:scale-105 transition-transform duration-500 ease-out">
            {emoji}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-1 flex flex-col flex-grow">
        <h3 className="text-sm font-normal text-gray-900 tracking-wide uppercase">
          {name}
        </h3>

        {description && (
          <p className="text-xs text-gray-700 font-light line-clamp-2 flex-grow">
            {description}
          </p>
        )}

        {/* Price & Add to Cart */}
        <div className="pt-1.5 flex items-center justify-between border-t border-white/30 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">
              {finalPrice.toLocaleString('ru-RU')} ₽
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-600 line-through">
                {price.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>

          <Button
            variant="icon"
            size="sm"
            onClick={handleAddToCart}
            aria-label="Добавить в корзину"
            className="flex-shrink-0"
          >
            <CartIcon className="w-4 h-4 text-gray-700" />
          </Button>
        </div>
      </div>
    </div>
  );
});
