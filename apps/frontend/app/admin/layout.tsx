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
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
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
    return null;
  }

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

      {/* Header */}
      <AdminHeader />

      {/* Main Content with proper spacing */}
      <main
        className="px-4 max-w-7xl mx-auto w-full md:ml-64"
        style={{
          paddingTop: 'calc(3.5rem + var(--safe-top, env(safe-area-inset-top)))',
          paddingBottom: 'calc(5rem + var(--safe-bottom, env(safe-area-inset-bottom)))',
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation - Mobile only */}
      <AdminBottomNav />
    </div>
  );
}
