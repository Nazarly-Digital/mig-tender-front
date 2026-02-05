// AlignUI Alert v0.0.0 - Tailwind v4

import * as React from 'react';
import { RiCloseLine } from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const ALERT_ROOT_NAME = 'AlertRoot';
const ALERT_ICON_NAME = 'AlertIcon';
const ALERT_CLOSE_ICON_NAME = 'AlertCloseIcon';

type AlertVariant = 'filled' | 'light' | 'lighter' | 'stroke';
type AlertStatus = 'error' | 'warning' | 'success' | 'information' | 'feature';
type AlertSize = 'xsmall' | 'small' | 'large';

const sizeStyles: Record<AlertSize, { root: string; wrapper: string; icon: string; closeIcon: string }> = {
  xsmall: {
    root: 'rounded-lg p-2 text-xs',
    wrapper: 'gap-2',
    icon: 'size-4',
    closeIcon: 'size-4',
  },
  small: {
    root: 'rounded-lg px-2.5 py-2 text-sm',
    wrapper: 'gap-2',
    icon: 'size-5',
    closeIcon: 'size-5',
  },
  large: {
    root: 'rounded-xl p-3.5 pb-4 text-sm',
    wrapper: 'items-start gap-3',
    icon: 'size-5',
    closeIcon: 'size-5',
  },
};

const variantStatusStyles: Record<AlertVariant, Record<AlertStatus, { root: string; icon: string }>> = {
  filled: {
    error: { root: 'bg-error-base text-white', icon: '' },
    warning: { root: 'bg-warning-base text-white', icon: '' },
    success: { root: 'bg-success-base text-white', icon: '' },
    information: { root: 'bg-information-base text-white', icon: '' },
    feature: { root: 'bg-faded-base text-white', icon: '' },
  },
  light: {
    error: { root: 'bg-error-light text-text-strong-950', icon: 'text-error-base' },
    warning: { root: 'bg-warning-light text-text-strong-950', icon: 'text-warning-base' },
    success: { root: 'bg-success-light text-text-strong-950', icon: 'text-success-base' },
    information: { root: 'bg-information-light text-text-strong-950', icon: 'text-information-base' },
    feature: { root: 'bg-faded-light text-text-strong-950', icon: 'text-faded-base' },
  },
  lighter: {
    error: { root: 'bg-error-lighter text-text-strong-950', icon: 'text-error-base' },
    warning: { root: 'bg-warning-lighter text-text-strong-950', icon: 'text-warning-base' },
    success: { root: 'bg-success-lighter text-text-strong-950', icon: 'text-success-base' },
    information: { root: 'bg-information-lighter text-text-strong-950', icon: 'text-information-base' },
    feature: { root: 'bg-faded-lighter text-text-strong-950', icon: 'text-faded-base' },
  },
  stroke: {
    error: { root: 'bg-bg-white-0 text-text-strong-950 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200', icon: 'text-error-base' },
    warning: { root: 'bg-bg-white-0 text-text-strong-950 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200', icon: 'text-warning-base' },
    success: { root: 'bg-bg-white-0 text-text-strong-950 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200', icon: 'text-success-base' },
    information: { root: 'bg-bg-white-0 text-text-strong-950 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200', icon: 'text-information-base' },
    feature: { root: 'bg-bg-white-0 text-text-strong-950 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200', icon: 'text-faded-base' },
  },
};

const closeIconVariantStyles: Record<AlertVariant, string> = {
  filled: 'text-white opacity-[.72]',
  light: 'text-text-strong-950 opacity-40',
  lighter: 'text-text-strong-950 opacity-40',
  stroke: 'text-text-strong-950 opacity-40',
};

type AlertSharedProps = {
  size?: AlertSize;
  variant?: AlertVariant;
  status?: AlertStatus;
};

export type AlertProps = AlertSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    wrapperClassName?: string;
  };

const AlertRoot = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      children,
      className,
      wrapperClassName,
      size = 'small',
      variant = 'filled',
      status = 'information',
      ...rest
    },
    forwardedRef
  ) => {
    const uniqueId = React.useId();

    const sharedProps: AlertSharedProps = {
      size,
      variant,
      status,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [ALERT_ICON_NAME, ALERT_CLOSE_ICON_NAME],
      uniqueId
    );

    return (
      <div
        ref={forwardedRef}
        className={cn(
          'w-full',
          sizeStyles[size].root,
          variantStatusStyles[variant][status].root,
          className
        )}
        {...rest}
      >
        <div
          className={cn(
            'grid w-full auto-cols-auto grid-flow-col grid-cols-1 items-start has-[>svg:first-child]:grid-cols-[auto,minmax(0,1fr)]',
            'transition duration-200 ease-out group-data-[expanded=false]/toast:group-data-[front=false]/toast:opacity-0',
            sizeStyles[size].wrapper,
            wrapperClassName
          )}
        >
          {extendedChildren}
        </div>
      </div>
    );
  }
);
AlertRoot.displayName = ALERT_ROOT_NAME;

function AlertIcon<T extends React.ElementType>({
  size = 'small',
  variant = 'filled',
  status = 'information',
  className,
  as,
}: PolymorphicComponentProps<T, AlertSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        'shrink-0',
        sizeStyles[size].icon,
        variantStatusStyles[variant][status].icon,
        className
      )}
    />
  );
}
AlertIcon.displayName = ALERT_ICON_NAME;

function AlertCloseIcon<T extends React.ElementType>({
  size = 'small',
  variant = 'filled',
  className,
  as,
}: PolymorphicComponentProps<T, AlertSharedProps>) {
  const Component = as || RiCloseLine;

  return (
    <Component
      className={cn(
        sizeStyles[size].closeIcon,
        closeIconVariantStyles[variant],
        className
      )}
    />
  );
}
AlertCloseIcon.displayName = ALERT_CLOSE_ICON_NAME;

export { AlertRoot as Root, AlertIcon as Icon, AlertCloseIcon as CloseIcon };
