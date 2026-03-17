'use client';

import { forwardRef, useId } from 'react';
import { cnExt } from '@/shared/lib/cn';
import { InputLabel } from '@/shared/ui/input-label';
import { HintLabel } from '@/shared/ui/hint-label';
import type { InputFieldProps, InputFieldState, InputFieldSize } from './input-field-types';

const sizeStyles: Record<InputFieldSize, { root: string; wrapper: string; input: string }> = {
  md: {
    root: 'rounded-lg',
    wrapper: 'gap-2 px-2.5',
    input: 'h-9',
  },
  lg: {
    root: 'rounded-[0.625rem]',
    wrapper: 'gap-2 px-3',
    input: 'h-10',
  },
  xl: {
    root: 'rounded-xl',
    wrapper: 'gap-2.5 px-3.5',
    input: 'h-12',
  },
};

const stateStyles: Record<InputFieldState, string> = {
  default: '',
  active:
    'shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-16)] before:ring-stroke-strong-950',
  danger:
    'before:ring-error-base hover:before:ring-error-base',
  disabled: '',
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      labelSupportText,
      labelIcon,
      hint,
      hintSupportText,
      hintIcon,
      leftImage,
      leftIcon,
      rightIcon,
      size = 'lg',
      state = 'default',
      className,
      disabled,
      id: externalId,
      ...inputProps
    },
    forwardedRef,
  ) => {
    const autoId = useId();
    const id = externalId ?? autoId;
    const sz = sizeStyles[size];
    const effectiveState: InputFieldState = disabled ? 'disabled' : state;
    const labelSize = size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm';

    return (
      <div className={cnExt('flex flex-col gap-1 w-full', className)}>
        {label && (
          <InputLabel label={label} supportText={labelSupportText} icon={labelIcon} size={labelSize} />
        )}

        <div
          className={cnExt(
            // base
            'group relative flex w-full overflow-hidden bg-bg-white-0 text-text-strong-950 shadow-regular-xs',
            'transition duration-200 ease-out',
            // ring
            'before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-stroke-soft-200',
            'before:pointer-events-none before:rounded-[inherit]',
            'before:transition before:duration-200 before:ease-out',
            // hover
            'hover:shadow-none',
            // focus-within
            'has-[input:focus]:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-16)] has-[input:focus]:before:ring-stroke-strong-950',
            // disabled
            'has-[input:disabled]:shadow-none has-[input:disabled]:before:ring-transparent',
            // error
            effectiveState === 'danger' && [
              'before:ring-error-base',
              'hover:before:ring-error-base',
              'has-[input:focus]:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-10)] has-[input:focus]:before:ring-error-base',
            ],
            sz.root,
          )}
        >
          <label
            htmlFor={id}
            className={cnExt(
              'flex w-full cursor-text items-center bg-bg-white-0',
              'transition duration-200 ease-out',
              'hover:[&:not(&:has(input:focus))]:bg-bg-weak-50',
              'has-[input:disabled]:pointer-events-none has-[input:disabled]:bg-bg-weak-50',
              sz.wrapper,
            )}
          >
            {leftIcon && (
              <span
                className={cnExt(
                  'flex size-5 shrink-0 select-none items-center justify-center',
                  'transition duration-200 ease-out',
                  'group-has-[:placeholder-shown]:text-text-soft-400',
                  'text-text-sub-600',
                  'group-has-[:placeholder-shown]:group-hover:text-text-sub-600',
                  'group-has-[input:disabled]:text-text-disabled-300',
                )}
              >
                {leftIcon}
              </span>
            )}

            {leftImage && (
              <div className="relative rounded-full shrink-0 size-6 overflow-hidden">
                <img src={leftImage} alt="" className="absolute inset-0 size-full object-cover" />
              </div>
            )}

            <input
              ref={forwardedRef}
              id={id}
              disabled={disabled || effectiveState === 'disabled'}
              className={cnExt(
                'w-full bg-transparent bg-none text-sm text-text-strong-950 outline-none',
                'transition duration-200 ease-out',
                'placeholder:select-none placeholder:text-text-soft-400 placeholder:transition placeholder:duration-200 placeholder:ease-out',
                'group-hover:placeholder:text-text-sub-600',
                'focus:outline-none',
                'disabled:text-text-disabled-300 disabled:placeholder:text-text-disabled-300',
                sz.input,
              )}
              {...inputProps}
            />

            {rightIcon && (
              <span className="flex size-5 shrink-0 items-center justify-center text-text-soft-400">
                {rightIcon}
              </span>
            )}
          </label>
        </div>

        {hint && (
          <HintLabel
            hint={hint}
            supportText={hintSupportText}
            icon={hintIcon}
            size={labelSize}
            variant={state === 'danger' ? 'danger' : 'default'}
          />
        )}
      </div>
    );
  },
);

InputField.displayName = 'InputField';
