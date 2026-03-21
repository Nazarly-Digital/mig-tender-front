// AlignUI Input v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';

const INPUT_ROOT_NAME = 'InputRoot';
const INPUT_WRAPPER_NAME = 'InputWrapper';
const INPUT_EL_NAME = 'InputEl';
const INPUT_ICON_NAME = 'InputIcon';

type InputSize = 'medium' | 'small' | 'xsmall';

type InputRootProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  size?: InputSize;
  hasError?: boolean;
};

const sizeRootStyles: Record<InputSize, string> = {
  medium: 'rounded-[0.625rem]',
  small: 'rounded-lg',
  xsmall: 'rounded-lg',
};

const sizeWrapperStyles: Record<InputSize, string> = {
  medium: 'gap-2 px-3',
  small: 'gap-2 px-2.5',
  xsmall: 'gap-1.5 px-2',
};

const sizeInputStyles: Record<InputSize, string> = {
  medium: 'h-10',
  small: 'h-9',
  xsmall: 'h-8',
};

function InputRoot({
  className,
  children,
  size = 'medium',
  hasError,
  asChild,
  ...rest
}: InputRootProps) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component
      className={cn(
        // base
        'group relative flex w-full overflow-hidden bg-bg-white-0 text-text-strong-950 shadow-regular-xs',
        'transition duration-200 ease-out',
        'divide-x divide-stroke-soft-200',
        // before (ring)
        'before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-stroke-soft-200',
        'before:pointer-events-none before:rounded-[inherit]',
        'before:transition before:duration-200 before:ease-out',
        // hover
        'hover:shadow-none',
        // focus
        'has-[input:focus]:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-16)] has-[input:focus]:before:ring-stroke-strong-950',
        // disabled
        'has-[input:disabled]:shadow-none has-[input:disabled]:before:ring-transparent',
        // error
        hasError && [
          'before:ring-error-base',
          'hover:before:ring-error-base',
          'has-[input:focus]:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-10)] has-[input:focus]:before:ring-error-base',
        ],
        // size
        sizeRootStyles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
InputRoot.displayName = INPUT_ROOT_NAME;

type InputWrapperProps = React.HTMLAttributes<HTMLLabelElement> & {
  asChild?: boolean;
  size?: InputSize;
};

function InputWrapper({
  className,
  children,
  size = 'medium',
  asChild,
  ...rest
}: InputWrapperProps) {
  const Component = asChild ? Slot : 'label';

  return (
    <Component
      className={cn(
        // base
        'group/input-wrapper flex w-full cursor-text items-center bg-bg-white-0',
        'transition duration-200 ease-out',
        // hover
        'hover:[&:not(&:has(input:focus))]:bg-bg-weak-50',
        // disabled
        'has-[input:disabled]:pointer-events-none has-[input:disabled]:bg-bg-weak-50',
        // size
        sizeWrapperStyles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
InputWrapper.displayName = INPUT_WRAPPER_NAME;

type InputElProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  asChild?: boolean;
  size?: InputSize;
};

const Input = React.forwardRef<HTMLInputElement, InputElProps>(
  ({ className, type = 'text', size = 'medium', asChild, ...rest }, forwardedRef) => {
    const Component = asChild ? Slot : 'input';

    return (
      <Component
        type={type}
        className={cn(
          // base
          'w-full bg-transparent bg-none text-sm text-text-strong-950 outline-none',
          'transition duration-200 ease-out',
          // placeholder
          'placeholder:select-none placeholder:text-text-soft-400 placeholder:transition placeholder:duration-200 placeholder:ease-out',
          // hover placeholder
          'group-hover/input-wrapper:placeholder:text-text-sub-600',
          // focus
          'focus:outline-none',
          // disabled
          'disabled:text-text-disabled-300 disabled:placeholder:text-text-disabled-300',
          // size
          sizeInputStyles[size],
          className,
        )}
        ref={forwardedRef}
        {...rest}
      />
    );
  },
);
Input.displayName = INPUT_EL_NAME;

type InputIconProps = {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
};

function InputIcon({ as, className, ...rest }: InputIconProps) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        // base
        'flex size-5 shrink-0 select-none items-center justify-center',
        'transition duration-200 ease-out',
        // placeholder state
        'group-has-[:placeholder-shown]:text-text-soft-400',
        // filled state
        'text-text-sub-600',
        // hover
        'group-has-[:placeholder-shown]:group-hover/input-wrapper:text-text-sub-600',
        // disabled
        'group-has-[input:disabled]/input-wrapper:text-text-disabled-300',
        className,
      )}
      {...rest}
    />
  );
}
InputIcon.displayName = INPUT_ICON_NAME;

export {
  InputRoot as Root,
  InputWrapper as Wrapper,
  Input,
  InputIcon as Icon,
};
