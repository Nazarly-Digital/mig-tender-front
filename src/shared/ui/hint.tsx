// AlignUI Hint v0.0.0 - Tailwind v4

import * as React from 'react';

import { cn } from '@/shared/lib/cn';
import { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const HINT_ROOT_NAME = 'HintRoot';
const HINT_ICON_NAME = 'HintIcon';

type HintSharedProps = {
  disabled?: boolean;
  hasError?: boolean;
};

type HintRootProps = HintSharedProps & React.HTMLAttributes<HTMLDivElement>;

function HintRoot({
  children,
  hasError,
  disabled,
  className,
  ...rest
}: HintRootProps) {
  const uniqueId = React.useId();

  const sharedProps: HintSharedProps = {
    hasError,
    disabled,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [HINT_ICON_NAME],
    uniqueId
  );

  return (
    <div
      className={cn(
        'group flex items-center gap-1 text-xs text-text-sub-600',
        disabled && 'text-text-disabled-300',
        hasError && 'text-error-base',
        className
      )}
      {...rest}
    >
      {extendedChildren}
    </div>
  );
}
HintRoot.displayName = HINT_ROOT_NAME;

function HintIcon<T extends React.ElementType>({
  as,
  className,
  hasError,
  disabled,
  ...rest
}: PolymorphicComponentProps<T, HintSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        'size-4 shrink-0 text-text-soft-400',
        disabled && 'text-text-disabled-300',
        hasError && 'text-error-base',
        className
      )}
      {...rest}
    />
  );
}
HintIcon.displayName = HINT_ICON_NAME;

export { HintRoot as Root, HintIcon as Icon };
