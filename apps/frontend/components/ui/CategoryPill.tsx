import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CategoryPillProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const CategoryPill = forwardRef<HTMLButtonElement, CategoryPillProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full',
          'border border-white/30 text-xs font-light text-gray-900',
          'tracking-wide whitespace-nowrap shadow-lg',
          'hover:bg-white/50 transition-all duration-300',
          active && 'bg-white/60 border-white/50',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

CategoryPill.displayName = 'CategoryPill';
