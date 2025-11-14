import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorMessage = ({
  title = 'Произошла ошибка',
  message = 'Попробуйте повторить позже',
  onRetry,
  fullScreen = false,
  className,
  ...props
}: ErrorMessageProps) => {
  const content = (
    <div
      className={cn(
        'bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-lg text-center',
        className,
      )}
      {...props}
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h2 className="text-xl font-light text-gray-900 mb-2">{title}</h2>
      <p className="text-sm font-light text-gray-600 mb-6">{message}</p>

      {onRetry && (
        <Button onClick={onRetry} className="mx-auto">
          Повторить
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
};

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  emoji?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullScreen?: boolean;
}

export const EmptyState = ({
  emoji = '📦',
  title,
  message,
  action,
  fullScreen = false,
  className,
  ...props
}: EmptyStateProps) => {
  const content = (
    <div
      className={cn(
        'bg-white/40 backdrop-blur-md rounded-2xl p-12 border border-white/30 shadow-lg text-center max-w-md',
        className,
      )}
      {...props}
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-white/30 rounded-full flex items-center justify-center">
        <span className="text-5xl">{emoji}</span>
      </div>

      <h2 className="text-xl font-light text-gray-900 mb-3">{title}</h2>
      {message && <p className="text-sm font-light text-gray-600 mb-6">{message}</p>}

      {action && (
        <Button onClick={action.onClick} className="mx-auto">
          {action.label}
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
};
