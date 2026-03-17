'use client';

import type { SwitchV2Props } from './switch-types';

export function SwitchV2({ checked = false, disabled, onChange, className }: SwitchV2Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={[
        'relative inline-flex items-center w-[36px] h-[20px] rounded-full transition-colors duration-200 outline-none cursor-pointer border-none',
        checked ? 'bg-[var(--surface-primary-med-em,#6f61ff)]' : 'bg-[var(--surface-s2,#f2f2f4)]',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        className ?? '',
      ].join(' ')}
    >
      <span
        className={[
          'absolute size-[14px] rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.12)] transition-transform duration-200',
          checked ? 'translate-x-[19px]' : 'translate-x-[3px]',
        ].join(' ')}
      />
    </button>
  );
}
