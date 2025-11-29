'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminCardGridProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  pageSize?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function AdminCardGrid<T>({
  data,
  renderCard,
  emptyMessage = 'Нет данных',
  pageSize = 10,
  currentPage,
  onPageChange,
}: AdminCardGridProps<T>) {
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData.map((item, index) => renderCard(item, startIndex + index))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/30 dark:border-white/10">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Страница {currentPage + 1} из {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Base card wrapper component for consistent styling
interface CardWrapperProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CardWrapper({ children, onClick, className = '' }: CardWrapperProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
