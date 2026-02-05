// AlignUI HorizontalStepper v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { RiArrowRightSLine } from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const HORIZONTAL_STEPPER_ROOT_NAME = 'HorizontalStepperRoot';
const HORIZONTAL_STEPPER_SEPARATOR_NAME = 'HorizontalStepperSeparator';
const HORIZONTAL_STEPPER_ITEM_NAME = 'HorizontalStepperItem';
const HORIZONTAL_STEPPER_ITEM_INDICATOR_NAME = 'HorizontalStepperItemIndicator';

type StepperState = 'completed' | 'active' | 'default';

const stateStyles: Record<StepperState, { root: string; indicator: string }> = {
  completed: {
    root: 'text-text-strong-950',
    indicator: 'bg-success-base text-white',
  },
  active: {
    root: 'text-text-strong-950',
    indicator: 'bg-primary-base text-white',
  },
  default: {
    root: 'text-text-sub-600',
    indicator: 'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
  },
};

function HorizontalStepperRoot({
  asChild,
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
}) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component
      className={cn('flex flex-wrap justify-center gap-4', className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
HorizontalStepperRoot.displayName = HORIZONTAL_STEPPER_ROOT_NAME;

function HorizontalStepperSeparatorIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || RiArrowRightSLine;

  return (
    <Component
      className={cn('size-5 shrink-0 text-text-soft-400', className)}
      {...rest}
    />
  );
}
HorizontalStepperSeparatorIcon.displayName = HORIZONTAL_STEPPER_SEPARATOR_NAME;

type HorizontalStepperItemSharedProps = {
  state?: StepperState;
};

type HorizontalStepperItemProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    HorizontalStepperItemSharedProps & {
      asChild?: boolean;
    };

const HorizontalStepperItem = React.forwardRef<
  HTMLButtonElement,
  HorizontalStepperItemProps
>(({ asChild, children, state = 'default', className, ...rest }, forwardedRef) => {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : 'button';

  const sharedProps: HorizontalStepperItemSharedProps = {
    state,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [HORIZONTAL_STEPPER_ITEM_INDICATOR_NAME],
    uniqueId,
    asChild
  );

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        'flex items-center gap-2 text-sm',
        stateStyles[state].root,
        className
      )}
      {...rest}
    >
      {extendedChildren}
    </Component>
  );
});
HorizontalStepperItem.displayName = HORIZONTAL_STEPPER_ITEM_NAME;

function HorizontalStepperItemIndicator({
  state = 'default',
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & HorizontalStepperItemSharedProps) {
  if (state === 'completed') {
    return (
      <div
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium',
          stateStyles[state].indicator,
          className
        )}
        {...rest}
      >
        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
          <path
            fill="currentColor"
            d="M15.1 7.453 8.726 13.82 4.9 10l1.275-1.274 2.55 2.548 5.1-5.094L15.1 7.453Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium',
        stateStyles[state].indicator,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
HorizontalStepperItemIndicator.displayName =
  HORIZONTAL_STEPPER_ITEM_INDICATOR_NAME;

export {
  HorizontalStepperRoot as Root,
  HorizontalStepperSeparatorIcon as SeparatorIcon,
  HorizontalStepperItem as Item,
  HorizontalStepperItemIndicator as ItemIndicator,
};
