'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Skeleton for table rows
export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <Skeleton height={40} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton for cards
export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 space-y-4">
          <Skeleton height={24} width="60%" />
          <Skeleton height={16} width="100%" count={3} />
          <div className="flex gap-2 mt-4">
            <Skeleton height={36} width={100} />
            <Skeleton height={36} width={100} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for form
export function SkeletonForm() {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton height={20} width={120} />
        <Skeleton height={40} width="100%" />
      </div>
      <div className="space-y-2">
        <Skeleton height={20} width={100} />
        <Skeleton height={100} width="100%" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton height={20} width={80} />
          <Skeleton height={40} width="100%" />
        </div>
        <div className="space-y-2">
          <Skeleton height={20} width={90} />
          <Skeleton height={40} width="100%" />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Skeleton height={44} className="flex-1" />
        <Skeleton height={44} className="flex-1" />
      </div>
    </div>
  );
}

// Skeleton for stats cards
export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/30">
          <div className="flex items-center justify-between mb-3">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton height={16} width={60} />
          </div>
          <Skeleton height={32} width="70%" />
          <Skeleton height={16} width="50%" className="mt-2" />
        </div>
      ))}
    </div>
  );
}
