'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress over 2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300); // Small delay for smooth transition
          return 100;
        }
        return prev + 2; // 50 steps over 2 seconds
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--background-start) 0%, var(--background-end) 100%)',
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-[var(--foreground)]">Salmina</h1>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/60"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          className="mt-4 text-sm text-[var(--foreground)]/70 font-light"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Загрузка...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};
