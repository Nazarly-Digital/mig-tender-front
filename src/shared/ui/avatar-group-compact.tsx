// AlignUI AvatarGroupCompact v0.0.0 - Tailwind v4

import * as React from 'react';

import { cn } from '@/shared/lib/cn';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';
import { AVATAR_ROOT_NAME } from '@/shared/ui/avatar';

const AVATAR_GROUP_COMPACT_ROOT_NAME = 'AvatarGroupCompactRoot';
const AVATAR_GROUP_COMPACT_STACK_NAME = 'AvatarGroupCompactStack';
const AVATAR_GROUP_COMPACT_OVERFLOW_NAME = 'AvatarGroupCompactOverflow';

type AvatarGroupCompactSize = '40' | '32' | '24';
type AvatarGroupCompactVariant = 'default' | 'stroke';

const overflowSizeStyles: Record<AvatarGroupCompactSize, string> = {
  '40': 'px-2.5 text-base',
  '32': 'px-2 text-sm',
  '24': 'px-1.5 text-xs',
};

type AvatarGroupCompactSharedProps = {
  size?: AvatarGroupCompactSize;
  variant?: AvatarGroupCompactVariant;
};

type AvatarGroupCompactRootProps = AvatarGroupCompactSharedProps &
  React.HTMLAttributes<HTMLDivElement>;

function AvatarGroupCompactRoot({
  children,
  size = '40',
  variant = 'default',
  className,
  ...rest
}: AvatarGroupCompactRootProps) {
  const uniqueId = React.useId();

  const sharedProps: AvatarGroupCompactSharedProps = {
    size,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [AVATAR_ROOT_NAME, AVATAR_GROUP_COMPACT_OVERFLOW_NAME],
    uniqueId
  );

  return (
    <div
      className={cn(
        'flex w-max items-center rounded-full bg-bg-white-0 p-0.5 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)]',
        variant === 'stroke' && 'ring-1 ring-stroke-soft-200',
        className
      )}
      {...rest}
    >
      {extendedChildren}
    </div>
  );
}
AvatarGroupCompactRoot.displayName = AVATAR_GROUP_COMPACT_ROOT_NAME;

function AvatarGroupCompactStack({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex -space-x-0.5 *:ring-2 *:ring-white',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
AvatarGroupCompactStack.displayName = AVATAR_GROUP_COMPACT_STACK_NAME;

function AvatarGroupCompactOverflow({
  children,
  size = '40',
  className,
  ...rest
}: AvatarGroupCompactSharedProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'text-text-sub-600',
        overflowSizeStyles[size],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
AvatarGroupCompactOverflow.displayName = AVATAR_GROUP_COMPACT_OVERFLOW_NAME;

export {
  AvatarGroupCompactRoot as Root,
  AvatarGroupCompactStack as Stack,
  AvatarGroupCompactOverflow as Overflow,
};
