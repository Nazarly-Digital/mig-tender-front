'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as DialogPrimitives from '@radix-ui/react-dialog';
import {
  RiArrowRightSLine,
  RiCloseFill,
  RiHeadphoneLine,
  RiMenu3Fill,
  RiSearch2Line,
  RiSettings2Line,
} from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import useBreakpoint from '@/shared/lib/use-breakpoint';
import { CompanySwitchMobile } from '@/shared/components/company-switch';
import { MoveMoneyButton } from '@/shared/components/move-money-button';
import { navigationLinks } from '@/shared/components/sidebar';
import { useSessionStore } from '@/entities/auth/model/store';
import * as TopbarItemButton from '@/shared/components/topbar-item-button';
import { UserButtonMobile } from '@/shared/components/user-button';

export default function MobileMenu() {
  const { lg } = useBreakpoint();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  const isDeveloper = user?.role === 'developer';

  const visibleLinks = navigationLinks.filter(
    (link) => !link.developerOnly || isDeveloper,
  );

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (lg) setOpen(false);
  }, [lg]);

  return (
    <DialogPrimitives.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitives.Trigger asChild>
        <TopbarItemButton.Root>
          <TopbarItemButton.Icon as={RiMenu3Fill} />
        </TopbarItemButton.Root>
      </DialogPrimitives.Trigger>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay
          className={cn(
            'fixed inset-0 z-50 origin-top-right lg:hidden',
            // animation
            'data-[state=closed]:duration-200 data-[state=closed]:animate-out',
          )}
        >
          <DialogPrimitives.Content
            className={cn(
              'flex size-full origin-top-right flex-col overflow-auto bg-white focus:outline-none',
              // animation
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:ease-out data-[state=open]:ease-out',
              'data-[state=closed]:duration-200 data-[state=open]:duration-200',
              'data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            )}
          >
            <DialogPrimitives.Title className='sr-only'>
              Mobile Menu
            </DialogPrimitives.Title>
            <DialogPrimitives.Description className='sr-only'>
              This menu provides mobile navigation options, including access to
              main navigation links, favorite projects, search, and user
              settings.
            </DialogPrimitives.Description>

            <div className='flex h-[60px] w-full shrink-0 items-center border-b border-gray-200 px-4'>
              <div className='relative flex-1 opacity-0 pointer-events-none'>
                <RiSearch2Line className='absolute left-0 top-1/2 size-6 -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Поиск...'
                  className='h-6 w-full pl-9 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:outline-none'
                />
              </div>
              <div className='flex gap-3'>
                {/* <div className='flex gap-1'>
                  <TopbarItemButton.Root>
                    <TopbarItemButton.Icon as={RiHeadphoneLine} />
                  </TopbarItemButton.Root>
                  <TopbarItemButton.Root>
                    <TopbarItemButton.Icon as={RiSettings2Line} />
                  </TopbarItemButton.Root>
                </div> */}
                <div className='flex w-1 shrink-0 items-center before:h-full before:w-px before:bg-gray-200' />
                <DialogPrimitives.Close asChild>
                  <TopbarItemButton.Root>
                    <TopbarItemButton.Icon as={RiCloseFill} />
                  </TopbarItemButton.Root>
                </DialogPrimitives.Close>
              </div>
            </div>
            {/* <CompanySwitchMobile /> */}

            <div className='flex flex-1 flex-col py-6'>
              <div className='flex flex-col gap-5'>
                {visibleLinks.map(({ icon: Icon, label, developerLabel, href, developerHref }, i) => {
                  const displayLabel = isDeveloper && developerLabel ? developerLabel : label;
                  const displayHref = isDeveloper && developerHref ? developerHref : href;
                  return (
                    <Link
                      key={i}
                      href={displayHref}
                      aria-current={pathname === displayHref ? 'page' : undefined}
                      className={cn(
                        'group relative flex w-full items-center gap-2.5 whitespace-nowrap px-5 text-gray-500',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-[22px] shrink-0 text-gray-500 transition-colors duration-150',
                          'group-aria-[current=page]:text-blue-600',
                        )}
                      />
                      <div className='flex-1 text-sm font-medium text-gray-900'>{displayLabel}</div>
                      <div
                        className={cn(
                          'absolute left-0 top-1/2 h-5 w-1 origin-left -translate-y-1/2 rounded-r-full bg-blue-600 transition-transform duration-150',
                          {
                            'scale-0': pathname !== displayHref,
                          },
                        )}
                      />
                      <RiArrowRightSLine className='size-6 text-gray-300' />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* <div className='grid border-y border-gray-200 p-4'>
              <MoveMoneyButton />
            </div> */}

            {/* <div className='p-2'>
              <UserButtonMobile />
            </div> */}
          </DialogPrimitives.Content>
        </DialogPrimitives.Overlay>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
