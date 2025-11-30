'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Временно деактивирована - логика каталога перенесена на главную страницу
export default function CategoryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
