'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, ChevronRight, Check } from 'lucide-react';
import { legalApi, LegalDocument, LegalDocumentType } from '@/lib/api/endpoints/legal';
import { usersApi } from '@/lib/api/endpoints/users';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { useAuthStore } from '@/store/useAuthStore';

const documentLabels: Record<string, string> = {
  [LegalDocumentType.TERMS]: 'Пользовательское соглашение',
  [LegalDocumentType.PRIVACY]: 'Политика конфиденциальности',
  [LegalDocumentType.OFFER]: 'Публичная оферта',
  [LegalDocumentType.DELIVERY_PAYMENT]: 'Доставка и оплата',
};

export function LegalConsentModal() {
  const haptic = useTelegramHaptic();
  const { user, setUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    // Don't show modal if user already accepted terms
    if (!user) {
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    if (user.hasAcceptedTerms) {
      console.log('[LegalConsent] User already accepted terms');
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    console.log('[LegalConsent] User has NOT accepted terms, fetching documents...');

    // Fetch legal documents
    async function fetchDocuments() {
      try {
        const docs = await legalApi.getDocuments();
        console.log('[LegalConsent] Fetched documents:', docs);

        const activeTerms = docs.find((d) => d.type === LegalDocumentType.TERMS && d.isActive);
        const activePrivacy = docs.find((d) => d.type === LegalDocumentType.PRIVACY && d.isActive);

        console.log('[LegalConsent] Active TERMS:', activeTerms);
        console.log('[LegalConsent] Active PRIVACY:', activePrivacy);

        // Show modal if we have at least TERMS document
        if (activeTerms) {
          const docsToShow = [activeTerms];
          if (activePrivacy) {
            docsToShow.push(activePrivacy);
          }
          setDocuments(docsToShow);
          setIsOpen(true);
          console.log('[LegalConsent] Opening modal with documents:', docsToShow.length);
        } else {
          console.warn('[LegalConsent] No active TERMS document found! Modal will not show.');
        }
      } catch (error) {
        console.error('[LegalConsent] Failed to fetch legal documents:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [user]);

  const handleAccept = async () => {
    if (isAccepting) return;

    setIsAccepting(true);
    try {
      const result = await usersApi.acceptTerms();

      if (result.success && user) {
        // Update user in store with new terms acceptance status
        setUser({
          ...user,
          hasAcceptedTerms: true,
          termsAcceptedAt: result.termsAcceptedAt,
        });
        haptic?.notificationOccurred('success');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to accept terms:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDocumentClick = (doc: LegalDocument) => {
    haptic?.impactOccurred('light');
    setSelectedDocument(doc);
  };

  const handleBack = () => {
    haptic?.impactOccurred('light');
    setSelectedDocument(null);
  };

  if (!isOpen || isLoading || !user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[100] bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <AnimatePresence mode="wait">
              {selectedDocument ? (
                /* Document View */
                <motion.div
                  key="document"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 pb-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleBack}
                      className="p-1 -ml-1 text-pink-500"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white flex-1">
                      {documentLabels[selectedDocument.type] || selectedDocument.title}
                    </h2>
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-light leading-relaxed">
                      {selectedDocument.content}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Версия {selectedDocument.version}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Consent View */
                <motion.div
                  key="consent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Header */}
                  <div className="px-4 pb-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Добро пожаловать!
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                      Для использования приложения ознакомьтесь с документами
                    </p>
                  </div>

                  {/* Documents List */}
                  <div className="px-4 space-y-2 flex-1">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleDocumentClick(doc)}
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {documentLabels[doc.type] || doc.title}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>
                    ))}
                  </div>

                  {/* Accept Button */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
                      Нажимая «Принять», вы соглашаетесь с условиями
                    </p>
                    <button
                      onClick={handleAccept}
                      disabled={isAccepting}
                      className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 hover:shadow-xl transition-shadow disabled:opacity-70"
                    >
                      {isAccepting ? (
                        <span>Сохранение...</span>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Принять и продолжить
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
