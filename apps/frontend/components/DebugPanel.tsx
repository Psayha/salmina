'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

// Global log storage that exists before component mounts
const globalLogs: string[] = [];
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Intercept console methods immediately
console.log = (...args) => {
  originalConsoleLog(...args);
  const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
  globalLogs.push(`[LOG ${new Date().toLocaleTimeString()}] ${message}`);
  if (globalLogs.length > 100) globalLogs.shift();
};

console.error = (...args) => {
  originalConsoleError(...args);
  const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
  globalLogs.push(`[ERROR ${new Date().toLocaleTimeString()}] ${message}`);
  if (globalLogs.length > 100) globalLogs.shift();
};

console.warn = (...args) => {
  originalConsoleWarn(...args);
  const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
  globalLogs.push(`[WARN ${new Date().toLocaleTimeString()}] ${message}`);
  if (globalLogs.length > 100) globalLogs.shift();
};

export function DebugPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync global logs to component state
    setLogs([...globalLogs]);

    // Update logs every 500ms
    intervalRef.current = setInterval(() => {
      setLogs([...globalLogs]);
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const copyLogs = () => {
    const allLogs = logs.join('\n');
    navigator.clipboard.writeText(allLogs);
    alert('Логи скопированы в буфер обмена!');
  };

  const clearLogs = () => {
    globalLogs.length = 0;
    setLogs([]);
  };

  const authInfo = {
    isAuthenticated,
    isLoading,
    userId: user?.id,
    telegramId: user?.telegramId,
    role: user?.role,
    firstName: user?.firstName,
    hasAccessToken: typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false,
    hasRefreshToken: typeof window !== 'undefined' ? !!localStorage.getItem('refreshToken') : false,
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 bg-purple-500 text-white p-3 rounded-full shadow-lg"
      >
        🐛 {logs.length}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold">Debug Panel ({logs.length} logs)</h2>
              <button onClick={() => setIsOpen(false)} className="text-2xl">
                ×
              </button>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Auth Info:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(authInfo, null, 2)}
              </pre>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Console Logs:</h3>
                <div className="space-x-2">
                  <button onClick={clearLogs} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                    Очистить
                  </button>
                  <button onClick={copyLogs} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Копировать
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs space-y-1 max-h-96 overflow-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">Логов пока нет...</div>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap break-all ${
                        log.includes('[ERROR')
                          ? 'text-red-400'
                          : log.includes('[WARN')
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
