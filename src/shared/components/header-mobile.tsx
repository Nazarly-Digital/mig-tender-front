'use client';

import Image from 'next/image';
import Link from 'next/link';

import NotificationButton from '@/shared/components/notification-button';
import { SearchMenuButton } from '@/shared/components/search';
import MobileMenu from '@/app/(main)/mobile-menu';

export default function HeaderMobile() {
  return (
    <div className='flex h-[60px] w-full items-center justify-between border-b border-stroke-soft-200 px-4 lg:hidden'>
      <Link href='/dashboard' className='shrink-0'>
        <Image src='/images/logo.svg' alt='MIG Tender' width={120} height={36} className='h-9 w-auto' />
      </Link>

      <div className='flex gap-3'>
        <SearchMenuButton />

        <NotificationButton />

        <div className='flex w-1 shrink-0 items-center before:h-full before:w-px before:bg-stroke-soft-200' />

        <MobileMenu />
      </div>
    </div>
  );
}
