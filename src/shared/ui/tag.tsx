// AlignUI Tag v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { RiCloseFill } from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const TAG_ROOT_NAME = 'TagRoot';
const TAG_ICON_NAME = 'TagIcon';
const TAG_DISMISS_BUTTON_NAME = 'TagDismissButton';
const TAG_DISMISS_ICON_NAME = 'TagDismissIcon';

type TagVariant = 'stroke' | 'gray';

const variantStyles: Record<TagVariant, string> = {
  stroke:
    'bg-bg-white-0 ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-transparent focus-within:bg-bg-weak-50 focus-within:ring-transparent',
  gray:
    'bg-bg-weak-50 ring-transparent hover:bg-bg-white-0 hover:ring-stroke-soft-200',
};

type TagSharedProps = {
  variant?: TagVariant;
  disabled?: boolean;
};

type TagProps = TagSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
  };

const TagRoot = React.forwardRef<HTMLDivElement, TagProps>(
  (
    { asChild, children, variant = 'stroke', disabled, className, ...rest },
    forwardedRef
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'div';

    const sharedProps: TagSharedProps = {
      variant,
      disabled,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [TAG_ICON_NAME, TAG_DISMISS_BUTTON_NAME, TAG_DISMISS_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'group/tag inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium text-text-sub-600',
          'transition duration-200 ease-out',
          'ring-1 ring-inset',
          disabled
            ? 'pointer-events-none bg-bg-weak-50 text-text-disabled-300 ring-transparent'
            : variantStyles[variant],
          className
        )}
        aria-disabled={disabled}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
TagRoot.displayName = TAG_ROOT_NAME;

function TagIcon<T extends React.ElementType>({
  className,
  disabled,
  as,
  ...rest
}: PolymorphicComponentProps<T, TagSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        '-mx-1 size-4 shrink-0 text-text-soft-400 transition duration-200 ease-out',
        'group-hover/tag:text-text-sub-600',
        disabled && 'text-text-disabled-300 [&:not(.remixicon)]:opacity-[.48]',
        className
      )}
      {...rest}
    />
  );
}
TagIcon.displayName = TAG_ICON_NAME;

type TagDismissButtonProps = TagSharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const TagDismissButton = React.forwardRef<
  HTMLButtonElement,
  TagDismissButtonProps
>(
  (
    { asChild, children, className, variant, disabled, ...rest },
    forwardedRef
  ) => {
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'group/dismiss-button -ml-1.5 -mr-1 size-4 shrink-0',
          'focus:outline-none',
          className
        )}
        {...rest}
      >
        {children ?? (
          <TagDismissIcon variant={variant} disabled={disabled} as={RiCloseFill} />
        )}
      </Component>
    );
  }
);
TagDismissButton.displayName = TAG_DISMISS_BUTTON_NAME;

function TagDismissIcon<T extends React.ElementType>({
  className,
  variant = 'stroke',
  disabled,
  as,
  ...rest
}: PolymorphicComponentProps<T, TagSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        'size-4 text-text-soft-400 transition duration-200 ease-out',
        variant === 'stroke' &&
          'group-hover/dismiss-button:text-text-sub-600 group-focus/dismiss-button:text-text-sub-600',
        disabled && 'text-text-disabled-300',
        className
      )}
      {...rest}
    />
  );
}
TagDismissIcon.displayName = TAG_DISMISS_ICON_NAME;

export {
  TagRoot as Root,
  TagIcon as Icon,
  TagDismissButton as DismissButton,
  TagDismissIcon as DismissIcon,
};
