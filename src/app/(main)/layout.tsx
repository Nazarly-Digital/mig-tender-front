'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import HeaderMobile from '@/shared/components/header-mobile';
import Sidebar from '@/shared/components/sidebar';
import { useSessionStore } from '@/entities/auth/model/store';

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Главная',
  '/auctions': 'Аукционы',
  '/auctions/create': 'Новый аукцион',
  '/catalog': 'Каталог',
  '/properties': 'Объекты',
  '/properties/create': 'Новый объект',
  '/cabinet': 'Кабинет',
  '/deals': 'Сделки',
  '/payments': 'Выплаты',
  '/analytics': 'Аналитика',
  '/documents': 'Документы',
  '/admin/users': 'Пользователи',
  '/admin/properties': 'Модерация',
};

function TopHeader() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = BREADCRUMB_MAP[currentPath] || segment;
    breadcrumbs.push({ label, path: currentPath });
  }

  return (
    <header className="hidden h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6 lg:flex">
      <nav className="flex items-center gap-1.5 text-[13px]">
        <span className="font-medium text-gray-400">MIG Tender</span>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.path} className="flex items-center gap-1.5">
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-900">
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isInited, setIsInited] = useState(false);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isInited) return;
    if (!isAuthenticated) {
      router.replace('/select-role');
    }
  }, [isAuthenticated, router, isInited]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsInited(true)
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderMobile />
        <TopHeader />
        <main className="flex flex-1 flex-col bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
