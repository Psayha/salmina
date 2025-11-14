import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-300',
          'bg-white/40 backdrop-blur-md border border-white/30 shadow-lg',
          'hover:bg-white/50 hover:shadow-xl',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            // Variants
            'px-6 py-2.5 text-xs font-light tracking-widest uppercase':
              variant === 'primary' && size === 'md',
            'px-5 py-2.5 text-xs font-light tracking-wide':
              variant === 'ghost' && size === 'md',
            'w-10 h-10': variant === 'icon' && size === 'md',
            'w-8 h-8': variant === 'icon' && size === 'sm',
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
