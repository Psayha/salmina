'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Tag, Percent } from 'lucide-react';
import { Promotion } from '@/lib/api/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegramHaptic, useTelegramBackButton } from '@/lib/telegram/useTelegram';

interface StoriesProps {
  promotions: Promotion[];
  initialIndex: number;
  onClose: () => void;
}

export function Stories({ promotions, initialIndex, onClose }: StoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const haptic = useTelegramHaptic();
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());
  const progressRef = useRef<number>(0);

  const STORY_DURATION = 10000; // 10 seconds per story
  const currentPromotion = promotions[currentIndex];

  // Stable callback for BackButton
  const handleBackButtonClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Telegram BackButton closes stories
  useTelegramBackButton(handleBackButtonClick);

  // Hide UI elements when stories are open
  useEffect(() => {
    document.body.classList.add('stories-open');
    return () => {
      document.body.classList.remove('stories-open');
    };
  }, []);

  // Progress animation
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    startTimeRef.current = Date.now();
    progressRef.current = progress;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(progressRef.current + (elapsed / STORY_DURATION) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        // Move to next story
        if (currentIndex < promotions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setProgress(0);
          progressRef.current = 0;
          haptic?.selectionChanged();
        } else {
          // Close stories when reaching the end
          onClose();
        }
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, isPaused, promotions.length, onClose, progress, haptic]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      progressRef.current = 0;
      haptic?.impactOccurred('light');
    }
  };

  const goToNext = () => {
    if (currentIndex < promotions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      progressRef.current = 0;
      haptic?.impactOccurred('light');
    } else {
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const width = window.innerWidth;

    if (x < width / 3) {
      goToPrevious();
    } else if (x > (width * 2) / 3) {
      goToNext();
    }
  };

  const handleClose = () => {
    haptic?.impactOccurred('medium');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
        onTouchStart={handleTouchStart}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3 pt-safe">
          {promotions.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width:
                    index < currentIndex
                      ? '100%'
                      : index === currentIndex
                        ? `${progress}%`
                        : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white mt-safe"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation buttons (desktop) */}
        <div className="hidden md:flex absolute inset-y-0 left-0 right-0 z-10 pointer-events-none">
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < promotions.length - 1 && (
            <button
              onClick={goToNext}
              className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Story content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            {/* Background Image */}
            {currentPromotion.image && (
              <div className="absolute inset-0">
                <Image
                  src={currentPromotion.image}
                  alt={currentPromotion.title}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe text-white space-y-4 z-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{currentPromotion.title}</h2>
                {currentPromotion.description && (
                  <p className="text-sm text-white/90 font-light leading-relaxed">
                    {currentPromotion.description}
                  </p>
                )}
              </div>

              {/* Discount badge */}
              {(currentPromotion.discountPercent || currentPromotion.discountAmount) && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg">
                    {currentPromotion.discountPercent ? (
                      <>
                        <Percent className="w-4 h-4" />
                        <span className="font-bold text-lg">-{currentPromotion.discountPercent}%</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-4 h-4" />
                        <span className="font-bold text-lg">
                          -{Number(currentPromotion.discountAmount).toLocaleString()} ₽
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              {(currentPromotion.validFrom || currentPromotion.validTo) && (
                <div className="text-xs text-white/70 space-y-1">
                  {currentPromotion.validFrom && (
                    <div>Начало: {new Date(currentPromotion.validFrom).toLocaleDateString('ru-RU')}</div>
                  )}
                  {currentPromotion.validTo && (
                    <div>Окончание: {new Date(currentPromotion.validTo).toLocaleDateString('ru-RU')}</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
