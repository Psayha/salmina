'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
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
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    console.log('[AdminLayout] Rendering null - not authenticated or not admin');
    return null;
  }

  console.log('[AdminLayout] Rendering admin panel for user:', user.telegramId);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <AdminHeader />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
