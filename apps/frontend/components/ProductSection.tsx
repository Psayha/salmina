'use client';

import { Product } from '@/lib/api/types';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProductSectionProps {
  title: string;
  products: Product[];
  isLoading?: boolean;
  viewAllLink?: string;
  onProductClick: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export function ProductSection({
  title,
  products,
  isLoading,
  viewAllLink,
  onProductClick,
  onAddToCart,
}: ProductSectionProps) {
  if (!isLoading && products.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-light text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center text-sm text-pink-500 hover:text-pink-600 transition-colors"
          >
            <span>Все</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="-mx-4 px-4">
        <div
          className="overflow-x-auto scrollbar-hide"
          style={{
            padding: '0 16px',
            margin: '0 -16px',
          }}
        >
          <div className="flex gap-3 w-max pl-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[160px] sm:w-[180px]">
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map((product) => (
                  <div key={product.id} className="w-[160px] sm:w-[180px]">
                    <ProductCard {...product} onAddToCart={onAddToCart} onClick={onProductClick} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
