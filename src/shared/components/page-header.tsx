import Link from 'next/link';
import { RiArrowLeftLine } from '@remixicon/react';

import * as CompactButton from '@/shared/ui/compact-button';

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: React.ElementType;
  backHref?: string;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <div className='flex items-center gap-3'>
        {/* {backHref && (
          <Link href={backHref}>
            <CompactButton.Root variant='stroke' size='medium'>
              <CompactButton.Icon as={RiArrowLeftLine} />
            </CompactButton.Root>
          </Link>
        )}
        {Icon && !backHref && (
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <Icon className='size-5 text-text-sub-600' />
          </div>
        )} */}
        <div>
          <div className='text-label-xl font-semibold text-text-strong-950'>
            {title}
          </div>
          <div className='mt-1 text-paragraph-sm text-text-sub-600'>
            {description}
          </div>
        </div>
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  );
}
