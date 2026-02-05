// AlignUI Avatar v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';
import {
  IconEmptyCompany,
  IconEmptyUser,
} from '@/shared/ui/avatar-empty-icons';

export const AVATAR_ROOT_NAME = 'AvatarRoot';
const AVATAR_IMAGE_NAME = 'AvatarImage';
const AVATAR_INDICATOR_NAME = 'AvatarIndicator';
const AVATAR_STATUS_NAME = 'AvatarStatus';
const AVATAR_BRAND_LOGO_NAME = 'AvatarBrandLogo';
const AVATAR_NOTIFICATION_NAME = 'AvatarNotification';

type AvatarSize = '80' | '72' | '64' | '56' | '48' | '40' | '32' | '24' | '20';
type AvatarColor = 'gray' | 'yellow' | 'blue' | 'sky' | 'purple' | 'red';

const sizeStyles: Record<AvatarSize, { root: string; indicator: string }> = {
  '80': { root: 'size-20 text-lg font-semibold', indicator: '-right-2' },
  '72': { root: 'size-[72px] text-lg font-semibold', indicator: '-right-2' },
  '64': { root: 'size-16 text-lg font-semibold', indicator: '-right-2 scale-[.875]' },
  '56': { root: 'size-14 text-base font-medium', indicator: '-right-1.5 scale-75' },
  '48': { root: 'size-12 text-base font-medium', indicator: '-right-1.5 scale-[.625]' },
  '40': { root: 'size-10 text-sm font-medium', indicator: '-right-1.5 scale-[.5625]' },
  '32': { root: 'size-8 text-sm font-medium', indicator: '-right-1.5 scale-50' },
  '24': { root: 'size-6 text-xs font-medium', indicator: '-right-1 scale-[.375]' },
  '20': { root: 'size-5 text-xs font-medium', indicator: '-right-1 scale-[.3125]' },
};

const colorStyles: Record<AvatarColor, string> = {
  gray: 'bg-bg-soft-200 text-black',
  yellow: 'bg-yellow-200 text-yellow-950',
  blue: 'bg-blue-200 text-blue-950',
  sky: 'bg-sky-200 text-sky-950',
  purple: 'bg-purple-200 text-purple-950',
  red: 'bg-red-200 text-red-950',
};

type AvatarSharedProps = {
  size?: AvatarSize;
  color?: AvatarColor;
};

export type AvatarRootProps = AvatarSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
    placeholderType?: 'user' | 'company';
  };

const AvatarRoot = React.forwardRef<HTMLDivElement, AvatarRootProps>(
  (
    {
      asChild,
      children,
      size = '80',
      color = 'gray',
      className,
      placeholderType = 'user',
      ...rest
    },
    forwardedRef
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'div';

    const sharedProps: AvatarSharedProps = {
      size,
      color,
    };

    // use placeholder icon if no children provided
    if (!children) {
      return (
        <div
          className={cn(
            'relative flex shrink-0 items-center justify-center rounded-full select-none text-center uppercase',
            sizeStyles[size].root,
            colorStyles[color],
            className
          )}
          {...rest}
        >
          <AvatarImage asChild>
            {placeholderType === 'company' ? (
              <IconEmptyCompany />
            ) : (
              <IconEmptyUser />
            )}
          </AvatarImage>
        </div>
      );
    }

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [AVATAR_IMAGE_NAME, AVATAR_INDICATOR_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-full select-none text-center uppercase',
          sizeStyles[size].root,
          colorStyles[color],
          className
        )}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
AvatarRoot.displayName = AVATAR_ROOT_NAME;

type AvatarImageProps = AvatarSharedProps &
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'color'> & {
    asChild?: boolean;
  };

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ asChild, className, ...rest }, forwardedRef) => {
    const Component = asChild ? Slot : 'img';

    return (
      <Component
        ref={forwardedRef}
        className={cn('size-full rounded-full object-cover', className)}
        {...rest}
      />
    );
  }
);
AvatarImage.displayName = AVATAR_IMAGE_NAME;

function AvatarIndicator({
  size = '80',
  className,
  position = 'bottom',
  ...rest
}: AvatarSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    position?: 'top' | 'bottom';
  }) {
  return (
    <div
      className={cn(
        'absolute flex size-8 items-center justify-center drop-shadow-[0_2px_4px_#1b1c1d0a]',
        sizeStyles[size].indicator,
        position === 'top' && 'top-0 origin-top-right',
        position === 'bottom' && 'bottom-0 origin-bottom-right',
        className
      )}
      {...rest}
    />
  );
}
AvatarIndicator.displayName = AVATAR_INDICATOR_NAME;

type AvatarStatusProps = React.HTMLAttributes<HTMLDivElement> & {
  status?: 'online' | 'offline' | 'busy' | 'away';
};

const statusStyles: Record<string, string> = {
  online: 'bg-success-base',
  offline: 'bg-faded-base',
  busy: 'bg-error-base',
  away: 'bg-away-base',
};

function AvatarStatus({
  status = 'online',
  className,
  ...rest
}: AvatarStatusProps) {
  return (
    <div
      className={cn(
        'box-content size-3 rounded-full border-4 border-bg-white-0',
        statusStyles[status],
        className
      )}
      {...rest}
    />
  );
}
AvatarStatus.displayName = AVATAR_STATUS_NAME;

type AvatarBrandLogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  asChild?: boolean;
};

const AvatarBrandLogo = React.forwardRef<
  HTMLImageElement,
  AvatarBrandLogoProps
>(({ asChild, className, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : 'img';

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        'box-content size-6 rounded-full border-2 border-bg-white-0',
        className
      )}
      {...rest}
    />
  );
});
AvatarBrandLogo.displayName = AVATAR_BRAND_LOGO_NAME;

function AvatarNotification({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'box-content size-3 rounded-full border-2 border-bg-white-0 bg-error-base',
        className
      )}
      {...rest}
    />
  );
}
AvatarNotification.displayName = AVATAR_NOTIFICATION_NAME;

export {
  AvatarRoot as Root,
  AvatarImage as Image,
  AvatarIndicator as Indicator,
  AvatarStatus as Status,
  AvatarBrandLogo as BrandLogo,
  AvatarNotification as Notification,
};
