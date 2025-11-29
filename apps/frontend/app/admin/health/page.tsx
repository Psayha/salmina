'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, HardDrive, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Package, Archive, Trash2, Plus, RotateCcw, Shield, Ban } from 'lucide-react';
import { healthApi, HealthCheckResponse } from '@/lib/api/endpoints/health';
import { backupApi, BackupStatus } from '@/lib/api/endpoints/backup';
import { securityApi, SecurityStatus } from '@/lib/api/endpoints/security';
import { useTelegramHaptic } from '@/lib/telegram/useTelegram';

export default function HealthPage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [backups, setBackups] = useState<BackupStatus | null>(null);
  const [security, setSecurity] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
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

  const fetchBackups = async () => {
    try {
      setBackupLoading(true);
      const data = await backupApi.getBackups();
      setBackups(data);
    } catch (err) {
      console.error('Failed to fetch backups:', err);
    } finally {
      setBackupLoading(false);
    }
  };

  const fetchSecurity = async () => {
    try {
      setSecurityLoading(true);
      const data = await securityApi.getStatus();
      setSecurity(data);
    } catch (err) {
      console.error('Failed to fetch security status:', err);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (creatingBackup) return;

    try {
      setCreatingBackup(true);
      haptic?.impactOccurred('medium');
      await backupApi.createBackup();
      haptic?.notificationOccurred('success');
      await fetchBackups();
    } catch (err) {
      haptic?.notificationOccurred('error');
      console.error('Failed to create backup:', err);
      alert('Ошибка создания бэкапа');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Удалить бэкап ${filename}?`)) return;

    try {
      haptic?.impactOccurred('medium');
      await backupApi.deleteBackup(filename);
      haptic?.notificationOccurred('success');
      await fetchBackups();
    } catch (err) {
      haptic?.notificationOccurred('error');
      console.error('Failed to delete backup:', err);
      alert('Ошибка удаления бэкапа');
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`ВНИМАНИЕ! Восстановление из бэкапа ${filename} перезапишет все текущие данные. Продолжить?`)) return;
    if (!confirm('Вы уверены? Это действие необратимо!')) return;

    try {
      haptic?.impactOccurred('heavy');
      await backupApi.restoreBackup(filename);
      haptic?.notificationOccurred('success');
      alert('Бэкап успешно восстановлен');
    } catch (err) {
      haptic?.notificationOccurred('error');
      console.error('Failed to restore backup:', err);
      alert('Ошибка восстановления бэкапа');
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchBackups();
    fetchSecurity();

    if (!autoRefresh) return;

    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    haptic?.impactOccurred('light');
    fetchHealth();
    fetchBackups();
    fetchSecurity();
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
              Мониторинг состояния системы и бэкапов
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Кэш и сессии</p>
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
              </div>
            </div>
          </div>

          {/* Backups Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Бэкапы базы данных
              </h3>

              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {creatingBackup ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {creatingBackup ? 'Создание...' : 'Создать бэкап'}
              </button>
            </div>

            {backups && (
              <>
                {/* Backup Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Всего бэкапов</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{backups.backupCount}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Общий размер</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{backups.totalSize}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Последний бэкап</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {backups.lastBackup
                        ? new Date(backups.lastBackup).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
                        : 'Нет'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Следующий бэкап</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {backups.nextBackup
                        ? new Date(backups.nextBackup).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </div>
                  </div>
                </div>

                {/* Backup List */}
                {backups.backups.length > 0 ? (
                  <div className="space-y-3">
                    {backups.backups.map((backup) => (
                      <div
                        key={backup.filename}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <Archive className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {backup.filename}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {backup.sizeFormatted} • {backup.age}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestoreBackup(backup.filename)}
                            className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
                            title="Восстановить"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup.filename)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Нет бэкапов</p>
                    <p className="text-sm">Создайте первый бэкап кнопкой выше</p>
                  </div>
                )}
              </>
            )}

            {backupLoading && !backups && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500" />
                <p className="mt-2 text-gray-500">Загрузка бэкапов...</p>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Безопасность
              </h3>
            </div>

            {security && (
              <>
                {/* Security Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Fail2ban</div>
                    <div className={`text-lg font-bold ${security.fail2ban.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {security.fail2ban.available ? 'Активен' : 'Не активен'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Заблокировано IP</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {security.fail2ban.totalBanned}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Jails активных</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {security.fail2ban.jails.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Firewall</div>
                    <div className={`text-lg font-bold ${security.firewall.enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {security.firewall.enabled ? 'Активен' : 'Не активен'}
                    </div>
                  </div>
                </div>

                {/* Banned IPs List */}
                {security.fail2ban.bannedIPs.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Заблокированные IP адреса
                    </h4>
                    <div className="space-y-2">
                      {security.fail2ban.bannedIPs.map((item, index) => (
                        <div
                          key={`${item.ip}-${index}`}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <Ban className="w-4 h-4 text-red-500" />
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {item.ip}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {item.jail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Нет заблокированных IP</p>
                  </div>
                )}

                {/* Active Jails */}
                {security.fail2ban.jails.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Активные Jails
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {security.fail2ban.jails.map((jail) => (
                        <span
                          key={jail}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                        >
                          {jail}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {securityLoading && !security && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500" />
                <p className="mt-2 text-gray-500">Загрузка статуса безопасности...</p>
              </div>
            )}
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
              💡 <strong>Совет:</strong> Бэкапы создаются автоматически каждый день в 3:00.
              Хранится последние 7 бэкапов. Вы можете создать бэкап вручную в любое время.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
