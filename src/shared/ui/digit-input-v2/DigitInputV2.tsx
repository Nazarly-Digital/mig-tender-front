'use client';

import { cnExt } from '@/shared/lib/cn';
import type { DigitInputV2Props, DigitInputState } from './digit-input-types';

const stateStyles: Record<DigitInputState, string> = {
  default: '',
  hover: 'bg-bg-weak-50 shadow-none before:ring-transparent',
  active: 'shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-primary-alpha-24)] before:ring-primary-base',
  filled: 'before:ring-stroke-strong-950',
  danger: 'before:ring-error-base shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-10)]',
  disabled: 'opacity-40 cursor-not-allowed pointer-events-none shadow-none before:ring-transparent bg-bg-weak-50',
};

export function DigitInputV2({ state = 'default', className, disabled, ...inputProps }: DigitInputV2Props) {
  const effectiveState: DigitInputState = disabled ? 'disabled' : state;

  return (
    <div
      className={cnExt(
        'relative flex items-center justify-center w-[56px] h-16 rounded-[10px] bg-bg-white-0 shadow-regular-xs',
        'transition duration-200 ease-out',
        'before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-stroke-soft-200',
        'before:pointer-events-none before:rounded-[inherit]',
        'before:transition before:duration-200 before:ease-out',
        'hover:bg-bg-weak-50 hover:shadow-none hover:before:ring-transparent',
        'has-[input:focus]:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-16)] has-[input:focus]:before:ring-stroke-strong-950',
        stateStyles[effectiveState],
        className,
      )}
    >
      <input
        type="text"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled || effectiveState === 'disabled'}
        className={cnExt(
          'w-full text-center bg-transparent outline-none text-title-h5 text-text-strong-950',
          'selection:bg-none',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          'disabled:text-text-disabled-300',
        )}
        {...inputProps}
      />
    </div>
  );
}
