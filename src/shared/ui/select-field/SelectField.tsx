'use client';

import { useId } from 'react';
import { RiArrowDownSLine } from '@remixicon/react';
import { cnExt } from '@/shared/lib/cn';
import { InputLabel } from '@/shared/ui/input-label';
import { HintLabel } from '@/shared/ui/hint-label';
import type { SelectFieldProps, SelectFieldState } from './select-field-types';

const stateStyles: Record<SelectFieldState, string> = {
  default: '',
  hover: 'bg-bg-weak-50 shadow-none before:ring-transparent',
  focus: 'shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-16)] before:ring-stroke-strong-950',
  primary_light: 'bg-primary-alpha-10 before:ring-primary-base',
  active: 'shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-primary-alpha-24)] before:ring-primary-base',
  danger: 'before:ring-error-base',
  disabled: '',
};

export function SelectField({
  label, labelSupportText,
  hint, hintSupportText, hintIcon,
  leftImage, leftIcon, rightIcon,
  primaryText = 'Выберите...',
  secondaryText,
  state = 'default',
  disabled,
  className,
  onClick,
  id: externalId,
}: SelectFieldProps) {
  const autoId = useId();
  const id = externalId ?? autoId;
  const effectiveState: SelectFieldState = disabled ? 'disabled' : state;

  return (
    <div className={cnExt('flex flex-col gap-1 w-full', className)}>
      {label && <InputLabel label={label} supportText={labelSupportText} size="sm" />}

      <div
        className={cnExt(
          'group relative flex w-full overflow-hidden bg-bg-white-0 shadow-regular-xs rounded-[0.625rem]',
          'transition duration-200 ease-out',
          'before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-stroke-soft-200',
          'before:pointer-events-none before:rounded-[inherit]',
          'before:transition before:duration-200 before:ease-out',
          'hover:shadow-none',
          effectiveState === 'disabled' && 'opacity-40 cursor-not-allowed pointer-events-none shadow-none before:ring-transparent bg-bg-weak-50',
          effectiveState === 'danger' && 'before:ring-error-base hover:before:ring-error-base',
          stateStyles[effectiveState],
        )}
      >
        <button
          id={id}
          type="button"
          disabled={disabled || effectiveState === 'disabled'}
          onClick={onClick}
          className="flex w-full cursor-pointer items-center gap-2 bg-bg-white-0 px-3 h-10 transition duration-200 ease-out hover:bg-bg-weak-50 outline-none border-none text-sm"
        >
          {(leftImage || leftIcon) && (
            <span className="flex shrink-0 items-center justify-center">
              {leftImage && (
                <div className="relative rounded-full shrink-0 size-6 overflow-hidden">
                  <img src={leftImage} alt="" className="absolute inset-0 size-full object-cover" />
                </div>
              )}
              {leftIcon && (
                <span className="size-5 flex items-center justify-center text-text-soft-400">{leftIcon}</span>
              )}
            </span>
          )}

          <span className="flex flex-1 min-w-0 items-center gap-1 overflow-hidden">
            <span className={cnExt(
              'truncate',
              effectiveState === 'primary_light' || effectiveState === 'active'
                ? 'text-primary-base'
                : 'text-text-strong-950',
            )}>
              {primaryText}
            </span>
            {secondaryText && (
              <span className="truncate text-text-soft-400">{secondaryText}</span>
            )}
          </span>

          <span className="flex shrink-0 items-center justify-center">
            {rightIcon ? (
              <span className="size-5 flex items-center justify-center text-text-soft-400">{rightIcon}</span>
            ) : (
              <RiArrowDownSLine className="size-5 text-text-soft-400" />
            )}
          </span>
        </button>
      </div>

      {hint && (
        <HintLabel hint={hint} supportText={hintSupportText} icon={hintIcon} size="sm" variant={state === 'danger' ? 'danger' : 'default'} />
      )}
    </div>
  );
}
