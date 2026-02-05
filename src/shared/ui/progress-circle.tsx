// AlignUI ProgressCircle v0.0.0 - Tailwind v4

import * as React from 'react';

import { cn } from '@/shared/lib/cn';

type ProgressCircleSize = '80' | '72' | '64' | '56' | '48';

const sizeTextStyles: Record<ProgressCircleSize, string> = {
  '80': 'text-sm font-medium',
  '72': 'text-sm font-medium',
  '64': 'text-sm font-medium',
  '56': 'text-xs font-medium',
  '48': 'text-xs font-medium',
};

function getSizes(size: ProgressCircleSize) {
  switch (size) {
    case '80':
      return { strokeWidth: 6.4, radius: 40 };
    case '72':
      return { strokeWidth: 5.75, radius: 36 };
    case '64':
      return { strokeWidth: 5.1, radius: 32 };
    case '56':
      return { strokeWidth: 4.5, radius: 28 };
    case '48':
      return { strokeWidth: 6.7, radius: 24 };
    default:
      return { strokeWidth: 6.4, radius: 40 };
  }
}

type ProgressCircleRootProps = Omit<React.SVGProps<SVGSVGElement>, 'value'> & {
  size?: ProgressCircleSize;
  value?: number;
  max?: number;
  children?: React.ReactNode;
};

const ProgressCircleRoot = React.forwardRef<
  SVGSVGElement,
  ProgressCircleRootProps
>(
  (
    {
      value = 0,
      max = 100,
      size = '80',
      className,
      children,
      ...rest
    },
    forwardedRef
  ) => {
    const { strokeWidth, radius } = getSizes(size);
    const safeValue = Math.min(max, Math.max(value, 0));
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (safeValue / max) * circumference;

    return (
      <div className={cn('relative', className)}>
        <svg
          ref={forwardedRef}
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="-rotate-90"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...rest}
        >
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className="stroke-bg-soft-200"
          />
          {safeValue >= 0 && (
            <circle
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              fill="none"
              className="stroke-primary-base transition-all duration-300 ease-out"
            />
          )}
        </svg>
        {children && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center text-center',
              sizeTextStyles[size]
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);
ProgressCircleRoot.displayName = 'ProgressCircleRoot';

export { ProgressCircleRoot as Root };
