// AlignUI FancyButton v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';

const FANCY_BUTTON_ROOT_NAME = 'FancyButtonRoot';
const FANCY_BUTTON_ICON_NAME = 'FancyButtonIcon';

type FancyButtonVariant = 'neutral' | 'primary' | 'destructive' | 'basic';
type FancyButtonSize = 'medium' | 'small' | 'xsmall';

type FancyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: FancyButtonVariant;
  size?: FancyButtonSize;
};

const variantStyles: Record<FancyButtonVariant, string> = {
  neutral: 'bg-bg-strong-950 text-text-white-0 shadow-[0_1px_2px_0_rgba(27,28,29,0.48),0_0_0_1px_#242628]',
  primary: 'bg-primary-base text-white shadow-[0_1px_2px_0_rgba(14,18,27,0.24),0_0_0_1px_var(--color-primary-base)]',
  destructive: 'bg-error-base text-white shadow-[0_1px_2px_0_rgba(14,18,27,0.24),0_0_0_1px_var(--color-error-base)]',
  basic: 'bg-bg-white-0 text-text-sub-600 shadow-[0_1px_3px_0_rgba(14,18,27,0.12),0_0_0_1px_var(--color-stroke-soft-200)] hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none',
};

const sizeStyles: Record<FancyButtonSize, string> = {
  medium: 'h-10 gap-3 rounded-[0.625rem] px-3.5',
  small: 'h-9 gap-3 rounded-lg px-3',
  xsmall: 'h-8 gap-3 rounded-lg px-2.5',
};

const FancyButtonRoot = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ asChild, children, variant = 'neutral', size = 'medium', className, ...rest }, forwardedRef) => {
    const Component = asChild ? Slot : 'button';

    const isGradientVariant = ['neutral', 'primary', 'destructive'].includes(variant);

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          // base
          'group relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium outline-none',
          'transition duration-200 ease-out',
          // focus
          'focus:outline-none',
          // disabled
          'disabled:pointer-events-none disabled:text-text-disabled-300',
          'disabled:bg-bg-weak-50 disabled:bg-none disabled:shadow-none disabled:before:hidden disabled:after:hidden',
          // variant
          variantStyles[variant],
          // size
          sizeStyles[size],
          // gradient overlay for certain variants
          isGradientVariant && [
            // before - gradient border
            'before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit]',
            'before:bg-gradient-to-b before:p-px',
            'before:from-white/[.12] before:to-transparent',
            'before:[mask-clip:content-box,border-box] before:[mask-composite:exclude] before:[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)]',
            // after - hover overlay
            'after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-to-b after:from-white after:to-transparent',
            'after:pointer-events-none after:opacity-[.16] after:transition after:duration-200 after:ease-out',
            'hover:after:opacity-[.24]',
          ],
          className,
        )}
        {...rest}
      >
        <span className="relative z-10 flex items-center gap-3">{children}</span>
      </Component>
    );
  },
);
FancyButtonRoot.displayName = FANCY_BUTTON_ROOT_NAME;

type FancyButtonIconProps = {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
};

function FancyButtonIcon({ className, as, ...rest }: FancyButtonIconProps) {
  const Component = as || 'div';
  return <Component className={cn('relative z-10 size-5 shrink-0 -mx-1', className)} {...rest} />;
}
FancyButtonIcon.displayName = FANCY_BUTTON_ICON_NAME;

export { FancyButtonRoot as Root, FancyButtonIcon as Icon };
