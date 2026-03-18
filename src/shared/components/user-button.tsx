'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RiLogoutBoxRLine } from '@remixicon/react';

import { cnExt } from '@/shared/lib/cn';
import * as Avatar from '@/shared/ui/avatar';
import * as Divider from '@/shared/ui/divider';
import * as Dropdown from '@/shared/ui/dropdown';
import { useSessionStore } from '@/entities/auth/model/store';

const ROLE_LABELS: Record<string, string> = {
  developer: 'Девелопер',
  broker: 'Брокер',
};

export function UserButton({ className }: { className?: string }) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '—';
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        className={cnExt(
          'flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg p-2 text-left outline-none transition-colors duration-100 hover:bg-[#F3F4F6] focus:outline-none',
          className,
        )}
      >
        <Avatar.Root size='32' color='blue' />
        <div
          className='flex min-w-0 flex-1 flex-col'
          data-hide-collapsed
        >
          <div className='truncate text-[13px] font-medium text-[#111827]'>{fullName}</div>
          {roleLabel && (
            <div className='truncate text-[11px] text-[#6B7280]'>{roleLabel}</div>
          )}
        </div>
      </Dropdown.Trigger>

      <Dropdown.Content side='right' sideOffset={16} align='end'>
        <div className='px-3 py-2'>
          <div className='text-[13px] font-medium text-[#111827]'>{fullName}</div>
          {user?.email && (
            <div className='text-[11px] text-[#9CA3AF]'>{user.email}</div>
          )}
        </div>
        <Divider.Root variant='line-spacing' />
        <Dropdown.Group>
          <Dropdown.Item onSelect={handleLogout} className='text-error-base'>
            <Dropdown.ItemIcon as={RiLogoutBoxRLine} />
            Выйти
          </Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
