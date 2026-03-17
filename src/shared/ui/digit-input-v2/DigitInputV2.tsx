'use client';

import { useSquircle } from '@/shared/lib/use-squircle';
import type { DigitInputV2Props, DigitInputState } from './digit-input-types';

const stateConfig: Record<DigitInputState, string> = {
  default:  '',
  hover:    'brightness-[0.97]',
  active:   'shadow-[0px_0px_0px_3px_var(--outline-primary,rgba(99,102,241,0.22))]',
  filled:   '',
  danger:   'shadow-[0px_0px_0px_3px_var(--outline-danger,rgba(239,68,68,0.22))]',
  disabled: 'opacity-40 cursor-not-allowed pointer-events-none',
};

export function DigitInputV2({ state = 'default', className, disabled, ...inputProps }: DigitInputV2Props) {
  const effectiveState: DigitInputState = disabled ? 'disabled' : state;
  const { ref, style: squircleStyle } = useSquircle<HTMLDivElement>(10, 0.8);

  return (
    <div
      ref={ref}
      style={squircleStyle}
      className={[
        'bg-[var(--surface-s2,#f2f2f4)]',
        'flex items-center justify-center',
        'px-[var(--space-lg,10px)] py-[var(--space-xl,12px)]',
        'w-[56px] h-[60px] relative',
        'transition-shadow duration-150',
        stateConfig[effectiveState],
        className ?? '',
      ].join(' ')}
    >
      <input
        type="text"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled || effectiveState === 'disabled'}
        className={[
          'font-body font-semibold',
          'text-[length:var(--size-heading-2,25px)]',
          'leading-[var(--lh-heading-2,36px)]',
          'tracking-[var(--ls-xs,-1px)]',
          'text-[color:var(--text-low,#8c929c)]',
          'text-center w-full bg-transparent border-none outline-none',
        ].join(' ')}
        {...inputProps}
      />
    </div>
  );
}
