'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  RiUserLine,
  RiShieldCheckLine,
  RiForbidLine,
  RiCheckLine,
  RiLockLine,
  RiLockUnlockLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Button from '@/shared/ui/button';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import * as SegmentedControl from '@/shared/ui/segmented-control';
import * as StatusBadge from '@/shared/ui/status-badge';
import * as Table from '@/shared/ui/table';
import { PageHeader } from '@/shared/components/page-header';
import {
  useAdminUsers,
  useBlockUser,
  useAdminVerifyBroker,
} from '@/features/admin';
import type { AdminUser } from '@/shared/types/admin';

// --- Helpers ---

const ROLE_LABELS: Record<string, { label: string; color: 'blue' | 'orange' | 'gray' | 'purple' }> = {
  developer: { label: 'Девелопер', color: 'blue' },
  broker: { label: 'Брокер', color: 'orange' },
  admin: { label: 'Админ', color: 'purple' },
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
          icon={user.is_blocked ? RiLockUnlockLine : RiForbidLine}
          title={user.is_blocked ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
          description={`${user.first_name} ${user.last_name} (${user.email})`}
        />
        <Modal.Body>
          <p className='text-paragraph-sm text-text-sub-600'>
            {user.is_blocked
              ? 'Пользователь сможет снова войти в систему и использовать платформу.'
              : 'Пользователь не сможет войти в систему и использовать платформу.'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root variant='neutral' mode='stroke' type='button'>
              Отмена
            </Button.Root>
          </Modal.Close>
          <FancyButton.Root
            variant={user.is_blocked ? 'primary' : 'neutral'}
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
          icon={RiShieldCheckLine}
          title='Верифицировать брокера?'
          description={`${user.first_name} ${user.last_name} (${user.email})`}
        />
        <Modal.Body>
          <p className='text-paragraph-sm text-text-sub-600'>
            Брокер получит статус верифицированного и сможет участвовать в аукционах.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root variant='neutral' mode='stroke' type='button'>
              Отмена
            </Button.Root>
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

  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Пользователи'
        description='Управление пользователями платформы'
        icon={RiUserLine}
      />

      {/* Filters */}
      <SegmentedControl.Root
        value={roleFilter}
        onValueChange={(v) => setRoleFilter(v as RoleFilter)}
        className='w-fit'
      >
        <SegmentedControl.List>
          <SegmentedControl.Trigger value='all'>Все</SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='developer'>
            Девелоперы
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='broker'>
            Брокеры
          </SegmentedControl.Trigger>
        </SegmentedControl.List>
      </SegmentedControl.Root>

      {/* Content */}
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center py-20'>
          <div className='text-paragraph-sm text-text-soft-400'>
            Загрузка...
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20'>
          <div className='flex size-12 items-center justify-center rounded-full bg-bg-weak-50'>
            <RiUserLine className='size-6 text-text-soft-400' />
          </div>
          <div className='text-label-sm text-text-sub-600'>
            Нет пользователей
          </div>
        </div>
      ) : (
        <div className='rounded-2xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Пользователь</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Роль</Table.Head>
                <Table.Head>Статус</Table.Head>
                <Table.Head>Регистрация</Table.Head>
                <Table.Head className='w-[200px] text-right'>
                  Действия
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((user) => {
                const roleCfg = ROLE_LABELS[user.role] ?? {
                  label: user.role,
                  color: 'gray' as const,
                };

                return (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <div className='text-label-sm text-text-strong-950'>
                        {user.first_name} {user.last_name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className='text-paragraph-sm text-text-sub-600'>
                        {user.email}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge.Root
                        variant='lighter'
                        color={roleCfg.color}
                        size='small'
                      >
                        {roleCfg.label}
                      </Badge.Root>
                    </Table.Cell>
                    <Table.Cell>
                      <div className='flex flex-wrap items-center gap-1.5'>
                        {user.is_blocked ? (
                          <StatusBadge.Root variant='light' status='failed'>
                            <StatusBadge.Dot />
                            Заблокирован
                          </StatusBadge.Root>
                        ) : (
                          <StatusBadge.Root variant='light' status='completed'>
                            <StatusBadge.Dot />
                            Активен
                          </StatusBadge.Root>
                        )}
                        {user.role === 'broker' && (
                          user.is_verified ? (
                            <Badge.Root
                              variant='light'
                              color='green'
                              size='small'
                            >
                              Верифицирован
                            </Badge.Root>
                          ) : (
                            <Badge.Root
                              variant='light'
                              color='orange'
                              size='small'
                            >
                              Не верифицирован
                            </Badge.Root>
                          )
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className='text-paragraph-sm text-text-sub-600'>
                        {formatDate(user.created_at)}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className='flex items-center justify-end gap-2'>
                        {/* Verify broker */}
                        {user.role === 'broker' && !user.is_verified && (
                          <Button.Root
                            variant='neutral'
                            mode='stroke'
                            size='xsmall'
                            onClick={() => setVerifyTarget(user)}
                          >
                            <Button.Icon as={RiShieldCheckLine} />
                            Верифицировать
                          </Button.Root>
                        )}

                        {/* Block / unblock */}
                        <Button.Root
                          variant='neutral'
                          mode='stroke'
                          size='xsmall'
                          onClick={() => setBlockTarget(user)}
                        >
                          <Button.Icon
                            as={user.is_blocked ? RiLockUnlockLine : RiLockLine}
                          />
                          {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                        </Button.Root>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
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
