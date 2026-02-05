// AlignUI Pagination v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const PAGINATION_ROOT_NAME = 'PaginationRoot';
const PAGINATION_ITEM_NAME = 'PaginationItem';
const PAGINATION_NAV_BUTTON_NAME = 'PaginationNavButton';
const PAGINATION_NAV_ICON_NAME = 'PaginationNavIcon';

type PaginationVariant = 'basic' | 'rounded' | 'group';

const variantStyles: Record<PaginationVariant, { root: string; item: string; navButton: string }> = {
  basic: {
    root: 'gap-2',
    item: 'h-8 min-w-8 rounded-lg px-1.5 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-transparent',
    navButton: 'size-8 rounded-lg hover:bg-bg-weak-50',
  },
  rounded: {
    root: 'gap-2',
    item: 'h-8 min-w-8 rounded-full px-1.5 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-transparent',
    navButton: 'size-8 rounded-full hover:bg-bg-weak-50',
  },
  group: {
    root: 'divide-x divide-stroke-soft-200 overflow-hidden rounded-lg border border-stroke-soft-200',
    item: 'h-8 min-w-10 px-1.5 hover:bg-bg-weak-50',
    navButton: 'h-8 w-10 px-1.5 hover:bg-bg-weak-50',
  },
};

type PaginationSharedProps = {
  variant?: PaginationVariant;
};

type PaginationRootProps = React.HTMLAttributes<HTMLDivElement> &
  PaginationSharedProps & {
    asChild?: boolean;
  };

function PaginationRoot({
  asChild,
  children,
  className,
  variant = 'basic',
  ...rest
}: PaginationRootProps) {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : 'div';

  const sharedProps: PaginationSharedProps = {
    variant,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [
      PAGINATION_ITEM_NAME,
      PAGINATION_NAV_BUTTON_NAME,
      PAGINATION_NAV_ICON_NAME,
    ],
    uniqueId,
    asChild
  );

  return (
    <Component
      className={cn(
        'flex flex-wrap items-center justify-center',
        variantStyles[variant].root,
        className
      )}
      {...rest}
    >
      {extendedChildren}
    </Component>
  );
}
PaginationRoot.displayName = PAGINATION_ROOT_NAME;

type PaginationItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  PaginationSharedProps & {
    asChild?: boolean;
    current?: boolean;
  };

const PaginationItem = React.forwardRef<HTMLButtonElement, PaginationItemProps>(
  (
    { asChild, children, className, variant = 'basic', current, ...rest },
    forwardedRef
  ) => {
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'flex items-center justify-center text-center text-sm font-medium text-text-sub-600 transition duration-200 ease-out',
          variantStyles[variant].item,
          current && 'text-text-strong-950',
          className
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
PaginationItem.displayName = PAGINATION_ITEM_NAME;

type PaginationNavButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  PaginationSharedProps & {
    asChild?: boolean;
  };

const PaginationNavButton = React.forwardRef<
  HTMLButtonElement,
  PaginationNavButtonProps
>(({ asChild, children, className, variant = 'basic', ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        'flex items-center justify-center text-text-sub-600 transition duration-200 ease-out',
        variantStyles[variant].navButton,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
});
PaginationNavButton.displayName = PAGINATION_NAV_BUTTON_NAME;

function PaginationNavIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T, PaginationSharedProps>) {
  const Component = as || 'div';

  return <Component className={cn('size-5', className)} {...rest} />;
}
PaginationNavIcon.displayName = PAGINATION_NAV_ICON_NAME;

export {
  PaginationRoot as Root,
  PaginationItem as Item,
  PaginationNavButton as NavButton,
  PaginationNavIcon as NavIcon,
};
