'use client';

import { cnExt } from '@/shared/lib/cn';
import type { SwitchV2Props } from './switch-types';

export function SwitchV2({ checked = false, disabled, onChange, className }: SwitchV2Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cnExt(
        'relative inline-flex items-center w-[36px] h-[20px] rounded-full transition-colors duration-200 outline-none cursor-pointer border-none',
        checked ? 'bg-primary-base' : 'bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      <span
        className={cnExt(
          'absolute size-[14px] rounded-full bg-white shadow-regular-xs transition-transform duration-200',
          checked ? 'translate-x-[19px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}
