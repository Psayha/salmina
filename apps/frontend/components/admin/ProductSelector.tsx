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
        const data = await productsApi.getProducts({ limit: 100 }); // Fetch more products
        setProducts(data.items);
      } catch (error) {
        console.error('Failed to fetch products:', error);
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
    return <div className="animate-pulse h-10 bg-gray-100 rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
        />
      </div>

      <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
        {filteredProducts.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          return (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                isSelected ? 'bg-pink-50' : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {product.images?.[0] && (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                <div className="text-xs text-gray-500">{Number(product.price).toLocaleString()} ₽</div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">Товары не найдены</div>
        )}
      </div>

      <div className="text-xs text-gray-500">Выбрано: {selectedIds.length}</div>
    </div>
  );
}
