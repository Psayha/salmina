'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border border-white/30 shadow-lg text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-light text-gray-900 mb-3">Что-то пошло не так</h1>

            <p className="text-sm font-light text-gray-600 mb-6">
              Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm font-light text-gray-700 cursor-pointer hover:text-gray-900">
                  Показать детали ошибки
                </summary>
                <pre className="mt-3 p-4 bg-white/30 rounded-xl text-xs overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset}>
                Попробовать снова
              </Button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 bg-white/30 backdrop-blur-md rounded-full border border-white/30 text-xs font-light text-gray-700 hover:bg-white/40 transition-all duration-300"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
