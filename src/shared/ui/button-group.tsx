// AlignUI ButtonGroup v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const BUTTON_GROUP_ROOT_NAME = 'ButtonGroupRoot';
const BUTTON_GROUP_ITEM_NAME = 'ButtonGroupItem';
const BUTTON_GROUP_ICON_NAME = 'ButtonGroupIcon';

type ButtonGroupSize = 'small' | 'xsmall' | 'xxsmall';

const sizeStyles: Record<ButtonGroupSize, { item: string; icon: string }> = {
  small: {
    item: 'h-9 gap-4 px-4 text-sm font-medium first:rounded-l-lg last:rounded-r-lg',
    icon: '-mx-2 size-5',
  },
  xsmall: {
    item: 'h-8 gap-3.5 px-3.5 text-sm font-medium first:rounded-l-lg last:rounded-r-lg',
    icon: '-mx-2 size-5',
  },
  xxsmall: {
    item: 'h-6 gap-3 px-3 text-xs font-medium first:rounded-l-md last:rounded-r-md',
    icon: '-mx-2 size-4',
  },
};

type ButtonGroupSharedProps = {
  size?: ButtonGroupSize;
};

type ButtonGroupRootProps = ButtonGroupSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
  };

const ButtonGroupRoot = React.forwardRef<HTMLDivElement, ButtonGroupRootProps>(
  ({ asChild, children, className, size = 'small', ...rest }, forwardedRef) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'div';

    const sharedProps: ButtonGroupSharedProps = {
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [BUTTON_GROUP_ITEM_NAME, BUTTON_GROUP_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn('flex -space-x-[1.5px]', className)}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
ButtonGroupRoot.displayName = BUTTON_GROUP_ROOT_NAME;

type ButtonGroupItemProps = ButtonGroupSharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const ButtonGroupItem = React.forwardRef<
  HTMLButtonElement,
  ButtonGroupItemProps
>(({ children, className, size = 'small', asChild, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        'group relative flex items-center justify-center whitespace-nowrap bg-bg-white-0 text-center text-text-sub-600 outline-none',
        'border border-stroke-soft-200',
        'transition duration-200 ease-out',
        'hover:bg-bg-weak-50',
        'focus:bg-bg-weak-50 focus:outline-none',
        'data-[state=on]:bg-bg-weak-50',
        'data-[state=on]:text-text-strong-950',
        'disabled:pointer-events-none disabled:bg-bg-weak-50',
        'disabled:text-text-disabled-300',
        sizeStyles[size].item,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
});
ButtonGroupItem.displayName = BUTTON_GROUP_ITEM_NAME;

function ButtonGroupIcon<T extends React.ElementType>({
  className,
  size = 'small',
  as,
  ...rest
}: PolymorphicComponentProps<T, ButtonGroupSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn('shrink-0', sizeStyles[size].icon, className)}
      {...rest}
    />
  );
}
ButtonGroupIcon.displayName = BUTTON_GROUP_ICON_NAME;

export {
  ButtonGroupRoot as Root,
  ButtonGroupItem as Item,
  ButtonGroupIcon as Icon,
};
