// AlignUI AvatarGroup v0.0.0 - Tailwind v4

import * as React from 'react';

import { cn } from '@/shared/lib/cn';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

import { AVATAR_ROOT_NAME } from './avatar';

const AVATAR_GROUP_ROOT_NAME = 'AvatarGroupRoot';
const AVATAR_GROUP_OVERFLOW_NAME = 'AvatarGroupOverflow';

type AvatarGroupSize = '80' | '72' | '64' | '56' | '48' | '40' | '32' | '24' | '20';

const sizeStyles: Record<AvatarGroupSize, { root: string; overflow: string }> = {
  '80': { root: '-space-x-4', overflow: 'size-20 text-xl font-semibold' },
  '72': { root: '-space-x-4', overflow: 'size-[72px] text-xl font-semibold' },
  '64': { root: '-space-x-4', overflow: 'size-16 text-xl font-semibold' },
  '56': { root: '-space-x-4', overflow: 'size-14 text-xl font-semibold' },
  '48': { root: '-space-x-3', overflow: 'size-12 text-lg font-semibold' },
  '40': { root: '-space-x-3', overflow: 'size-10 text-base font-medium' },
  '32': { root: '-space-x-1.5', overflow: 'size-8 text-sm font-medium' },
  '24': { root: '-space-x-1', overflow: 'size-6 text-xs font-medium' },
  '20': { root: '-space-x-1', overflow: 'size-5 text-[10px] font-semibold uppercase tracking-wider' },
};

type AvatarGroupSharedProps = {
  size?: AvatarGroupSize;
};

type AvatarGroupRootProps = AvatarGroupSharedProps &
  React.HTMLAttributes<HTMLDivElement>;

function AvatarGroupRoot({
  children,
  size = '80',
  className,
  ...rest
}: AvatarGroupRootProps) {
  const uniqueId = React.useId();

  const sharedProps: AvatarGroupSharedProps = {
    size,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [AVATAR_ROOT_NAME, AVATAR_GROUP_OVERFLOW_NAME],
    uniqueId
  );

  return (
    <div
      className={cn(
        'flex *:ring-2 *:ring-white',
        sizeStyles[size].root,
        className
      )}
      {...rest}
    >
      {extendedChildren}
    </div>
  );
}
AvatarGroupRoot.displayName = AVATAR_GROUP_ROOT_NAME;

function AvatarGroupOverflow({
  children,
  size = '80',
  className,
  ...rest
}: AvatarGroupSharedProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-center text-text-sub-600',
        sizeStyles[size].overflow,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
AvatarGroupOverflow.displayName = AVATAR_GROUP_OVERFLOW_NAME;

export { AvatarGroupRoot as Root, AvatarGroupOverflow as Overflow };
