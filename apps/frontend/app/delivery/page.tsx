'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { useTelegramBackButton } from '@/lib/telegram/useTelegram';
import { legalApi, LegalDocument, LegalDocumentType } from '@/lib/api/endpoints/legal';

export default function DeliveryPage() {
  const router = useRouter();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useTelegramBackButton(() => {
    router.back();
  });

  useEffect(() => {
    async function fetchDocument() {
      try {
        const docs = await legalApi.getDocuments();
        const deliveryDoc = docs.find(
          (d) => d.type === LegalDocumentType.DELIVERY_PAYMENT && d.isActive
        );
        setDocument(deliveryDoc || null);
      } catch (error) {
        console.error('Failed to fetch delivery document:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocument();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300 font-light">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 pb-8">
      {/* Header */}
      <div className="px-4 pt-2 pb-4">
        <h1 className="text-lg font-light text-gray-900 dark:text-white">Доставка и оплата</h1>
      </div>

      <div className="px-4">
        {document ? (
          <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
            <div
              className="text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
            <div className="mt-6 pt-4 border-t border-white/20 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Версия {document.version} • Обновлено{' '}
                {new Date(document.updatedAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-lg text-center">
            <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-400 font-light">
              Информация о доставке и оплате скоро появится
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
