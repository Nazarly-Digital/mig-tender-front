'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  Award01Icon,
  Building03Icon,
  PlusSignSquareIcon,
  AnalyticsUpIcon,
  File01Icon,
  UserIcon,
  SecurityCheckIcon,
  Wallet01Icon,
  HeadphonesIcon,
  Logout01Icon,
  CogIcon,
  Coins01Icon,
  CatalogueIcon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/shared/lib/cn';
import * as Modal from '@/shared/ui/modal';
import * as FancyButton from '@/shared/ui/fancy-button';
import { useSessionStore, isUserAdmin, isUserDeveloper } from '@/entities/auth/model/store';

// Returns true only for the most specific matching link.
// e.g. on /properties/create: '/properties/create' wins over '/properties'
function isActivePath(pathname: string, href: string, allHrefs: string[]): boolean {
  if (pathname !== href && !pathname.startsWith(href + '/')) return false;
  return !allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(href + '/') &&
      (pathname === other || pathname.startsWith(other + '/')),
  );
}

type NavigationLink = {
  icon: typeof Home01Icon;
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
  { icon: Home01Icon, label: 'Главная', href: '/dashboard' },
  { icon: Award01Icon, label: 'Аукционы', developerLabel: 'Мои аукционы', href: '/auctions' },
  { icon: CatalogueIcon, label: 'Каталог объектов', href: '/objects', brokerOnly: true },
  { icon: Building03Icon, label: 'Мои объекты', href: '/properties', developerOnly: true },
  { icon: PlusSignSquareIcon, label: 'Создать объект', href: '/properties/create', developerOnly: true },
  { icon: UserIcon, label: 'Личный кабинет', href: '/cabinet', brokerOnly: true },
  { icon: Coins01Icon, label: 'Сделки', developerLabel: 'Фиксация сделки', href: '/deals' },
  { icon: Wallet01Icon, label: 'Выплаты / история', href: '/payments', brokerOnly: true },
  { icon: AnalyticsUpIcon, label: 'Аналитика', href: '/analytics', developerOnly: true },
  { icon: File01Icon, label: 'Документы', href: '/documents' },
  { icon: UserIcon, label: 'Пользователи', href: '/admin/users', adminOnly: true },
  { icon: SecurityCheckIcon, label: 'Модерация', href: '/admin/properties', adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);
  const isDeveloper = isUserDeveloper(user);
  const isAdmin = isUserAdmin(user);

  const adminNavLinks: NavigationLink[] = [
    { icon: Home01Icon, label: 'Главная', href: '/dashboard' },
    { icon: Building03Icon, label: 'Объекты', href: '/objects' },
    { icon: UserIcon, label: 'Пользователи', href: '/admin/users' },
    // { icon: AnalyticsUpIcon, label: 'Аналитика', href: '/analytics' },
    // { icon: File01Icon, label: 'Документы', href: '/documents' },
  ];

  const visibleLinks = navigationLinks.filter((link) => {
    if (link.adminOnly && !isAdmin) return false;
    if (link.developerOnly && !isDeveloper) return false;
    if (link.brokerOnly && isDeveloper) return false;
    return true;
  });

  const mainLinks = isAdmin ? adminNavLinks : visibleLinks.filter((link) => !link.adminOnly);
  const adminLinks = isAdmin ? [] : visibleLinks.filter((link) => link.adminOnly);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '—';
  const initials = user
    ? [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
    : '?';

  const roleLabel = isAdmin ? 'Администратор' : isDeveloper ? 'Застройщик' : 'Брокер';

  const verificationStatus = user?.broker?.verification_status;
  const statusLabel = verificationStatus === 'accepted'
    ? 'Верифицирован'
    : verificationStatus === 'rejected'
      ? 'Отклонён'
      : verificationStatus === 'pending'
        ? 'На проверке'
        : null;
  const statusColor = verificationStatus === 'accepted'
    ? 'text-emerald-600'
    : verificationStatus === 'rejected'
      ? 'text-red-600'
      : 'text-amber-600';
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-gray-200 bg-gradient-to-b from-white to-blue-50/30 lg:flex">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <Image src="/images/logo.svg" alt="MIG Tender" width={120} height={36} className="h-8 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto py-4">
          {/* Main section */}
          <div className="px-3 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-3">
              Навигация
            </span>
          </div>
          <div className="flex flex-col gap-0.5 px-3">
            {mainLinks.map(({ icon, label, developerLabel, href, developerHref, disabled }, i) => {
              const displayLabel = isDeveloper && developerLabel ? developerLabel : label;
              const displayHref = isDeveloper && developerHref ? developerHref : href;
              const allHrefs = mainLinks.map((l) => isDeveloper && l.developerHref ? l.developerHref : l.href);
              const isActive = isActivePath(pathname, displayHref, allHrefs);

              return (
                <Link
                  key={i}
                  href={displayHref}
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={disabled}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                    'aria-disabled:pointer-events-none aria-disabled:opacity-30',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={20}
                    color="currentColor"
                    strokeWidth={1.5}
                    className="shrink-0"
                  />
                  <span className="truncate">{displayLabel}</span>
                </Link>
              );
            })}
          </div>

          {/* Admin section */}
          {adminLinks.length > 0 && (
            <>
              <div className="px-3 mb-1 mt-6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-3">
                  Администрирование
                </span>
              </div>
              <div className="flex flex-col gap-0.5 px-3">
                {adminLinks.map(({ icon, label, href, disabled }, i) => {
                  const allAdminHrefs = adminLinks.map((l) => l.href);
                  const isActive = isActivePath(pathname, href, allAdminHrefs);

                  return (
                    <Link
                      key={i}
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      aria-disabled={disabled}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                        'aria-disabled:pointer-events-none aria-disabled:opacity-30',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100',
                      )}
                    >
                      <HugeiconsIcon
                        icon={icon}
                        size={20}
                        color="currentColor"
                        strokeWidth={1.5}
                        className="shrink-0"
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-gray-200 py-2 px-3">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/settings/profile-settings"
              aria-disabled
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                'aria-disabled:pointer-events-none aria-disabled:opacity-30',
                pathname === '/settings/profile-settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <HugeiconsIcon icon={CogIcon} size={20} color="currentColor" strokeWidth={1.5} className="shrink-0" />
              <span className="truncate">Настройки</span>
            </Link>
            <Link
              href="#"
              aria-disabled
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 aria-disabled:pointer-events-none aria-disabled:opacity-30"
            >
              <HugeiconsIcon icon={HeadphonesIcon} size={20} color="currentColor" strokeWidth={1.5} className="shrink-0" />
              <span className="truncate">Поддержка</span>
            </Link>
          </div>
        </div>

        {/* User profile */}
        <div className="group border-t border-gray-200 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
              {initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium text-gray-900">
                {fullName}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[11px] text-gray-500">
                  {roleLabel}
                </span>
                {statusLabel && (
                  <span className={`text-[10px] font-medium ${statusColor}`}>
                    · {statusLabel}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="shrink-0 cursor-pointer rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
              title="Выйти"
            >
              <HugeiconsIcon icon={Logout01Icon} size={18} color="currentColor" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer */}
      <div className="hidden w-[240px] shrink-0 lg:block" />

      {/* Logout confirmation modal */}
      <Modal.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
        <Modal.Content>
          <Modal.Header
            title="Выйти из аккаунта?"
            description="Вы уверены, что хотите выйти из системы?"
          />
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant="basic" size="small">
                Отмена
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root variant="destructive" size="small" onClick={handleLogout}>
              Выйти
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
