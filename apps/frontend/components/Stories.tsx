'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Promotion } from '@/lib/api/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegramHaptic, useTelegramBackButton } from '@/lib/telegram/useTelegram';
import Link from 'next/link';

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
  const holdTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isHoldingRef = useRef(false);

  const STORY_DURATION = 10000; // 10 seconds per story
  const HOLD_DELAY = 150; // Delay before considering it a "hold" gesture
  const currentPromotion = promotions[currentIndex];

  // Get the first product if available
  const linkedProduct = currentPromotion.products?.[0];

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

  // Touch handlers with hold-to-pause gesture (like Instagram)
  const handleTouchStart = () => {
    // Start hold timer
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsPaused(true);
      haptic?.impactOccurred('light');
    }, HOLD_DELAY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear hold timer
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    // If was holding, just unpause
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsPaused(false);
      return;
    }

    // Otherwise, navigate based on tap position
    const touch = e.changedTouches[0];
    const x = touch.clientX;
    const width = window.innerWidth;

    if (x < width / 3) {
      goToPrevious();
    } else if (x > (width * 2) / 3) {
      goToNext();
    }
  };

  const handleTouchCancel = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsPaused(false);
    }
  };

  // Mouse handlers for desktop
  const handleMouseDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsPaused(true);
    }, HOLD_DELAY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsPaused(false);
      return;
    }

    // Navigate on click
    const x = e.clientX;
    const width = window.innerWidth;

    if (x < width / 3) {
      goToPrevious();
    } else if (x > (width * 2) / 3) {
      goToNext();
    }
  };

  const handleMouseLeave = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsPaused(false);
    }
  };

  const handleClose = () => {
    haptic?.impactOccurred('medium');
    onClose();
  };

  // Get product image URL
  const getProductImageUrl = (product: typeof linkedProduct) => {
    if (!product?.images?.[0]) return null;
    const img = product.images[0];
    if (img.startsWith('http')) return img;
    return `https://app.salminashop.ru${img.startsWith('/') ? '' : '/'}${img}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Progress bars - positioned in the middle (where header usually is) */}
        <div className="absolute top-[60px] left-0 right-0 z-20 flex gap-1 px-4">
          {promotions.map((_, index) => (
            <div key={index} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
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

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">Пауза</span>
          </div>
        )}

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex flex-col"
          >
            {/* Full screen image */}
            {currentPromotion.image && (
              <div className="absolute inset-0">
                <Image
                  src={
                    currentPromotion.image.startsWith('http')
                      ? currentPromotion.image
                      : `https://app.salminashop.ru${currentPromotion.image}`
                  }
                  alt=""
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
            )}

            {/* Bottom overlay with product card and dates */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pb-safe">
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

              <div className="relative p-4 space-y-3">
                {/* Dates */}
                {(currentPromotion.validFrom || currentPromotion.validTo) && (
                  <div className="flex items-center justify-center gap-2 text-white/80 text-xs">
                    {currentPromotion.validFrom && (
                      <span>
                        с {new Date(currentPromotion.validFrom).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                    {currentPromotion.validFrom && currentPromotion.validTo && (
                      <span>—</span>
                    )}
                    {currentPromotion.validTo && (
                      <span>
                        до {new Date(currentPromotion.validTo).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                )}

                {/* Product card thumbnail */}
                {linkedProduct && (
                  <Link
                    href={`/product/${linkedProduct.slug}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic?.impactOccurred('medium');
                    }}
                    className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 active:scale-[0.98] transition-transform"
                  >
                    {/* Product image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                      {getProductImageUrl(linkedProduct) ? (
                        <Image
                          src={getProductImageUrl(linkedProduct)!}
                          alt={linkedProduct.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm line-clamp-1">
                        {linkedProduct.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {linkedProduct.promotionPrice || linkedProduct.discountPrice ? (
                          <>
                            <span className="text-white font-semibold">
                              {Number(linkedProduct.promotionPrice || linkedProduct.discountPrice).toLocaleString()} ₽
                            </span>
                            <span className="text-white/50 text-sm line-through">
                              {Number(linkedProduct.price).toLocaleString()} ₽
                            </span>
                          </>
                        ) : (
                          <span className="text-white font-semibold">
                            {Number(linkedProduct.price).toLocaleString()} ₽
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 text-white/70">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
