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
        {backHref && (
          <Link href={backHref}>
            <CompactButton.Root variant='stroke' size='medium'>
              <CompactButton.Icon as={RiArrowLeftLine} />
            </CompactButton.Root>
          </Link>
        )}
        <div>
          <h1 className='text-xl font-semibold tracking-tight text-text-strong-950'>
            {title}
          </h1>
          <p className='mt-1 text-sm text-text-sub-600'>
            {description}
          </p>
        </div>
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  );
}
