'use client';

import type { InputLabelProps } from './input-label-types';
import { cnExt } from '@/shared/lib/cn';

const sizeMap: Record<string, string> = {
  sm: 'text-paragraph-xs',
  md: 'text-paragraph-sm',
  lg: 'text-paragraph-md',
};

export function InputLabel({ label, supportText, icon, size = 'md', required, htmlFor, className }: InputLabelProps) {
  const textClasses = sizeMap[size];
  return (
    <label
      htmlFor={htmlFor}
      className={cnExt('flex items-center gap-1', className)}
    >
      <span className={cnExt('font-medium text-text-sub-600', textClasses)}>
        {label}
        {required && <span className="text-error-base ml-0.5">*</span>}
      </span>
      {supportText && (
        <span className={cnExt('text-text-soft-400', textClasses)}>
          {supportText}
        </span>
      )}
      {icon && <span className="shrink-0 size-5 flex items-center justify-center text-text-soft-400">{icon}</span>}
    </label>
  );
}
