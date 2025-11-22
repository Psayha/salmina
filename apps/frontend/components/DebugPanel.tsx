'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function DebugPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Intercept console.log
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ');
      setLogs((prev) => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const copyLogs = () => {
    const allLogs = logs.join('\n');
    navigator.clipboard.writeText(allLogs);
    alert('Логи скопированы в буфер обмена!');
  };

  const authInfo = {
    isAuthenticated,
    isLoading,
    userId: user?.id,
    telegramId: user?.telegramId,
    role: user?.role,
    firstName: user?.firstName,
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 bg-purple-500 text-white p-3 rounded-full shadow-lg"
      >
        🐛
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold">Debug Panel</h2>
              <button onClick={() => setIsOpen(false)} className="text-2xl">
                ×
              </button>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Auth Info:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(authInfo, null, 2)}</pre>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Console Logs:</h3>
                <button onClick={copyLogs} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  Копировать
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs space-y-1 max-h-96 overflow-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">Логов пока нет...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
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
