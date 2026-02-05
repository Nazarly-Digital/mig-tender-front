// AlignUI Button v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const BUTTON_ROOT_NAME = 'ButtonRoot';
const BUTTON_ICON_NAME = 'ButtonIcon';

type ButtonVariant = 'primary' | 'neutral' | 'error';
type ButtonMode = 'filled' | 'stroke' | 'lighter' | 'ghost';
type ButtonSize = 'medium' | 'small' | 'xsmall' | 'xxsmall';

const sizeStyles: Record<ButtonSize, { root: string; icon: string }> = {
  medium: {
    root: 'h-10 gap-3 rounded-[10px] px-3.5 text-sm font-medium',
    icon: '-mx-1',
  },
  small: {
    root: 'h-9 gap-3 rounded-lg px-3 text-sm font-medium',
    icon: '-mx-1',
  },
  xsmall: {
    root: 'h-8 gap-2.5 rounded-lg px-2.5 text-sm font-medium',
    icon: '-mx-1',
  },
  xxsmall: {
    root: 'h-7 gap-2.5 rounded-lg px-2 text-sm font-medium',
    icon: '-mx-1',
  },
};

const variantModeStyles: Record<ButtonVariant, Record<ButtonMode, string>> = {
  primary: {
    filled:
      'bg-primary-base text-white hover:bg-primary-darker focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-primary-alpha-24)]',
    stroke:
      'bg-bg-white-0 text-primary-base ring-1 ring-inset ring-primary-base hover:bg-primary-alpha-10 hover:ring-transparent focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-primary-alpha-24)]',
    lighter:
      'bg-primary-alpha-10 text-primary-base ring-1 ring-inset ring-transparent hover:bg-bg-white-0 hover:ring-primary-base focus-visible:bg-bg-white-0 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-primary-alpha-24)] focus-visible:ring-primary-base',
    ghost:
      'bg-transparent text-primary-base ring-1 ring-inset ring-transparent hover:bg-primary-alpha-10 focus-visible:bg-bg-white-0 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-primary-alpha-24)] focus-visible:ring-primary-base',
  },
  neutral: {
    filled:
      'bg-bg-strong-950 text-text-white-0 hover:bg-bg-surface-800 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)]',
    stroke:
      'bg-bg-white-0 text-text-sub-600 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent focus-visible:text-text-strong-950 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus-visible:ring-stroke-strong-950',
    lighter:
      'bg-bg-weak-50 text-text-sub-600 ring-1 ring-inset ring-transparent hover:bg-bg-white-0 hover:text-text-strong-950 hover:shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] hover:ring-stroke-soft-200 focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus-visible:ring-stroke-strong-950',
    ghost:
      'bg-transparent text-text-sub-600 ring-1 ring-inset ring-transparent hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus-visible:ring-stroke-strong-950',
  },
  error: {
    filled:
      'bg-error-base text-white hover:bg-red-700 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-24)]',
    stroke:
      'bg-bg-white-0 text-error-base ring-1 ring-inset ring-error-base hover:bg-red-alpha-10 hover:ring-transparent focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-24)]',
    lighter:
      'bg-red-alpha-10 text-error-base ring-1 ring-inset ring-transparent hover:bg-bg-white-0 hover:ring-error-base focus-visible:bg-bg-white-0 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-24)] focus-visible:ring-error-base',
    ghost:
      'bg-transparent text-error-base ring-1 ring-inset ring-transparent hover:bg-red-alpha-10 focus-visible:bg-bg-white-0 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-24)] focus-visible:ring-error-base',
  },
};

type ButtonSharedProps = {
  variant?: ButtonVariant;
  mode?: ButtonMode;
  size?: ButtonSize;
};

type ButtonRootProps = ButtonSharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  (
    {
      children,
      variant = 'primary',
      mode = 'filled',
      size = 'medium',
      asChild,
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';

    const sharedProps: ButtonSharedProps = {
      variant,
      mode,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [BUTTON_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'group relative inline-flex items-center justify-center whitespace-nowrap outline-none',
          'transition duration-200 ease-out',
          'focus:outline-none',
          'disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:ring-transparent',
          sizeStyles[size].root,
          variantModeStyles[variant][mode],
          className
        )}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
ButtonRoot.displayName = BUTTON_ROOT_NAME;

function ButtonIcon<T extends React.ElementType>({
  size = 'medium',
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, ButtonSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        'flex size-5 shrink-0 items-center justify-center',
        sizeStyles[size].icon,
        className
      )}
      {...rest}
    />
  );
}
ButtonIcon.displayName = BUTTON_ICON_NAME;

export { ButtonRoot as Root, ButtonIcon as Icon };
