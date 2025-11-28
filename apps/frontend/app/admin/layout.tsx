'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTelegramTheme } from '@/lib/telegram/useTelegram';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const { isDark } = useTelegramTheme();

  useEffect(() => {
    console.log('[AdminLayout] Auth state:', {
      isLoading,
      isAuthenticated,
      userRole: user?.role,
      userId: user?.id,
      telegramId: user?.telegramId,
    });

    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      console.log('[AdminLayout] Access denied, redirecting to home');
      router.push('/');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-blue-50'}`}>
        <div className="text-gray-600 dark:text-gray-300 font-light">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    console.log('[AdminLayout] Rendering null - not authenticated or not admin');
    return null;
  }

  console.log('[AdminLayout] Rendering admin panel for user:', user.telegramId);

  return (
    <div
      className={`min-h-screen relative transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-pink-50 via-white to-blue-50'
      }`}
    >
      {/* Sidebar - Desktop only */}
      <AdminSidebar />

      {/* Header with Safe Area */}
      <div
        className="fixed top-0 left-0 right-0 z-40 md:left-64"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <AdminHeader />
      </div>

      {/* Main Content with proper spacing */}
      <main
        className="px-4 max-w-7xl mx-auto w-full md:ml-64"
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation - Mobile only */}
      <AdminBottomNav />
    </div>
  );
}
