'use client';

import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSquircle } from '@/shared/lib/use-squircle';
import { InputLabel } from '@/shared/ui/input-label';
import { HintLabel } from '@/shared/ui/hint-label';
import type { SelectFieldProps, SelectFieldState } from './select-field-types';

const stateRing: Record<SelectFieldState, string> = {
  default:       '',
  hover:         '',
  focus:         'shadow-[0px_0px_0px_3px_var(--outline-secondary,rgba(0,0,0,0.12))]',
  primary_light: '',
  active:        'shadow-[0px_0px_0px_3px_var(--outline-primary,rgba(99,102,241,0.22))]',
  danger:        'shadow-[0px_0px_0px_3px_var(--outline-danger,rgba(239,68,68,0.22))]',
  disabled:      '',
};

const stateBg: Record<SelectFieldState, string> = {
  default:       'bg-[var(--surface-s2,#f2f2f4)]',
  hover:         'bg-[var(--surface-s2,#f2f2f4)] brightness-[0.97]',
  focus:         'bg-[var(--surface-s2,#f2f2f4)]',
  primary_light: 'bg-[var(--surface-primary-light,rgba(99,102,241,0.1))]',
  active:        'bg-[var(--surface-primary-light,rgba(99,102,241,0.1))]',
  danger:        'bg-[var(--surface-s2,#f2f2f4)]',
  disabled:      'bg-[var(--surface-s2,#f2f2f4)]',
};

const stateTextPrimary: Record<SelectFieldState, string> = {
  default:       'text-[color:var(--text-med,#5b616d)]',
  hover:         'text-[color:var(--text-med,#5b616d)]',
  focus:         'text-[color:var(--text-med,#5b616d)]',
  primary_light: 'text-[color:var(--text-primary,#6366f1)]',
  active:        'text-[color:var(--text-primary,#6366f1)]',
  danger:        'text-[color:var(--text-med,#5b616d)]',
  disabled:      'text-[color:var(--text-med,#5b616d)]',
};

export function SelectField({
  label, labelSupportText,
  hint, hintSupportText, hintIcon,
  leftImage, leftIcon, rightIcon,
  primaryText = 'Select option',
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
  const { ref: bgRef, style: squircleStyle } = useSquircle<HTMLDivElement>(10, 0.8);

  return (
    <div className={`flex flex-col gap-[var(--space-xs,4px)] items-start w-full ${className ?? ''}`}>
      {label && <InputLabel label={label} supportText={labelSupportText} size="sm" />}

      <div
        className={[
          'relative shrink-0 w-full h-[32px] min-h-[32px] rounded-[8px]',
          stateRing[effectiveState],
          effectiveState === 'disabled' ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
          'transition-shadow duration-150',
        ].join(' ')}
      >
        <div ref={bgRef} style={squircleStyle} className={`absolute inset-0 ${stateBg[effectiveState]}`} />

        <button
          id={id}
          type="button"
          disabled={disabled || effectiveState === 'disabled'}
          onClick={onClick}
          className="relative z-10 flex items-center w-full h-full gap-[4px] px-[8px] py-[4px] bg-transparent border-none outline-none cursor-pointer text-[length:var(--size-body-1,13px)] leading-[var(--lh-body-1,24px)]"
        >
          {(leftImage || leftIcon) && (
            <div className="flex gap-[var(--space-sm,6px)] items-center justify-center shrink-0">
              {leftImage && (
                <div className="relative rounded-full shadow-[0px_1px_1px_-0.5px_var(--elevation-shadow,rgba(0,0,0,0.03))] shrink-0 size-6 overflow-hidden">
                  <img src={leftImage} alt="" className="absolute inset-0 size-full object-cover pointer-events-none" />
                </div>
              )}
              {leftIcon && <span className="overflow-clip relative shrink-0 size-6 flex items-center justify-center">{leftIcon}</span>}
            </div>
          )}

          <div className="flex flex-1 min-w-0 items-center gap-[var(--space-xs,4px)] px-[var(--space-xs,4px)] whitespace-nowrap overflow-hidden">
            <span className={`font-body font-semibold shrink-0 ${stateTextPrimary[effectiveState]}`}>{primaryText}</span>
            {secondaryText && (
              <span className="font-body font-medium shrink-0 text-[color:var(--text-low,#8c929c)]">{secondaryText}</span>
            )}
          </div>

          <div className="flex items-center justify-center shrink-0">
            {rightIcon ? (
              <span className="overflow-clip relative shrink-0 size-6 flex items-center justify-center">{rightIcon}</span>
            ) : (
              <ChevronDown
                size={24}
                strokeWidth={1.5}
                className="shrink-0"
                color={effectiveState === 'primary_light' || effectiveState === 'active' ? 'var(--text-primary,#6366f1)' : 'var(--text-med,#5b616d)'}
              />
            )}
          </div>
        </button>
      </div>

      {hint && (
        <HintLabel hint={hint} supportText={hintSupportText} icon={hintIcon} size="sm" variant={state === 'danger' ? 'danger' : 'default'} />
      )}
    </div>
  );
}
