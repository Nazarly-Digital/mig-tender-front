// AlignUI CommandMenu v0.0.0 - Tailwind v4

'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Command } from 'cmdk';

import { cn } from '@/shared/lib/cn';
import { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import * as Modal from '@/shared/ui/modal';

const CommandDialogTitle = Modal.Title;
const CommandDialogDescription = Modal.Description;

type CommandItemSize = 'small' | 'medium';

const itemSizeStyles: Record<CommandItemSize, string> = {
  small: 'px-3 py-2.5',
  medium: 'px-3 py-3',
};

const CommandDialog = ({
  children,
  className,
  overlayClassName,
  ...rest
}: DialogProps & {
  className?: string;
  overlayClassName?: string;
}) => {
  return (
    <Modal.Root {...rest}>
      <Modal.Content
        overlayClassName={cn('justify-start pt-20', overlayClassName)}
        showClose={false}
        className={cn(
          'flex max-h-full max-w-[600px] flex-col overflow-hidden rounded-2xl',
          className
        )}
      >
        <Command
          className={cn(
            'divide-y divide-stroke-soft-200',
            'grid min-h-0 auto-cols-auto grid-flow-row',
            '[&>[cmdk-label]+*]:!border-t-0'
          )}
        >
          {children}
        </Command>
      </Modal.Content>
    </Modal.Root>
  );
};

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof Command.Input>,
  React.ComponentPropsWithoutRef<typeof Command.Input>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <Command.Input
      ref={forwardedRef}
      className={cn(
        'w-full bg-transparent text-sm text-text-strong-950 outline-none',
        'transition duration-200 ease-out',
        'placeholder:[transition:inherit]',
        'placeholder:text-text-soft-400',
        'group-hover/cmd-input:placeholder:text-text-sub-600',
        'focus:outline-none',
        className
      )}
      {...rest}
    />
  );
});
CommandInput.displayName = 'CommandInput';

const CommandList = React.forwardRef<
  React.ComponentRef<typeof Command.List>,
  React.ComponentPropsWithoutRef<typeof Command.List>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <Command.List
      ref={forwardedRef}
      className={cn(
        'flex max-h-min min-h-0 flex-1 flex-col',
        '[&>[cmdk-list-sizer]]:divide-y [&>[cmdk-list-sizer]]:divide-stroke-soft-200',
        '[&>[cmdk-list-sizer]]:overflow-auto',
        className
      )}
      {...rest}
    />
  );
});
CommandList.displayName = 'CommandList';

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof Command.Group>,
  React.ComponentPropsWithoutRef<typeof Command.Group>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <Command.Group
      ref={forwardedRef}
      className={cn(
        'relative px-2 py-3',
        '[&>[cmdk-group-heading]]:text-xs [&>[cmdk-group-heading]]:font-medium [&>[cmdk-group-heading]]:text-text-sub-600',
        '[&>[cmdk-group-heading]]:mb-2 [&>[cmdk-group-heading]]:px-3 [&>[cmdk-group-heading]]:pt-1',
        className
      )}
      {...rest}
    />
  );
});
CommandGroup.displayName = 'CommandGroup';

type CommandItemProps = React.ComponentPropsWithoutRef<typeof Command.Item> & {
  size?: CommandItemSize;
};

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof Command.Item>,
  CommandItemProps
>(({ className, size = 'small', ...rest }, forwardedRef) => {
  return (
    <Command.Item
      ref={forwardedRef}
      className={cn(
        'flex items-center gap-3 rounded-[10px] bg-bg-white-0',
        'cursor-pointer text-sm text-text-strong-950',
        'transition duration-200 ease-out',
        'data-[selected=true]:bg-bg-weak-50',
        itemSizeStyles[size],
        className
      )}
      {...rest}
    />
  );
});
CommandItem.displayName = 'CommandItem';

function CommandItemIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn('size-5 shrink-0 text-text-sub-600', className)}
      {...rest}
    />
  );
}

function CommandFooter({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-12 items-center justify-between gap-3 px-5',
        className
      )}
      {...rest}
    />
  );
}

function CommandFooterKeyBox({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded bg-bg-weak-50 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
        className
      )}
      {...rest}
    />
  );
}

export {
  CommandDialog as Dialog,
  CommandDialogTitle as DialogTitle,
  CommandDialogDescription as DialogDescription,
  CommandInput as Input,
  CommandList as List,
  CommandGroup as Group,
  CommandItem as Item,
  CommandItemIcon as ItemIcon,
  CommandFooter as Footer,
  CommandFooterKeyBox as FooterKeyBox,
};
