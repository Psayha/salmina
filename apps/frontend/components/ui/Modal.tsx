'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'info',
  isLoading = false,
}: ModalProps) {
  const typeStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/30',
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow-yellow-500/30',
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:shadow-pink-500/30',
    },
  };

  const styles = typeStyles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ paddingTop: 'calc(60px + var(--safe-top, env(safe-area-inset-top)))' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  {type !== 'info' && (
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-900 ${styles.icon}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
                    {description && <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">{description}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              {children && <div className="p-6">{children}</div>}

              {/* Footer */}
              {onConfirm && (
                <div className="flex gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-light disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2.5 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg font-light disabled:opacity-50 ${styles.button}`}
                  >
                    {isLoading ? 'Загрузка...' : confirmText}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for easier modal management
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
}
