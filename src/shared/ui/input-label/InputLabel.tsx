'use client';

import type { InputLabelProps } from './input-label-types';

const sizeMap: Record<string, string> = {
  sm: 'text-[length:var(--size-body-1,13px)] leading-[var(--lh-para,20px)]',
  md: 'text-[length:var(--size-body-1,13px)] leading-[var(--lh-para,20px)]',
  lg: 'text-[length:var(--size-body-2,15px)] leading-[var(--lh-body-2,24px)]',
};

export function InputLabel({ label, supportText, icon, size = 'md', className }: InputLabelProps) {
  const textClasses = sizeMap[size];
  return (
    <div className={`flex gap-[var(--space-xs,4px)] items-center px-[var(--space-xxs,2px)] ${className ?? ''}`}>
      <span className={`font-body font-semibold not-italic text-[color:var(--text-med,#5b616d)] tracking-[var(--ls-none,0px)] whitespace-nowrap shrink-0 ${textClasses}`}>
        {label}
      </span>
      {supportText && (
        <span className={`font-body font-medium not-italic text-[color:var(--text-low,#8c929c)] tracking-[var(--ls-none,0px)] whitespace-nowrap shrink-0 ${textClasses}`}>
          {supportText}
        </span>
      )}
      {icon && <span className="shrink-0 size-6 flex items-center justify-center">{icon}</span>}
    </div>
  );
}
