import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loading = ({ size = 'md', fullScreen = false, className, ...props }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div
      className={cn(
        'relative',
        sizeClasses[size],
        'animate-spin rounded-full border-2 border-gray-300 border-t-gray-900',
        className,
      )}
      {...props}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export const LoadingSkeleton = ({ count = 3, className, ...props }: LoadingSkeletonProps) => {
  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-lg max-w-md w-full">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={cn('h-20 bg-white/30 rounded-xl', className)} {...props} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
}

export const LoadingCard = ({ title }: LoadingCardProps) => {
  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
      {title && <p className="text-sm font-light text-gray-600 mb-4">{title}</p>}
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-white/30 rounded w-3/4"></div>
        <div className="h-4 bg-white/30 rounded w-full"></div>
        <div className="h-4 bg-white/30 rounded w-5/6"></div>
      </div>
    </div>
  );
};
