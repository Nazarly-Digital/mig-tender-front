// AlignUI LinkButton v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const LINK_BUTTON_ROOT_NAME = 'LinkButtonRoot';
const LINK_BUTTON_ICON_NAME = 'LinkButtonIcon';

type LinkButtonVariant = 'gray' | 'black' | 'primary' | 'error' | 'modifiable';
type LinkButtonSize = 'medium' | 'small';

const variantStyles: Record<LinkButtonVariant, string> = {
  gray: 'text-text-sub-600 focus-visible:text-text-strong-950',
  black: 'text-text-strong-950',
  primary: 'text-primary-base hover:text-primary-darker',
  error: 'text-error-base hover:text-red-700',
  modifiable: '',
};

const sizeStyles: Record<LinkButtonSize, { root: string; icon: string }> = {
  medium: {
    root: 'h-5 gap-1 text-sm font-medium',
    icon: 'size-5',
  },
  small: {
    root: 'h-4 gap-1 text-xs font-medium',
    icon: 'size-4',
  },
};

type LinkButtonSharedProps = {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
};

type LinkButtonProps = LinkButtonSharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    underline?: boolean;
  };

const LinkButtonRoot = React.forwardRef<HTMLButtonElement, LinkButtonProps>(
  (
    {
      asChild,
      children,
      variant = 'gray',
      size = 'medium',
      underline,
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';

    const sharedProps: LinkButtonSharedProps = {
      variant,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [LINK_BUTTON_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'group inline-flex items-center justify-center whitespace-nowrap outline-none',
          'transition duration-200 ease-out',
          'underline decoration-transparent underline-offset-[3px]',
          'hover:decoration-current',
          'focus:outline-none focus-visible:underline',
          'disabled:pointer-events-none disabled:text-text-disabled-300 disabled:no-underline',
          variantStyles[variant],
          sizeStyles[size].root,
          underline && 'decoration-current',
          className
        )}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
LinkButtonRoot.displayName = LINK_BUTTON_ROOT_NAME;

function LinkButtonIcon<T extends React.ElementType>({
  className,
  size = 'medium',
  as,
  ...rest
}: PolymorphicComponentProps<T, LinkButtonSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn('shrink-0', sizeStyles[size].icon, className)}
      {...rest}
    />
  );
}
LinkButtonIcon.displayName = LINK_BUTTON_ICON_NAME;

export { LinkButtonRoot as Root, LinkButtonIcon as Icon };
