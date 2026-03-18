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
        'flex min-h-[60px] flex-col gap-4 border-b border-gray-200 bg-white px-6 py-3 md:flex-row md:items-center md:justify-between md:gap-3 lg:px-8',
        className,
      )}
      {...rest}
    >
      <div className='flex flex-1 gap-4 lg:gap-3.5'>
        {icon}
        <div className='space-y-0.5'>
          <div className='text-lg font-semibold text-gray-900'>{title}</div>
          <div className='text-sm text-gray-500'>
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
