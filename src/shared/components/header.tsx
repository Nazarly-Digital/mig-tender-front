'use client';

import { cnExt } from '@/shared/lib/cn';
import NotificationButton from '@/shared/components/notification-button';
import { SearchMenuButton } from '@/shared/components/search';

export default function Header({
  children,
  className,
  icon,
  title,
  description,
  contentClassName,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  contentClassName?: string;
}) {
  return (
    <header
      className={cnExt(
        'flex min-h-[72px] flex-col gap-4 bg-white border-b border-[#E5E7EB] px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-3 lg:px-8',
        className,
      )}
      {...rest}
    >
      <div className='flex flex-1 gap-4 lg:gap-3.5'>
        {icon}
        <div className='space-y-0.5'>
          <div className='text-[16px] font-semibold text-[#111827]'>{title}</div>
          <div className='text-[14px] text-[#6B7280]'>
            {description}
          </div>
        </div>
      </div>
      <div className={cnExt('flex items-center gap-3', contentClassName)}>
        <SearchMenuButton className='hidden lg:flex' />
        <NotificationButton className='hidden lg:flex' />

        {children}
      </div>
    </header>
  );
}
