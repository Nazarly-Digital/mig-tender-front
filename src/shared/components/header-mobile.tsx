'use client';

import Image from 'next/image';
import Link from 'next/link';

import MobileMenu from '@/app/(main)/mobile-menu';

export default function HeaderMobile() {
  return (
    <div className='flex h-[56px] w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 lg:hidden'>
      <Link href='/dashboard' className='shrink-0'>
        <Image src='/images/logo.svg' alt='MIG Tender' width={120} height={36} className='h-9 w-auto' />
      </Link>

      <MobileMenu />
    </div>
  );
}
