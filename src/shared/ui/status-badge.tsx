// AlignUI StatusBadge v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const STATUS_BADGE_ROOT_NAME = 'StatusBadgeRoot';
const STATUS_BADGE_ICON_NAME = 'StatusBadgeIcon';
const STATUS_BADGE_DOT_NAME = 'StatusBadgeDot';

type StatusBadgeVariant = 'stroke' | 'light';
type StatusBadgeStatus = 'completed' | 'pending' | 'failed' | 'disabled';

const statusColors: Record<StatusBadgeStatus, string> = {
  completed: 'text-success-base',
  pending: 'text-warning-base',
  failed: 'text-error-base',
  disabled: 'text-faded-base',
};

const variantStatusStyles: Record<StatusBadgeVariant, Record<StatusBadgeStatus, string>> = {
  stroke: {
    completed: 'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
    pending: 'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
    failed: 'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
    disabled: 'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
  },
  light: {
    completed: 'bg-success-lighter text-success-base',
    pending: 'bg-warning-lighter text-warning-base',
    failed: 'bg-error-lighter text-error-base',
    disabled: 'bg-faded-lighter text-text-sub-600',
  },
};

type StatusBadgeSharedProps = {
  variant?: StatusBadgeVariant;
  status?: StatusBadgeStatus;
};

type StatusBadgeRootProps = React.HTMLAttributes<HTMLDivElement> &
  StatusBadgeSharedProps & {
    asChild?: boolean;
  };

const StatusBadgeRoot = React.forwardRef<HTMLDivElement, StatusBadgeRootProps>(
  (
    {
      asChild,
      children,
      variant = 'stroke',
      status = 'disabled',
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'div';

    const sharedProps: StatusBadgeSharedProps = {
      variant,
      status,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [STATUS_BADGE_ICON_NAME, STATUS_BADGE_DOT_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'inline-flex h-6 items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 text-xs font-medium',
          'has-[>.dot]:gap-1.5',
          variantStatusStyles[variant][status],
          className
        )}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
StatusBadgeRoot.displayName = STATUS_BADGE_ROOT_NAME;

function StatusBadgeIcon<T extends React.ElementType = 'div'>({
  status = 'disabled',
  className,
  as,
}: PolymorphicComponentProps<T, StatusBadgeSharedProps>) {
  const Component = as || 'div';

  return (
    <Component className={cn('-mx-1 size-4', statusColors[status], className)} />
  );
}
StatusBadgeIcon.displayName = STATUS_BADGE_ICON_NAME;

function StatusBadgeDot({
  status = 'disabled',
  className,
  ...rest
}: StatusBadgeSharedProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'dot -mx-1 flex size-4 items-center justify-center',
        'before:size-1.5 before:rounded-full before:bg-current',
        statusColors[status],
        className
      )}
      {...rest}
    />
  );
}
StatusBadgeDot.displayName = STATUS_BADGE_DOT_NAME;

export {
  StatusBadgeRoot as Root,
  StatusBadgeIcon as Icon,
  StatusBadgeDot as Dot,
};
