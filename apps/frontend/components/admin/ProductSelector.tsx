'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { Product } from '@/lib/api/types';
import { productsApi } from '@/lib/api';
import Image from 'next/image';

interface ProductSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ProductSelector({ selectedIds, onChange }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getProducts({ limit: 100 });
        setProducts(data?.items || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((pid) => pid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Товары акции</h3>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/60 dark:bg-white/10 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
      </div>

      <div className="max-h-60 overflow-y-auto border border-white/30 dark:border-white/10 rounded-xl divide-y divide-white/30 dark:divide-white/10 bg-white/40 dark:bg-white/5">
        {filteredProducts.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          const imageUrl = product.images?.[0]
            ? product.images[0].startsWith('http')
              ? product.images[0]
              : `https://app.salminashop.ru${product.images[0]}`
            : null;

          return (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-pink-50 dark:bg-pink-500/20'
                  : 'hover:bg-gray-50 dark:hover:bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-pink-500 border-pink-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                {imageUrl && (
                  <Image src={imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{Number(product.price).toLocaleString()} ₽</div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Товары не найдены</div>
        )}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">Выбрано: {selectedIds.length}</div>
    </div>
  );
}
