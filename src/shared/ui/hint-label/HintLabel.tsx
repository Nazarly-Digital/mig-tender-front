'use client';

import type { HintLabelProps } from './hint-label-types';
import { cnExt } from '@/shared/lib/cn';

const sizeMap: Record<string, string> = {
  sm: 'text-paragraph-xs',
  md: 'text-paragraph-sm',
  lg: 'text-paragraph-md',
};

export function HintLabel({ hint, supportText, icon, size = 'md', variant = 'default', className }: HintLabelProps) {
  const textClasses = sizeMap[size];
  const textColor = variant === 'danger' ? 'text-error-base' : 'text-text-soft-400';

  return (
    <div className={cnExt('flex items-center gap-1', className)}>
      {icon && <span className="shrink-0 size-4 flex items-center justify-center">{icon}</span>}
      <span className={cnExt(textColor, textClasses)}>
        {hint}
      </span>
      {supportText && (
        <span className={cnExt('text-text-disabled-300', textClasses)}>
          {supportText}
        </span>
      )}
    </div>
  );
}
