'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Database, HardDrive, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Package, Archive, Trash2, Plus, RotateCcw, Shield, Ban, ChevronDown } from 'lucide-react';
import { healthApi, HealthCheckResponse } from '@/lib/api/endpoints/health';
import { backupApi, BackupStatus } from '@/lib/api/endpoints/backup';
import { securityApi, SecurityStatus } from '@/lib/api/endpoints/security';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

export default function HealthPage() {
  const router = useRouter();
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
  const [showAllIPs, setShowAllIPs] = useState(false);
  const haptic = useTelegramHaptic();

  // Back button to admin
  useTelegramBackButton(() => {
    router.push('/admin');
  });

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

    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Banned IPs to display (max 3 unless expanded)
  const displayedIPs = security?.fail2ban?.bannedIPs
    ? showAllIPs
      ? security.fail2ban.bannedIPs
      : security.fail2ban.bannedIPs.slice(0, 3)
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Мониторинг
          </h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastUpdate.toLocaleTimeString('ru-RU')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAutoRefresh(!autoRefresh);
              haptic?.impactOccurred('medium');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoRefresh
                ? 'bg-blue-500 text-white'
                : 'bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-300'
            }`}
          >
            {autoRefresh ? 'Auto' : 'Manual'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {health && (
        <>
          {/* Overall Status - Compact */}
          <div
            className={`p-3 rounded-xl border ${
              health.status === 'ok'
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                : health.status === 'degraded'
                ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {health.status === 'ok' ? 'Система OK' : health.status === 'degraded' ? 'Ограничения' : 'Ошибка'}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Uptime: {formatUptime(health.uptime)}
              </span>
            </div>
          </div>

          {/* Database & Redis - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* PostgreSQL */}
            <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/30 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${getStatusColor(health.checks.database)}`}>
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">PostgreSQL</span>
                </div>
                {getStatusIcon(health.checks.database)}
              </div>
            </div>

            {/* Redis */}
            <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/30 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${getStatusColor(health.checks.redis)}`}>
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Redis</span>
                </div>
                {getStatusIcon(health.checks.redis)}
              </div>
            </div>
          </div>

          {/* Backups Section - Compact */}
          <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/30 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Бэкапы
              </h3>
              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs disabled:opacity-50"
              >
                {creatingBackup ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                {creatingBackup ? '...' : 'Создать'}
              </button>
            </div>

            {backups && (
              <>
                {/* Stats - 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Всего</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{backups.backupCount}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Размер</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{backups.totalSize}</div>
                  </div>
                </div>

                {/* Backup List */}
                {backups.backups.length > 0 ? (
                  <div className="space-y-2">
                    {backups.backups.slice(0, 3).map((backup) => (
                      <div
                        key={backup.filename}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Archive className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {backup.filename.replace('backup_', '').replace('.sql', '')}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">
                              {backup.sizeFormatted}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRestoreBackup(backup.filename)}
                            className="p-1 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup.filename)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                    Нет бэкапов
                  </div>
                )}
              </>
            )}

            {backupLoading && !backups && (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* Security Section - Compact */}
          <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/30 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" />
              Безопасность
            </h3>

            {security && (
              <>
                {/* Stats - 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Fail2ban</div>
                    <div className={`text-sm font-bold ${security.fail2ban.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {security.fail2ban.available ? 'Активен' : 'Выкл'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Заблокировано</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {security.fail2ban.totalBanned}
                    </div>
                  </div>
                </div>

                {/* Banned IPs - Show 3 with expand */}
                {security.fail2ban.bannedIPs.length > 0 && (
                  <div>
                    <div className="space-y-1">
                      {displayedIPs.map((item, index) => (
                        <div
                          key={`${item.ip}-${index}`}
                          className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Ban className="w-3 h-3 text-red-500" />
                            <span className="font-mono text-xs text-gray-900 dark:text-white">
                              {item.ip}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {item.jail}
                          </span>
                        </div>
                      ))}
                    </div>
                    {security.fail2ban.bannedIPs.length > 3 && (
                      <button
                        onClick={() => setShowAllIPs(!showAllIPs)}
                        className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg"
                      >
                        {showAllIPs ? 'Свернуть' : `Ещё ${security.fail2ban.bannedIPs.length - 3}`}
                        <ChevronDown className={`w-3 h-3 transition-transform ${showAllIPs ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {securityLoading && !security && (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* System Info - Compact */}
          <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/30 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" />
              Система
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Версия: {health.version || '1.2.0'}</span>
              <span>Uptime: {formatUptime(health.uptime)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
