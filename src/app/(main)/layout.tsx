'use client';

import { useEffect, useState } from 'react';
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
  const [isInited, setIsInited] = useState(false);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);


  useEffect(() => {
    if (!isInited) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, isInited]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsInited(true)
  }, []);

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
