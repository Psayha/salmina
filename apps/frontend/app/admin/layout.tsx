'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="text-gray-600 font-light">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    console.log('[AdminLayout] Rendering null - not authenticated or not admin');
    return null;
  }

  console.log('[AdminLayout] Rendering admin panel for user:', user.telegramId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative">
      {/* Header with Safe Area */}
      <div
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <AdminHeader />
      </div>

      {/* Main Content with proper spacing */}
      <main
        className="px-4 max-w-7xl mx-auto w-full"
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>
    </div>
  );
}
