import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  emoji?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-9xl',
};

export function ImagePlaceholder({
  emoji = '🎁',
  size = 'md',
  className,
  ...props
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10',
        className,
      )}
      {...props}
    >
      <span className={sizeMap[size]}>{emoji}</span>
    </div>
  );
}
