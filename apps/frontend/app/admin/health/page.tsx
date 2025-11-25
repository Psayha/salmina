'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, HardDrive, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Package } from 'lucide-react';
import { healthApi, HealthCheckResponse } from '@/lib/api/endpoints/health';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

export default function HealthPage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const haptic = useTelegramHaptic();

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthApi.getHealth();
      setHealth(data);
      setLastUpdate(new Date());
      haptic?.notificationOccurred('success');
    } catch (err) {
      setError('Failed to fetch health status');
      haptic?.notificationOccurred('error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    // Auto-refresh every 10 seconds if enabled
    if (!autoRefresh) return;

    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    haptic?.impactOccurred('light');
    fetchHealth();
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}д ${hours}ч ${minutes}м`;
    if (hours > 0) return `${hours}ч ${minutes}м ${secs}с`;
    if (minutes > 0) return `${minutes}м ${secs}с`;
    return `${secs}с`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Activity className="w-8 h-8" />
              System Health
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Мониторинг состояния системы в реальном времени
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => {
                setAutoRefresh(!autoRefresh);
                haptic?.impactOccurred('medium');
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                autoRefresh
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {autoRefresh ? 'Auto ✓' : 'Manual'}
            </button>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Last update */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Последнее обновление: {lastUpdate.toLocaleTimeString('ru-RU')}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {health && (
        <>
          {/* Overall Status */}
          <div className="mb-6">
            <div
              className={`p-6 rounded-2xl border-2 ${
                health.status === 'ok'
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : health.status === 'degraded'
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(health.status)}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {health.status === 'ok'
                        ? 'Система работает нормально'
                        : health.status === 'degraded'
                        ? 'Система работает с ограничениями'
                        : 'Система недоступна'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Статус: <span className="font-semibold uppercase">{health.status}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatUptime(health.uptime)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Database Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${getStatusColor(health.checks.database)}`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">PostgreSQL</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">База данных</p>
                  </div>
                </div>
                {getStatusIcon(health.checks.database)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Статус</span>
                  <span
                    className={`font-semibold uppercase ${
                      health.checks.database === 'ok'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {health.checks.database}
                  </span>
                </div>
                {health.checks.database === 'ok' && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ✓ Подключение установлено
                  </div>
                )}
              </div>
            </div>

            {/* Redis Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${getStatusColor(health.checks.redis)}`}>
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Redis</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Кэш и очереди</p>
                  </div>
                </div>
                {getStatusIcon(health.checks.redis)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Статус</span>
                  <span
                    className={`font-semibold uppercase ${
                      health.checks.redis === 'ok'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {health.checks.redis}
                  </span>
                </div>
                {health.checks.redis === 'ok' && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ✓ Подключение установлено
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Информация о системе
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Версия</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {health.version || '1.2.0'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Последняя проверка</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(health.timestamp).toLocaleTimeString('ru-RU')}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Время работы</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatUptime(health.uptime)}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              💡 <strong>Совет:</strong> Эта страница автоматически обновляется каждые 10 секунд.
              Вы можете отключить автообновление кнопкой "Auto" и обновлять вручную.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
