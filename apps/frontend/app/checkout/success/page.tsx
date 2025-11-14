'use client';

import { useRouter } from 'next/navigation';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Button } from '@/components/ui';
import { useEffect } from 'react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  useEffect(() => {
    haptic.notificationOccurred('success');
  }, []);

  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border border-white/30 shadow-lg text-center max-w-md">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500/30 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-light text-gray-900 mb-3">Заказ оформлен!</h1>
        <p className="text-sm font-light text-gray-600 mb-8">
          Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
        </p>

        <div className="space-y-3">
          <Button onClick={() => router.push('/orders')} className="w-full">
            Мои заказы
          </Button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-white/30 backdrop-blur-md rounded-full border border-white/30 text-sm font-light text-gray-700 hover:bg-white/40 transition-all duration-300"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}
