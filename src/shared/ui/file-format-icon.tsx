// AlignUI FileFormatIcon v0.0.0 - Tailwind v4

import * as React from 'react';

import { cn } from '@/shared/lib/cn';

type FileFormatSize = 'medium' | 'small';
type FileFormatColor = 'red' | 'orange' | 'yellow' | 'green' | 'sky' | 'blue' | 'purple' | 'pink' | 'gray';

const sizeStyles: Record<FileFormatSize, string> = {
  medium: 'size-10',
  small: 'size-8',
};

const colorStyles: Record<FileFormatColor, string> = {
  red: 'bg-error-base',
  orange: 'bg-warning-base',
  yellow: 'bg-away-base',
  green: 'bg-success-base',
  sky: 'bg-verified-base',
  blue: 'bg-information-base',
  purple: 'bg-feature-base',
  pink: 'bg-highlighted-base',
  gray: 'bg-faded-base',
};

type FileFormatIconProps = React.SVGProps<SVGSVGElement> & {
  format?: string;
  size?: FileFormatSize;
  color?: FileFormatColor;
};

function FileFormatIcon({
  format,
  className,
  color = 'gray',
  size = 'medium',
  ...rest
}: FileFormatIconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('relative shrink-0', sizeStyles[size], className)}
      {...rest}
    >
      <path
        d="M30 39.25H10C7.10051 39.25 4.75 36.8995 4.75 34V6C4.75 3.10051 7.10051 0.75 10 0.75H20.5147C21.9071 0.75 23.2425 1.30312 24.227 2.28769L33.7123 11.773C34.6969 12.7575 35.25 14.0929 35.25 15.4853V34C35.25 36.8995 32.8995 39.25 30 39.25Z"
        className="fill-bg-white-0 stroke-stroke-sub-300"
        strokeWidth="1.5"
      />
      <path
        d="M23 1V9C23 11.2091 24.7909 13 27 13H35"
        className="stroke-stroke-sub-300"
        strokeWidth="1.5"
      />
      <foreignObject x="0" y="0" width="40" height="40">
        <div
          {...{ xmlns: "http://www.w3.org/1999/xhtml" } as any}
          className={cn(
            'absolute bottom-1.5 left-0 flex h-4 items-center rounded px-[3px] py-0.5 text-[11px] font-semibold leading-none text-white',
            colorStyles[color]
          )}
        >
          {format}
        </div>
      </foreignObject>
    </svg>
  );
}

export { FileFormatIcon as Root };
