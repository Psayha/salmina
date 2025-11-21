import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CategoryPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const CategoryPill = forwardRef<HTMLButtonElement, CategoryPillProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-5 py-2.5 bg-[var(--card-bg)] backdrop-blur-md rounded-full',
          'border border-[var(--card-border)] text-xs font-light text-[var(--foreground)]',
          'tracking-wide whitespace-nowrap shadow-lg',
          'hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300',
          active && 'bg-white/60 dark:bg-white/20 border-white/50',
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
