// AlignUI Badge v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const BADGE_ROOT_NAME = 'BadgeRoot';
const BADGE_ICON_NAME = 'BadgeIcon';
const BADGE_DOT_NAME = 'BadgeDot';

type BadgeSize = 'small' | 'medium';
type BadgeVariant = 'filled' | 'light' | 'lighter' | 'stroke';
type BadgeColor =
  | 'gray'
  | 'blue'
  | 'orange'
  | 'red'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'sky'
  | 'pink'
  | 'teal';

const sizeStyles: Record<BadgeSize, { root: string; icon: string; dot: string }> = {
  small: {
    root: 'h-4 gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider has-[>.dot]:gap-2',
    icon: '-mx-1 size-3',
    dot: '-mx-2 size-4',
  },
  medium: {
    root: 'h-5 gap-1.5 px-2 text-xs font-medium',
    icon: '-mx-1 size-4',
    dot: '-mx-1.5 size-4',
  },
};

const variantColorStyles: Record<BadgeVariant, Record<BadgeColor, string>> = {
  filled: {
    gray: 'bg-faded-base text-white',
    blue: 'bg-information-base text-white',
    orange: 'bg-warning-base text-white',
    red: 'bg-error-base text-white',
    green: 'bg-success-base text-white',
    yellow: 'bg-away-base text-white',
    purple: 'bg-feature-base text-white',
    sky: 'bg-verified-base text-white',
    pink: 'bg-highlighted-base text-white',
    teal: 'bg-stable-base text-white',
  },
  light: {
    gray: 'bg-faded-light text-faded-dark',
    blue: 'bg-information-light text-information-dark',
    orange: 'bg-warning-light text-warning-dark',
    red: 'bg-error-light text-error-dark',
    green: 'bg-success-light text-success-dark',
    yellow: 'bg-away-light text-away-dark',
    purple: 'bg-feature-light text-feature-dark',
    sky: 'bg-verified-light text-verified-dark',
    pink: 'bg-highlighted-light text-highlighted-dark',
    teal: 'bg-stable-light text-stable-dark',
  },
  lighter: {
    gray: 'bg-faded-lighter text-faded-base',
    blue: 'bg-information-lighter text-information-base',
    orange: 'bg-warning-lighter text-warning-base',
    red: 'bg-error-lighter text-error-base',
    green: 'bg-success-lighter text-success-base',
    yellow: 'bg-away-lighter text-away-base',
    purple: 'bg-feature-lighter text-feature-base',
    sky: 'bg-verified-lighter text-verified-base',
    pink: 'bg-highlighted-lighter text-highlighted-base',
    teal: 'bg-stable-lighter text-stable-base',
  },
  stroke: {
    gray: 'text-faded-base ring-1 ring-inset ring-current',
    blue: 'text-information-base ring-1 ring-inset ring-current',
    orange: 'text-warning-base ring-1 ring-inset ring-current',
    red: 'text-error-base ring-1 ring-inset ring-current',
    green: 'text-success-base ring-1 ring-inset ring-current',
    yellow: 'text-away-base ring-1 ring-inset ring-current',
    purple: 'text-feature-base ring-1 ring-inset ring-current',
    sky: 'text-verified-base ring-1 ring-inset ring-current',
    pink: 'text-highlighted-base ring-1 ring-inset ring-current',
    teal: 'text-stable-base ring-1 ring-inset ring-current',
  },
};

type BadgeSharedProps = {
  size?: BadgeSize;
  variant?: BadgeVariant;
  color?: BadgeColor;
};

type BadgeRootProps = BadgeSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
    disabled?: boolean;
    square?: boolean;
  };

const BadgeRoot = React.forwardRef<HTMLDivElement, BadgeRootProps>(
  (
    {
      asChild,
      size = 'small',
      variant = 'filled',
      color = 'gray',
      disabled,
      square,
      children,
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'div';

    const sharedProps: BadgeSharedProps = {
      size,
      variant,
      color,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [BADGE_ICON_NAME, BADGE_DOT_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'inline-flex items-center justify-center rounded-full leading-none transition duration-200 ease-out',
          sizeStyles[size].root,
          disabled
            ? 'pointer-events-none bg-transparent text-text-disabled-300 ring-1 ring-inset ring-stroke-soft-200'
            : variantColorStyles[variant][color],
          square && (size === 'small' ? 'min-w-4 px-1' : 'min-w-5 px-1'),
          className
        )}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
BadgeRoot.displayName = BADGE_ROOT_NAME;

function BadgeIcon<T extends React.ElementType>({
  className,
  size = 'small',
  as,
  ...rest
}: PolymorphicComponentProps<T, BadgeSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn('shrink-0', sizeStyles[size].icon, className)}
      {...rest}
    />
  );
}
BadgeIcon.displayName = BADGE_ICON_NAME;

type BadgeDotProps = BadgeSharedProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>;

function BadgeDot({ size = 'small', className, ...rest }: BadgeDotProps) {
  return (
    <div
      className={cn(
        'dot flex items-center justify-center before:size-1 before:rounded-full before:bg-current',
        sizeStyles[size].dot,
        className
      )}
      {...rest}
    />
  );
}
BadgeDot.displayName = BADGE_DOT_NAME;

export { BadgeRoot as Root, BadgeIcon as Icon, BadgeDot as Dot };
