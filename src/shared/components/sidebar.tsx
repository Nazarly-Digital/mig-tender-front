'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  RiAddLine,
  RiAuctionLine,
  RiBarChartBoxLine,
  RiBuilding2Line,
  RiFileLine,
  RiHandCoinLine,
  RiHeadphoneLine,
  RiLayoutGridLine,
  RiSettings2Line,
  RiShieldCheckLine,
  RiUserLine,
  RiWalletLine,
} from '@remixicon/react';
import { useHotkeys } from 'react-hotkeys-hook';

import { cn } from '@/shared/lib/cn';
import { UserButton } from '@/shared/components/user-button';
import { useSessionStore } from '@/entities/auth/model/store';

type NavigationLink = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  developerLabel?: string;
  href: string;
  developerHref?: string;
  disabled?: boolean;
  developerOnly?: boolean;
  brokerOnly?: boolean;
  adminOnly?: boolean;
};

export const navigationLinks: NavigationLink[] = [
  { icon: RiLayoutGridLine, label: 'Главная', href: '/dashboard' },
  { icon: RiAuctionLine, label: 'Аукционы', developerLabel: 'Мои аукционы', href: '/auctions' },
  { icon: RiBuilding2Line, label: 'Каталог объектов', href: '/catalog', brokerOnly: true },
  { icon: RiBuilding2Line, label: 'Мои объекты', href: '/properties', developerOnly: true },
  { icon: RiAddLine, label: 'Создать объект', href: '/properties/create', developerOnly: true },
  { icon: RiUserLine, label: 'Личный кабинет', href: '/cabinet', brokerOnly: true },
  { icon: RiHandCoinLine, label: 'Сделки', developerLabel: 'Фиксация сделки', href: '/deals' },
  { icon: RiWalletLine, label: 'Выплаты / история', href: '/payments', brokerOnly: true },
  { icon: RiBarChartBoxLine, label: 'Аналитика', href: '/analytics', developerOnly: true },
  { icon: RiFileLine, label: 'Документы', href: '/documents' },
  { icon: RiUserLine, label: 'Пользователи', href: '/admin/users', adminOnly: true },
  { icon: RiShieldCheckLine, label: 'Модерация', href: '/admin/properties', adminOnly: true },
];

function useCollapsedState({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
}): {
  collapsed: boolean;
  sidebarRef: React.RefObject<HTMLDivElement>;
} {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  useHotkeys(
    ['ctrl+b', 'meta+b'],
    () => setCollapsed((prev) => !prev),
    { preventDefault: true },
    [collapsed],
  );

  React.useEffect(() => {
    if (!sidebarRef.current) return;

    const elementsToHide = sidebarRef.current.querySelectorAll(
      '[data-hide-collapsed]',
    );

    const listeners: { el: Element; listener: EventListener }[] = [];

    elementsToHide.forEach((el) => {
      const hideListener = () => {
        el.classList.add('hidden');
        el.classList.remove('transition', 'duration-200');
      };

      const showListener = () => {
        el.classList.remove('transition', 'duration-200');
      };

      if (collapsed) {
        el.classList.add('opacity-0', 'transition', 'duration-200');
        el.addEventListener('transitionend', hideListener, { once: true });
        listeners.push({ el, listener: hideListener });
      } else {
        el.classList.add('transition', 'duration-200');
        el.classList.remove('hidden');
        setTimeout(() => {
          el.classList.remove('opacity-0');
        }, 1);
        el.addEventListener('transitionend', showListener, { once: true });
        listeners.push({ el, listener: showListener });
      }
    });

    return () => {
      listeners.forEach(({ el, listener }) => {
        el.removeEventListener('transitionend', listener);
      });
    };
  }, [collapsed]);

  return { collapsed, sidebarRef };
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn('flex items-center gap-2.5 px-5 py-5', {
        'justify-center px-2': collapsed,
      })}
    >
      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#111827]'>
        <Image src='/images/logo-icon.svg' alt='' width={18} height={18} className='size-[18px]' />
      </div>
      <span className='text-[15px] font-semibold tracking-tight text-[#111827]' data-hide-collapsed>
        MIG Tender
      </span>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  disabled,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={disabled}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[#6B7280]',
        'transition-colors duration-100',
        'hover:bg-[#F3F4F6] hover:text-[#374151]',
        'aria-[current=page]:bg-[#F3F4F6] aria-[current=page]:text-[#111827]',
        'aria-disabled:pointer-events-none aria-disabled:opacity-30',
        {
          'w-9 justify-center px-0': collapsed,
          'w-full': !collapsed,
        },
      )}
    >
      <Icon
        className={cn(
          'size-[18px] shrink-0 transition-colors duration-100',
          isActive ? 'text-[#111827]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]',
        )}
      />
      <span
        className={cn(
          'text-[13.5px] leading-5',
          isActive && 'font-medium',
        )}
        data-hide-collapsed
      >
        {label}
      </span>
    </Link>
  );
}

function NavigationMenu({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  const isDeveloper = user?.role === 'developer';
  const isAdmin = user?.role === 'admin';

  const visibleLinks = navigationLinks.filter(
    (link) => {
      if (link.adminOnly && !isAdmin) return false;
      if (link.developerOnly && !isDeveloper) return false;
      if (link.brokerOnly && isDeveloper) return false;
      return true;
    },
  );

  return (
    <div className='space-y-2'>
      <div
        className={cn(
          'px-2.5 text-[11px] font-medium uppercase tracking-widest text-[#9CA3AF]',
          { 'px-0 text-center': collapsed },
        )}
      >
        <span data-hide-collapsed>Меню</span>
      </div>
      <div className='space-y-0.5'>
        {visibleLinks.map(({ icon, label, developerLabel, href, developerHref, disabled }, i) => {
          const displayLabel = isDeveloper && developerLabel ? developerLabel : label;
          const displayHref = isDeveloper && developerHref ? developerHref : href;
          return (
            <NavLink
              key={i}
              href={displayHref}
              icon={icon}
              label={displayLabel}
              isActive={pathname === displayHref}
              disabled={disabled}
              collapsed={collapsed}
            />
          );
        })}
      </div>
    </div>
  );
}

function SettingsAndSupport({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  const links = [
    {
      href: '/settings/profile-settings',
      icon: RiSettings2Line,
      label: 'Настройки',
      disabled: true,
    },
    {
      href: '#',
      icon: RiHeadphoneLine,
      label: 'Поддержка',
      disabled: true,
    },
  ];

  return (
    <div className='space-y-0.5'>
      {links.map(({ icon, label, href, disabled }, i) => (
        <NavLink
          key={i}
          href={href}
          icon={icon}
          label={label}
          isActive={pathname.startsWith(href)}
          disabled={disabled}
          collapsed={collapsed}
        />
      ))}
    </div>
  );
}

function UserProfile({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('px-3 py-3', { 'px-2': collapsed })}>
      <UserButton
        className={cn('transition-all duration-200', {
          'w-auto': collapsed,
        })}
      />
    </div>
  );
}

export default function Sidebar({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
}) {
  const { collapsed, sidebarRef } = useCollapsedState({ defaultCollapsed });

  return (
    <>
      <div
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-full overflow-hidden border-r border-[#E5E7EB] bg-white transition-all duration-200 ease-out lg:block',
          {
            'w-[72px]': collapsed,
            'w-[248px]': !collapsed,
            '[&_[data-hide-collapsed]]:hidden': !collapsed
              ? false
              : defaultCollapsed,
          },
        )}
      >
        <div
          ref={sidebarRef}
          className='flex h-full w-[248px] min-w-[248px] flex-col'
        >
          <SidebarBrand collapsed={collapsed} />

          <nav
            className={cn('flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-2', {
              'px-[14px]': collapsed,
            })}
          >
            <NavigationMenu collapsed={collapsed} />
          </nav>

          <div className={cn('px-3 pb-1', { 'px-[14px]': collapsed })}>
            <SettingsAndSupport collapsed={collapsed} />
          </div>

          <div className='mx-3 border-t border-[#E5E7EB]' />

          <UserProfile collapsed={collapsed} />
        </div>
      </div>

      {/* placeholder for fixed sidebar */}
      <div
        className={cn('hidden shrink-0 lg:block', {
          'w-[248px]': !collapsed,
          'w-[72px]': collapsed,
        })}
      />
    </>
  );
}
