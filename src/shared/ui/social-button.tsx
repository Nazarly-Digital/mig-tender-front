// AlignUI SocialButton v0.0.0 - Tailwind v4

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/lib/cn';
import { PolymorphicComponentProps } from '@/shared/lib/polymorphic';
import { recursiveCloneChildren } from '@/shared/lib/recursive-clone-children';

const SOCIAL_BUTTON_ROOT_NAME = 'SocialButtonRoot';
const SOCIAL_BUTTON_ICON_NAME = 'SocialButtonIcon';

type SocialButtonBrand = 'apple' | 'twitter' | 'google' | 'facebook' | 'linkedin' | 'github' | 'dropbox';
type SocialButtonMode = 'filled' | 'stroke';

const brandFilledStyles: Record<SocialButtonBrand, string> = {
  apple: 'bg-black before:bg-white/[.16]',
  twitter: 'bg-black before:bg-white/[.16]',
  google: 'bg-[#f14336] before:bg-black/[.16]',
  facebook: 'bg-[#1977f3] before:bg-black/[.16]',
  linkedin: 'bg-[#0077b5] before:bg-black/[.16]',
  github: 'bg-[#24292f] before:bg-white/[.16]',
  dropbox: 'bg-[#3984ff] before:bg-black/[.16]',
};

const brandStrokeStyles: Record<SocialButtonBrand, string> = {
  apple: 'text-black',
  twitter: 'text-black',
  google: '',
  facebook: '',
  linkedin: '',
  github: 'text-[#24292f]',
  dropbox: '',
};

type SocialButtonSharedProps = {
  brand?: SocialButtonBrand;
  mode?: SocialButtonMode;
};

type SocialButtonProps = SocialButtonSharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const SocialButtonRoot = React.forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ asChild, children, mode = 'filled', brand = 'google', className, ...rest }, forwardedRef) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';

    const sharedProps: SocialButtonSharedProps = {
      mode,
      brand,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [SOCIAL_BUTTON_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'relative inline-flex h-10 items-center justify-center gap-3.5 whitespace-nowrap rounded-[10px] px-4 text-sm font-medium outline-none',
          'transition duration-200 ease-out',
          'focus:outline-none',
          mode === 'filled' && [
            'text-white',
            'before:pointer-events-none before:absolute before:inset-0 before:rounded-[10px] before:opacity-0 before:transition before:duration-200 before:ease-out',
            'hover:before:opacity-100',
            'focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)]',
            brandFilledStyles[brand],
          ],
          mode === 'stroke' && [
            'bg-bg-white-0 text-text-strong-950 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] ring-1 ring-inset ring-stroke-soft-200',
            'hover:bg-bg-weak-50 hover:shadow-none hover:ring-transparent',
            'focus-visible:shadow-[0_0_0_2px_var(--color-bg-white-0),0_0_0_4px_var(--color-neutral-alpha-24)] focus-visible:ring-stroke-strong-950',
            brandStrokeStyles[brand],
          ],
          className
        )}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  }
);
SocialButtonRoot.displayName = SOCIAL_BUTTON_ROOT_NAME;

function SocialButtonIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T, SocialButtonSharedProps>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn('relative z-10 -mx-1.5 size-5 shrink-0', className)}
      {...rest}
    />
  );
}
SocialButtonIcon.displayName = SOCIAL_BUTTON_ICON_NAME;

export { SocialButtonRoot as Root, SocialButtonIcon as Icon };
