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
  icon: _Icon,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <RiArrowLeftSLine className="size-[18px]" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            {description}
          </p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
