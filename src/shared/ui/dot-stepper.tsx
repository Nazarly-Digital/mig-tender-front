// AlignUI DotStepper v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const DOT_STEPPER_ROOT_NAME = 'DotStepperRoot';
const DOT_STEPPER_ITEM_NAME = 'DotStepperItem';

type DotStepperSize = 'small' | 'xsmall';

const sizeStyles: Record<DotStepperSize, { root: string; item: string }> = {
  small: {
    root: 'gap-2.5',
    item: 'size-2',
  },
  xsmall: {
    root: 'gap-1.5',
    item: 'size-1',
  },
};

type DotStepperSharedProps = {
  size?: DotStepperSize;
};

type DotStepperRootProps = React.HTMLAttributes<HTMLDivElement> &
  DotStepperSharedProps & {
    asChild?: boolean;
  };

function DotStepperRoot({
  asChild,
  children,
  size = 'small',
  className,
  ...rest
}: DotStepperRootProps) {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : 'div';

  const sharedProps: DotStepperSharedProps = {
    size,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [DOT_STEPPER_ITEM_NAME],
    uniqueId,
    asChild
  );

  return (
    <Component
      className={cn('flex flex-wrap', sizeStyles[size].root, className)}
      {...rest}
    >
      {extendedChildren}
    </Component>
  );
}
DotStepperRoot.displayName = DOT_STEPPER_ROOT_NAME;

type DotStepperItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  DotStepperSharedProps & {
    asChild?: boolean;
    active?: boolean;
  };

const DotStepperItem = React.forwardRef<HTMLButtonElement, DotStepperItemProps>(
  ({ asChild, size = 'small', className, active, ...rest }, forwardedRef) => {
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'shrink-0 rounded-full bg-bg-soft-200 outline-none transition duration-200 ease-out',
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-stroke-strong-950',
          sizeStyles[size].item,
          active && 'bg-primary-base',
          className
        )}
        {...rest}
      />
    );
  }
);
DotStepperItem.displayName = DOT_STEPPER_ITEM_NAME;

export { DotStepperRoot as Root, DotStepperItem as Item };
