// AlignUI ProgressBar v0.0.0 - Tailwind v4

import * as React from 'react';

import { cn } from '@/shared/lib/cn';

type ProgressBarColor = 'blue' | 'red' | 'orange' | 'green';

const colorStyles: Record<ProgressBarColor, string> = {
  blue: 'bg-information-base',
  red: 'bg-error-base',
  orange: 'bg-warning-base',
  green: 'bg-success-base',
};

type ProgressBarRootProps = React.HTMLAttributes<HTMLDivElement> & {
  color?: ProgressBarColor;
  value?: number;
  max?: number;
};

const ProgressBarRoot = React.forwardRef<HTMLDivElement, ProgressBarRootProps>(
  ({ className, color = 'blue', value = 0, max = 100, ...rest }, forwardedRef) => {
    const safeValue = Math.min(max, Math.max(value, 0));

    return (
      <div
        ref={forwardedRef}
        className={cn('h-1.5 w-full rounded-full bg-bg-soft-200', className)}
        {...rest}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            colorStyles[color]
          )}
          style={{
            width: `${(safeValue / max) * 100}%`,
          }}
          aria-valuenow={value}
          aria-valuemax={max}
          role="progressbar"
        />
      </div>
    );
  }
);
ProgressBarRoot.displayName = 'ProgressBarRoot';

export { ProgressBarRoot as Root };
