'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  SecurityCheckIcon,
  SquareLock01Icon,
  SquareUnlock01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

import { TableSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import { PageHeader } from '@/shared/components/page-header';
import {
  useAdminUsers,
  useBlockUser,
  useAdminVerifyBroker,
} from '@/features/admin';
import type { AdminUser } from '@/shared/types/admin';

// --- Helpers ---

const ROLE_LABELS: Record<string, string> = {
  developer: 'Девелопер',
  broker: 'Брокер',
  admin: 'Админ',
};

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { error?: string; detail?: string } } };
  return err.response?.data?.error ?? err.response?.data?.detail ?? 'Произошла ошибка';
}

// --- Block Confirm Modal ---

function BlockConfirmModal({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const blockUser = useBlockUser();

  if (!user) return null;

  const handleConfirm = () => {
    blockUser.mutate(user.id, {
      onSuccess: () => {
        toast.success(
          user.is_blocked
            ? `${user.first_name} ${user.last_name} разблокирован`
            : `${user.first_name} ${user.last_name} заблокирован`,
        );
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(getApiError(error));
      },
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header
          title={user.is_blocked ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
          description={`${user.first_name} ${user.last_name} (${user.email})`}
        />
        <Modal.Body>
          <p className='text-[13px] text-gray-500'>
            {user.is_blocked
              ? 'Пользователь сможет снова войти в систему и использовать платформу.'
              : 'Пользователь не сможет войти в систему и использовать платформу.'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant={user.is_blocked ? 'primary' : 'destructive'}
            size='small'
            onClick={handleConfirm}
            disabled={blockUser.isPending}
          >
            {blockUser.isPending
              ? 'Загрузка...'
              : user.is_blocked
                ? 'Разблокировать'
                : 'Заблокировать'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Verify Broker Modal ---

function VerifyBrokerModal({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const verifyBroker = useAdminVerifyBroker();

  if (!user) return null;

  const handleConfirm = () => {
    verifyBroker.mutate(user.id, {
      onSuccess: () => {
        toast.success(`Брокер ${user.first_name} ${user.last_name} верифицирован`);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(getApiError(error));
      },
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header
          title='Верифицировать брокера?'
          description={`${user.first_name} ${user.last_name} (${user.email})`}
        />
        <Modal.Body>
          <p className='text-[13px] text-gray-500'>
            Брокер получит статус верифицированного и сможет участвовать в аукционах.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant='primary'
            size='small'
            onClick={handleConfirm}
            disabled={verifyBroker.isPending}
          >
            {verifyBroker.isPending ? 'Загрузка...' : 'Верифицировать'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Main Page ---

type RoleFilter = 'all' | 'developer' | 'broker';

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>('all');
  const [blockTarget, setBlockTarget] = React.useState<AdminUser | null>(null);
  const [verifyTarget, setVerifyTarget] = React.useState<AdminUser | null>(null);

  const params = {
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ordering: '-created_at',
    page_size: 50,
  };

  const { data, isLoading } = useAdminUsers(params);
  const users = data?.results ?? [];

  const filters: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'developer', label: 'Девелоперы' },
    { value: 'broker', label: 'Брокеры' },
  ];

  return (
    <div className='w-full px-8 py-8'>
      <PageHeader
        title='Пользователи'
        description='Управление пользователями платформы'
      />

      {/* Filters — flat underline tab bar */}
      <div className='mt-6 flex items-center gap-1 border-b border-gray-100'>
        {filters.map((f) => (
          <button
            key={f.value}
            type='button'
            onClick={() => setRoleFilter(f.value)}
            className={
              roleFilter === f.value
                ? 'border-b-2 border-blue-600 px-3 pb-2.5 text-[13px] font-medium text-gray-900'
                : 'border-b-2 border-transparent px-3 pb-2.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600'
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className='mt-6'>
          <TableSkeleton rows={8} cols={6} />
        </div>
      ) : users.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 py-20'>
          <HugeiconsIcon icon={UserIcon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-300' />
          <span className='text-[13px] font-medium text-gray-500'>Нет пользователей</span>
        </div>
      ) : (
        <div className='mt-6 overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-gray-50/50'>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Пользователь
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Email
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Роль
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Статус
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Регистрация
                </th>
                <th className='px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className='border-b border-gray-100 last:border-0 transition-colors hover:bg-blue-50/20'
                >
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] font-medium text-gray-900'>
                      {user.first_name} {user.last_name}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500'>{user.email}</span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600'>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center gap-1.5'>
                      {user.is_blocked ? (
                        <span className='inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-700'>
                          <span className='inline-block size-1.5 rounded-full bg-red-500 mr-1' />
                          Заблокирован
                        </span>
                      ) : (
                        <span className='inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700'>
                          <span className='inline-block size-1.5 rounded-full bg-emerald-500 mr-1' />
                          Активен
                        </span>
                      )}
                      {user.role === 'broker' && (
                        user.is_verified ? (
                          <span className='rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700'>
                            Верифицирован
                          </span>
                        ) : (
                          <span className='rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700'>
                            Не верифицирован
                          </span>
                        )
                      )}
                    </div>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-400'>
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center justify-end gap-1.5'>
                      {user.role === 'broker' && !user.is_verified && (
                        <FancyButton.Root variant='basic' size='xsmall' onClick={() => setVerifyTarget(user)}>
                          <HugeiconsIcon icon={SecurityCheckIcon} size={16} color='currentColor' strokeWidth={1.5} />
                          Верифицировать
                        </FancyButton.Root>
                      )}
                      <FancyButton.Root variant='basic' size='xsmall' onClick={() => setBlockTarget(user)}>
                        {user.is_blocked ? (
                          <HugeiconsIcon icon={SquareUnlock01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                        ) : (
                          <HugeiconsIcon icon={SquareLock01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                        )}
                        {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                      </FancyButton.Root>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <BlockConfirmModal
        user={blockTarget}
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null);
        }}
      />
      <VerifyBrokerModal
        user={verifyTarget}
        open={!!verifyTarget}
        onOpenChange={(open) => {
          if (!open) setVerifyTarget(null);
        }}
      />
    </div>
  );
}
