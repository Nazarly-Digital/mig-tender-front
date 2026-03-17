'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cnExt } from '@/shared/lib/cn';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:border-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-primary-base text-white hover:bg-primary-darker focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-primary-alpha-24)]',
        outline:
          'bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent focus-visible:text-text-strong-950 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus-visible:ring-stroke-strong-950',
        secondary:
          'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-white-0 hover:text-text-strong-950 hover:shadow-regular-xs hover:ring-1 hover:ring-inset hover:ring-stroke-soft-200 focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus-visible:ring-stroke-strong-950',
        ghost:
          'bg-transparent text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus-visible:ring-stroke-strong-950',
        destructive:
          'bg-red-alpha-10 text-error-base hover:bg-error-base hover:text-white focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-red-alpha-24)]',
        link: 'text-primary-base underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 gap-3 px-3.5',
        xs: 'h-7 gap-2.5 rounded-lg px-2 text-xs',
        sm: 'h-8 gap-2.5 rounded-lg px-2.5',
        lg: 'h-9 gap-3 rounded-lg px-3',
        icon: 'size-10 rounded-[10px]',
        'icon-sm': 'size-8 rounded-lg',
        'icon-xs': 'size-7 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function ButtonV2({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cnExt(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { ButtonV2, buttonVariants };
