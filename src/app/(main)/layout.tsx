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
      router.replace('/select-role');
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
        <div className='w-full min-h-screen lg:max-w-[calc(100%-272px)] flex-col self-stretch ml-auto'>
          {children}
        </div>
      </div>
    </>
  );
}
