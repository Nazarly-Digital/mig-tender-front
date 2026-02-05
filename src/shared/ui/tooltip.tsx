// AlignUI Tooltip v0.0.0 - Tailwind v4

'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/shared/lib/cn';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

type TooltipSize = 'xsmall' | 'small' | 'medium';
type TooltipVariant = 'dark' | 'light';

const sizeStyles: Record<TooltipSize, { content: string; arrow: string }> = {
  xsmall: {
    content: 'rounded px-1.5 py-0.5 text-xs',
    arrow: 'rounded-bl-sm',
  },
  small: {
    content: 'rounded-md px-2.5 py-1 text-sm',
    arrow: 'rounded-bl-[3px]',
  },
  medium: {
    content: 'rounded-xl p-3 text-sm font-medium',
    arrow: 'rounded-bl-sm',
  },
};

const variantStyles: Record<TooltipVariant, { content: string; arrow: string }> = {
  dark: {
    content: 'bg-bg-strong-950 text-text-white-0',
    arrow: 'border-stroke-strong-950 bg-bg-strong-950',
  },
  light: {
    content: 'bg-bg-white-0 text-text-strong-950 ring-1 ring-stroke-soft-200',
    arrow: 'border-stroke-soft-200 bg-bg-white-0',
  },
};

const arrowSizeStyles: Record<TooltipSize, Record<TooltipVariant, string>> = {
  xsmall: {
    dark: 'size-1.5',
    light: 'size-2',
  },
  small: {
    dark: 'size-2',
    light: 'size-2.5',
  },
  medium: {
    dark: 'size-2',
    light: 'size-2.5',
  },
};

type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  size?: TooltipSize;
  variant?: TooltipVariant;
};

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    { size = 'small', variant = 'dark', className, children, sideOffset = 4, ...rest },
    forwardedRef
  ) => {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={forwardedRef}
          sideOffset={sideOffset}
          className={cn(
            'z-50 shadow-[0_12px_24px_-4px_rgba(27,28,29,0.08)]',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            sizeStyles[size].content,
            variantStyles[variant].content,
            className
          )}
          {...rest}
        >
          {children}
          <TooltipPrimitive.Arrow asChild>
            <div
              className={cn(
                '-translate-y-1/2 -rotate-45 border [clip-path:polygon(0_100%,0_0,100%_100%)]',
                sizeStyles[size].arrow,
                variantStyles[variant].arrow,
                arrowSizeStyles[size][variant]
              )}
            />
          </TooltipPrimitive.Arrow>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  }
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
  TooltipProvider as Provider,
  TooltipRoot as Root,
  TooltipTrigger as Trigger,
  TooltipContent as Content,
};
