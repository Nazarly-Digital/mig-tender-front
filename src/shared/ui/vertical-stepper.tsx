// AlignUI VerticalStepper v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { RiArrowRightSLine } from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const VERTICAL_STEPPER_ROOT_NAME = 'VerticalStepperRoot';
const VERTICAL_STEPPER_ARROW_NAME = 'VerticalStepperArrow';
const VERTICAL_STEPPER_ITEM_NAME = 'VerticalStepperItem';
const VERTICAL_STEPPER_ITEM_INDICATOR_NAME = 'VerticalStepperItemIndicator';

type StepperState = 'completed' | 'active' | 'default';

const stateStyles: Record<StepperState, { root: string; indicator: string }> = {
  completed: {
    root: 'bg-bg-weak-50 text-text-sub-600',
    indicator: 'bg-success-base text-white',
  },
  active: {
    root: 'bg-bg-white-0 text-text-strong-950 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)]',
    indicator: 'bg-primary-base text-white',
  },
  default: {
    root: 'bg-bg-weak-50 text-text-sub-600',
    indicator: 'bg-bg-white-0 text-text-sub-600 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)]',
  },
};

function VerticalStepperRoot({
  asChild,
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
}) {
  const Component = asChild ? Slot : 'div';
  return (
    <Component className={cn('w-full space-y-2', className)} {...rest}>
      {children}
    </Component>
  );
}
VerticalStepperRoot.displayName = VERTICAL_STEPPER_ROOT_NAME;

function VerticalStepperArrow<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || RiArrowRightSLine;

  return (
    <Component
      className={cn('size-5 shrink-0 text-text-sub-600', className)}
      {...rest}
    />
  );
}
VerticalStepperArrow.displayName = VERTICAL_STEPPER_ARROW_NAME;

type VerticalStepperItemSharedProps = {
  state?: StepperState;
};

type VerticalStepperItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VerticalStepperItemSharedProps & {
    asChild?: boolean;
  };

const VerticalStepperItem = React.forwardRef<
  HTMLButtonElement,
  VerticalStepperItemProps
>(({ asChild, children, state = 'default', className, ...rest }, forwardedRef) => {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : 'button';

  const sharedProps: VerticalStepperItemSharedProps = {
    state,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [VERTICAL_STEPPER_ITEM_INDICATOR_NAME],
    uniqueId,
    asChild
  );

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        'grid w-full auto-cols-auto grid-flow-col grid-cols-[auto,minmax(0,1fr)] items-center gap-2.5 rounded-[10px] p-2 text-left text-sm',
        stateStyles[state].root,
        className
      )}
      {...rest}
    >
      {extendedChildren}
    </Component>
  );
});
VerticalStepperItem.displayName = VERTICAL_STEPPER_ITEM_NAME;

function VerticalStepperItemIndicator({
  state = 'default',
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & VerticalStepperItemSharedProps) {
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
VerticalStepperItemIndicator.displayName = VERTICAL_STEPPER_ITEM_INDICATOR_NAME;

export {
  VerticalStepperRoot as Root,
  VerticalStepperArrow as Arrow,
  VerticalStepperItem as Item,
  VerticalStepperItemIndicator as ItemIndicator,
};
