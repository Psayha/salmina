'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/api/types';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await productsApi.searchProducts(query, { limit: 6 });
      setResults(response.items || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      return;
    }

    const debounce = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen, searchProducts]);

  const handleProductClick = (slug: string) => {
    haptic?.impactOccurred('light');
    router.push(`/product/${slug}`);
    onClose();
  };

  const handleViewAll = () => {
    haptic?.impactOccurred('light');
    router.push(searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search');
    onClose();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    haptic?.selectionChanged();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-0 right-0 z-[101] mx-auto max-w-md px-3"
            style={{
              top: 'calc(var(--safe-top, 0px) + 56px)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
              {/* Header with Search Input */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Поиск товаров..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                  autoFocus
                />
                <motion.button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-pink-500 rounded-full animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {results.map((product) => (
                      <motion.button
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              ✨
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-pink-500 font-semibold">
                            {(product.promotionPrice || product.discountPrice || product.price).toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ничего не найдено
                    </p>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Введите название товара
                    </p>
                  </div>
                )}
              </div>

              {/* View All Button */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <motion.button
                  onClick={handleViewAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {searchQuery ? 'Показать все результаты' : 'Открыть каталог'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
