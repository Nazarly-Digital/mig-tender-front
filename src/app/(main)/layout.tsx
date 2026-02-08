'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import HeaderMobile from '@/shared/components/header-mobile';
import Sidebar from '@/shared/components/sidebar';
import { useSessionStore } from '@/entities/auth/model/store';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <>
      <div className='flex min-h-screen flex-col items-start lg:grid lg:grid-cols-[auto,minmax(0,1fr)]'>
        <Sidebar />
        <HeaderMobile />
        <div className='mx-auto flex w-full max-w-[1360px] flex-1 flex-col self-stretch'>
          {children}
        </div>
      </div>
    </>
  );
}
