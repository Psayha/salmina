'use client';

import type { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loading = ({ size = 'md', fullScreen = false, className, ...props }: LoadingProps) => {
  const sizeConfig = {
    sm: { container: 'w-5 h-5', dot: 'w-1 h-1' },
    md: { container: 'w-8 h-8', dot: 'w-1.5 h-1.5' },
    lg: { container: 'w-12 h-12', dot: 'w-2 h-2' },
  };

  const spinner = (
    <div className={cn('relative flex items-center justify-center', sizeConfig[size].container, className)} {...props}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn('absolute rounded-full bg-gradient-to-r from-pink-400 to-blue-400', sizeConfig[size].dot)}
          style={{
            top: i === 0 ? '0%' : i === 2 ? '100%' : '50%',
            left: i === 1 ? '100%' : i === 3 ? '0%' : '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/40 dark:border-white/20 shadow-2xl"
        >
          {spinner}
        </motion.div>
      </div>
    );
  }

  return spinner;
};

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({ count = 3, className }: LoadingSkeletonProps) => {
  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/40 dark:border-white/20 shadow-2xl max-w-md w-full"
      >
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              className={cn('h-16 bg-gradient-to-r from-white/40 to-white/20 dark:from-white/10 dark:to-white/5 rounded-2xl', className)}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
}

export const LoadingCard = ({ title }: LoadingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-white/20 shadow-lg"
    >
      {title && <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-4">{title}</p>}
      <div className="space-y-3">
        {[0.75, 1, 0.85].map((width, i) => (
          <motion.div
            key={i}
            className="h-4 bg-gradient-to-r from-white/50 to-white/30 dark:from-white/10 dark:to-white/5 rounded-lg"
            style={{ width: `${width * 100}%` }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
