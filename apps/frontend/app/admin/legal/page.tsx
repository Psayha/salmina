'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { legalApi, LegalDocument, LegalDocumentType } from '@/lib/api/endpoints/legal';

const documentLabels = {
  [LegalDocumentType.TERMS]: 'Пользовательское соглашение',
  [LegalDocumentType.PRIVACY]: 'Политика конфиденциальности',
  [LegalDocumentType.OFFER]: 'Публичная оферта',
  [LegalDocumentType.DELIVERY_PAYMENT]: 'Доставка и оплата',
};

export default function LegalDocumentsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const docs = await legalApi.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  const handleDocumentClick = (type: LegalDocumentType) => {
    haptic?.impactOccurred('light');
    router.push(`/admin/legal/${type.toLowerCase()}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 dark:text-gray-300 font-light">Загрузка документов...</div>
      </div>
    );
  }

  // Group documents by type, get latest version for each
  const documentsByType = Object.values(LegalDocumentType).map((type) => {
    const docs = documents.filter((doc) => doc.type === type);
    const latestDoc = docs.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )[0];
    return {
      type,
      document: latestDoc,
      label: documentLabels[type],
    };
  });

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-light text-gray-900 dark:text-white">Юридические документы</h1>
        <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
          Управление правовыми документами магазина
        </p>
      </div>

      <div className="space-y-3">
        {documentsByType.map(({ type, document, label }) => (
          <button
            key={type}
            onClick={() => handleDocumentClick(type)}
            className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                  {document ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Версия {document.version} • Обновлено{' '}
                      {new Date(document.updatedAt).toLocaleDateString('ru-RU')}
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Документ не создан</p>
                  )}
                </div>
              </div>
              {document && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    document.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {document.isActive ? 'Активен' : 'Неактивен'}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Совет:</strong> Обновляйте версию документа при внесении изменений. Активируйте документ после
          проверки содержания.
        </p>
      </div>
    </div>
  );
}
