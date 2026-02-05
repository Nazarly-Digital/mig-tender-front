// AlignUI CompactButton v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const COMPACT_BUTTON_ROOT_NAME = 'CompactButtonRoot';
const COMPACT_BUTTON_ICON_NAME = 'CompactButtonIcon';

type CompactButtonVariant = 'stroke' | 'ghost' | 'white' | 'modifiable';
type CompactButtonSize = 'large' | 'medium';

const variantStyles: Record<CompactButtonVariant, string> = {
  stroke:
    'border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] hover:border-transparent hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none focus-visible:border-transparent focus-visible:bg-bg-strong-950 focus-visible:text-text-white-0 focus-visible:shadow-none',
  ghost:
    'bg-transparent text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:bg-bg-strong-950 focus-visible:text-text-white-0',
  white:
    'bg-bg-white-0 text-text-sub-600 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:bg-bg-strong-950 focus-visible:text-text-white-0',
  modifiable: '',
};

const sizeStyles: Record<CompactButtonSize, { root: string; icon: string }> = {
  large: {
    root: 'size-6',
    icon: 'size-5',
  },
  medium: {
    root: 'size-5',
    icon: 'size-[18px]',
  },
};

type CompactButtonSharedProps = {
  variant?: CompactButtonVariant;
  size?: CompactButtonSize;
};

type CompactButtonProps = CompactButtonSharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    fullRadius?: boolean;
  };

const CompactButtonRoot = React.forwardRef<
  HTMLButtonElement,
  CompactButtonProps
>(
  (
    {
      asChild,
      variant = 'stroke',
      size = 'large',
      fullRadius = false,
      children,
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';

    const sharedProps: CompactButtonSharedProps = {
      variant,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [COMPACT_BUTTON_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'relative flex shrink-0 items-center justify-center outline-none',
          'transition duration-200 ease-out',
          'disabled:pointer-events-none disabled:border-transparent disabled:bg-transparent disabled:text-text-disabled-300 disabled:shadow-none',
          'focus:outline-none',
          fullRadius ? 'rounded-full' : 'rounded-md',
          sizeStyles[size].root,
          variantStyles[variant],
          className
        )}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
CompactButtonRoot.displayName = COMPACT_BUTTON_ROOT_NAME;

function CompactButtonIcon<T extends React.ElementType>({
  size = 'large',
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, CompactButtonSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(sizeStyles[size].icon, className)}
      {...rest}
    />
  );
}
CompactButtonIcon.displayName = COMPACT_BUTTON_ICON_NAME;

export { CompactButtonRoot as Root, CompactButtonIcon as Icon };
