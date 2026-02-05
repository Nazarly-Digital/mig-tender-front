// AlignUI Select v0.0.0 - Tailwind v4

'use client';

import * as React from 'react';
import * as ScrollAreaPrimitives from '@radix-ui/react-scroll-area';
import * as SelectPrimitives from '@radix-ui/react-select';
import { Slottable } from '@radix-ui/react-slot';
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';

type SelectSize = 'medium' | 'small' | 'xsmall';
type SelectVariant = 'default' | 'compact' | 'compactForInput' | 'inline';

const baseStyles = {
  triggerRoot:
    'group/trigger min-w-0 shrink-0 bg-bg-white-0 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] outline-none ring-1 ring-inset ring-stroke-soft-200 text-sm text-text-strong-950 flex items-center text-left transition duration-200 ease-out hover:bg-bg-weak-50 hover:ring-transparent focus:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus:outline-none focus:ring-stroke-strong-950 focus:text-text-strong-950 data-[placeholder]:focus:text-text-strong-950 disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:shadow-none disabled:ring-transparent data-[placeholder]:disabled:text-text-disabled-300 data-[placeholder]:text-text-sub-600',
  triggerArrow:
    'ml-auto size-5 shrink-0 transition duration-200 ease-out group-data-[placeholder]/trigger:text-text-soft-400 text-text-sub-600 group-hover/trigger:text-text-sub-600 group-data-[placeholder]/trigger:group-hover:text-text-sub-600 group-focus/trigger:text-text-strong-950 group-data-[placeholder]/trigger:group-focus/trigger:text-text-strong-950 group-disabled/trigger:text-text-disabled-300 group-data-[placeholder]/trigger:group-disabled/trigger:text-text-disabled-300 group-data-[state=open]/trigger:rotate-180',
  triggerIcon:
    'h-5 w-auto min-w-0 shrink-0 object-contain text-text-sub-600 transition duration-200 ease-out group-data-[placeholder]/trigger:text-text-soft-400 group-hover/trigger:text-text-sub-600 group-data-[placeholder]/trigger:group-hover:text-text-sub-600 group-disabled/trigger:text-text-disabled-300 group-data-[placeholder]/trigger:group-disabled/trigger:text-text-disabled-300 group-disabled/trigger:[&:not(.remixicon)]:opacity-[.48]',
  selectItemIcon:
    'size-5 shrink-0 bg-[length:1.25rem] text-text-sub-600 [[data-disabled]_&:not(.remixicon)]:opacity-[.48] [[data-disabled]_&]:text-text-disabled-300',
};

const sizeVariantStyles: Record<SelectSize, Record<SelectVariant, { trigger: string; triggerIcon: string; triggerArrow: string; itemIcon: string }>> = {
  medium: {
    default: { trigger: 'h-10 min-h-10 gap-2 rounded-[10px] pl-3 pr-2.5 w-full', triggerIcon: '', triggerArrow: '', itemIcon: '' },
    compact: { trigger: 'h-10 gap-1 rounded-[10px] pl-3 pr-2.5 w-auto', triggerIcon: '-ml-0.5', triggerArrow: '', itemIcon: 'group-has-[&]/trigger:-ml-0.5' },
    compactForInput: { trigger: 'pl-2.5 pr-2 w-auto rounded-none shadow-none ring-0 focus:bg-bg-weak-50 focus:shadow-none focus:ring-0 focus:ring-transparent', triggerIcon: 'mr-2', triggerArrow: 'ml-0.5', itemIcon: '' },
    inline: { trigger: 'h-5 min-h-5 w-auto gap-0 rounded-none bg-transparent p-0 text-text-sub-600 shadow-none ring-0 hover:bg-transparent hover:text-text-strong-950 focus:shadow-none data-[state=open]:text-text-strong-950', triggerIcon: 'mr-1.5 text-text-soft-400 group-hover/trigger:text-text-sub-600 group-data-[state=open]/trigger:text-text-sub-600', triggerArrow: 'ml-0.5 group-hover/trigger:text-text-strong-950 group-data-[state=open]/trigger:text-text-strong-950', itemIcon: 'text-text-soft-400 group-hover/trigger:text-text-sub-600' },
  },
  small: {
    default: { trigger: 'h-9 min-h-9 gap-2 rounded-lg pl-2.5 pr-2 w-full', triggerIcon: '', triggerArrow: '', itemIcon: '' },
    compact: { trigger: 'h-9 gap-1 rounded-lg pl-3 pr-2 w-auto', triggerIcon: '-ml-0.5', triggerArrow: '', itemIcon: 'group-has-[&]/trigger:-ml-0.5' },
    compactForInput: { trigger: 'px-2 w-auto rounded-none shadow-none ring-0 focus:bg-bg-weak-50 focus:shadow-none focus:ring-0 focus:ring-transparent', triggerIcon: 'mr-2', triggerArrow: 'ml-0.5', itemIcon: '' },
    inline: { trigger: 'h-5 min-h-5 w-auto gap-0 rounded-none bg-transparent p-0 text-text-sub-600 shadow-none ring-0 hover:bg-transparent hover:text-text-strong-950 focus:shadow-none data-[state=open]:text-text-strong-950', triggerIcon: 'mr-1.5 text-text-soft-400 group-hover/trigger:text-text-sub-600 group-data-[state=open]/trigger:text-text-sub-600', triggerArrow: 'ml-0.5 group-hover/trigger:text-text-strong-950 group-data-[state=open]/trigger:text-text-strong-950', itemIcon: 'text-text-soft-400 group-hover/trigger:text-text-sub-600' },
  },
  xsmall: {
    default: { trigger: 'h-8 min-h-8 gap-1.5 rounded-lg pl-2 pr-1.5 w-full', triggerIcon: '', triggerArrow: '', itemIcon: '' },
    compact: { trigger: 'h-8 gap-0.5 rounded-lg pl-2.5 pr-1.5 w-auto', triggerIcon: '-ml-0.5 size-4', triggerArrow: '', itemIcon: 'size-4 bg-[length:1rem] group-has-[&]/trigger:-ml-0.5' },
    compactForInput: { trigger: 'pl-2 pr-1.5 w-auto rounded-none shadow-none ring-0 focus:bg-bg-weak-50 focus:shadow-none focus:ring-0 focus:ring-transparent', triggerIcon: 'mr-1.5 size-4', triggerArrow: 'ml-0.5', itemIcon: 'size-4 bg-[length:1rem]' },
    inline: { trigger: 'h-5 min-h-5 w-auto gap-0 rounded-none bg-transparent p-0 text-text-sub-600 shadow-none ring-0 hover:bg-transparent hover:text-text-strong-950 focus:shadow-none data-[state=open]:text-text-strong-950', triggerIcon: 'mr-1.5 text-text-soft-400 group-hover/trigger:text-text-sub-600 group-data-[state=open]/trigger:text-text-sub-600', triggerArrow: 'ml-0.5 group-hover/trigger:text-text-strong-950 group-data-[state=open]/trigger:text-text-strong-950', itemIcon: 'text-text-soft-400 group-hover/trigger:text-text-sub-600' },
  },
};

type SelectContextType = {
  variant?: SelectVariant;
  size?: SelectSize;
  hasError?: boolean;
};

const SelectContext = React.createContext<SelectContextType>({
  size: 'medium',
  variant: 'default',
  hasError: false,
});

const useSelectContext = () => React.useContext(SelectContext);

const SelectRoot = ({
  size = 'medium',
  variant = 'default',
  hasError,
  ...rest
}: React.ComponentProps<typeof SelectPrimitives.Root> & SelectContextType) => {
  return (
    <SelectContext.Provider value={{ size, variant, hasError }}>
      <SelectPrimitives.Root {...rest} />
    </SelectContext.Provider>
  );
};
SelectRoot.displayName = 'SelectRoot';

const SelectGroup = SelectPrimitives.Group;
SelectGroup.displayName = 'SelectGroup';

const SelectValue = SelectPrimitives.Value;
SelectValue.displayName = 'SelectValue';

const SelectSeparator = SelectPrimitives.Separator;
SelectSeparator.displayName = 'SelectSeparator';

const SelectGroupLabel = SelectPrimitives.Label;
SelectGroupLabel.displayName = 'SelectGroupLabel';

const SELECT_TRIGGER_ICON_NAME = 'SelectTriggerIcon';

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger>
>(({ className, children, ...rest }, forwardedRef) => {
  const { size = 'medium', variant = 'default', hasError } = useSelectContext();
  const styles = sizeVariantStyles[size][variant];

  return (
    <SelectPrimitives.Trigger
      ref={forwardedRef}
      className={cn(
        baseStyles.triggerRoot,
        styles.trigger,
        hasError && 'ring-error-base focus:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-24)] focus:ring-error-base',
        className
      )}
      {...rest}
    >
      <Slottable>{children}</Slottable>
      <SelectPrimitives.Icon asChild>
        <RiArrowDownSLine className={cn(baseStyles.triggerArrow, styles.triggerArrow)} />
      </SelectPrimitives.Icon>
    </SelectPrimitives.Trigger>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

function TriggerIcon<T extends React.ElementType = 'div'>({
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || 'div';
  const { size = 'medium', variant = 'default' } = useSelectContext();
  const styles = sizeVariantStyles[size][variant];

  return <Component className={cn(baseStyles.triggerIcon, styles.triggerIcon, className)} {...rest} />;
}
TriggerIcon.displayName = SELECT_TRIGGER_ICON_NAME;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(
  (
    {
      className,
      position = 'popper',
      children,
      sideOffset = 8,
      collisionPadding = 8,
      ...rest
    },
    forwardedRef
  ) => (
    <SelectPrimitives.Portal>
      <SelectPrimitives.Content
        ref={forwardedRef}
        className={cn(
          'relative z-50 overflow-hidden rounded-2xl bg-bg-white-0 shadow-[0_16px_32px_-12px_rgba(27,28,29,0.14)] ring-1 ring-inset ring-stroke-soft-200',
          'min-w-[--radix-select-trigger-width] max-w-[max(var(--radix-select-trigger-width),320px)]',
          'max-h-[--radix-select-content-available-height]',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        sideOffset={sideOffset}
        position={position}
        collisionPadding={collisionPadding}
        {...rest}
      >
        <ScrollAreaPrimitives.Root type="auto">
          <SelectPrimitives.Viewport asChild>
            <ScrollAreaPrimitives.Viewport
              style={{ overflowY: undefined }}
              className="max-h-[196px] w-full scroll-py-2 overflow-auto p-2"
            >
              {children}
            </ScrollAreaPrimitives.Viewport>
          </SelectPrimitives.Viewport>
          <ScrollAreaPrimitives.Scrollbar orientation="vertical">
            <ScrollAreaPrimitives.Thumb className="!w-1 rounded bg-bg-soft-200" />
          </ScrollAreaPrimitives.Scrollbar>
        </ScrollAreaPrimitives.Root>
      </SelectPrimitives.Content>
    </SelectPrimitives.Portal>
  )
);

SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...rest }, forwardedRef) => {
  const { size } = useSelectContext();

  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cn(
        'group relative cursor-pointer select-none rounded-lg p-2 pr-9 text-sm text-text-strong-950',
        'flex items-center gap-2 transition duration-200 ease-out',
        'data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled-300',
        'data-[highlighted]:bg-bg-weak-50 data-[highlighted]:outline-0',
        size === 'xsmall' && 'gap-1.5 pr-[34px]',
        className
      )}
      {...rest}
    >
      <SelectPrimitives.ItemText asChild>
        <span
          className={cn(
            'flex flex-1 items-center gap-2',
            'group-disabled:text-text-disabled-300',
            size === 'xsmall' && 'gap-1.5'
          )}
        >
          {typeof children === 'string' ? (
            <span className="line-clamp-1">{children}</span>
          ) : (
            children
          )}
        </span>
      </SelectPrimitives.ItemText>
      <SelectPrimitives.ItemIndicator asChild>
        <RiCheckLine className="absolute right-2 top-1/2 size-5 shrink-0 -translate-y-1/2 text-text-sub-600" />
      </SelectPrimitives.ItemIndicator>
    </SelectPrimitives.Item>
  );
});

SelectItem.displayName = 'SelectItem';

function SelectItemIcon<T extends React.ElementType>({
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T>) {
  const { size = 'medium', variant = 'default' } = useSelectContext();
  const styles = sizeVariantStyles[size][variant];

  const Component = as || 'div';

  return (
    <Component className={cn(baseStyles.selectItemIcon, styles.itemIcon, className)} {...rest} />
  );
}

export {
  SelectRoot as Root,
  SelectContent as Content,
  SelectGroup as Group,
  SelectGroupLabel as GroupLabel,
  SelectItem as Item,
  SelectItemIcon as ItemIcon,
  SelectSeparator as Separator,
  SelectTrigger as Trigger,
  TriggerIcon,
  SelectValue as Value,
};
