import Link from 'next/link';
import { RiArrowLeftSLine } from '@remixicon/react';

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
          <Link
            href={backHref}
            className='flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#6B7280]'
          >
            <RiArrowLeftSLine className='size-5' />
          </Link>
        )}
        <div>
          <h1 className='text-[24px] font-bold leading-tight text-[#111827]'>
            {title}
          </h1>
          <p className='mt-1 text-[14px] text-[#6B7280]'>
            {description}
          </p>
        </div>
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  );
}
