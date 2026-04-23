'use client';

import * as React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  SecurityCheckIcon,
  SquareLock01Icon,
  SquareUnlock01Icon,
  Download01Icon,
  UserAdd01Icon,
  Edit02Icon,
} from '@hugeicons/core-free-icons';

import { TableSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import { PageHeader } from '@/shared/components/page-header';
import {
  useAdminUsers,
  useBlockUser,
  useAdminVerifyBroker,
  useAdminUpdateDeveloper,
  useAdminUpdateBroker,
} from '@/features/admin';
import type { AdminUser } from '@/shared/types/admin';
import {
  adminUpdateDeveloperSchema,
  type AdminUpdateDeveloperFormData,
  adminUpdateBrokerSchema,
  type AdminUpdateBrokerFormData,
} from '@/shared/lib/validations';

// --- Helpers ---

const ROLE_LABELS: Record<string, string> = {
  developer: 'Девелопер',
  broker: 'Брокер',
  admin: 'Админ',
};

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: unknown } };
  const data = err.response?.data;
  if (!data) return 'Произошла ошибка';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.detail === 'string') return obj.detail;
    // DRF field-level errors: { email: ["..."], company_name: ["..."] }
    const messages: string[] = [];
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) messages.push(...value.filter((v): v is string => typeof v === 'string'));
      else if (typeof value === 'string') messages.push(value);
    }
    if (messages.length) return messages.join('. ');
  }
  return 'Произошла ошибка';
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
    blockUser.mutate({ id: user.id, isActive: user.is_active === false }, {
      onSuccess: () => {
        toast.success(
          !user.is_active
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
          title={!user.is_active ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
          description={`${user.first_name} ${user.last_name} (${user.email})`}
        />
        <Modal.Body>
          <p className='text-[13px] text-gray-500'>
            {!user.is_active
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
            variant={!user.is_active ? 'primary' : 'destructive'}
            size='small'
            onClick={handleConfirm}
            disabled={blockUser.isPending}
          >
            {blockUser.isPending
              ? 'Загрузка...'
              : !user.is_active
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

// --- Edit Developer Modal ---

function EditDeveloperModal({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateDeveloper = useAdminUpdateDeveloper();

  const form = useForm<AdminUpdateDeveloperFormData>({
    resolver: zodResolver(adminUpdateDeveloperSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      companyName: '',
      innNumber: '',
      phoneNumber: '',
    },
  });

  React.useEffect(() => {
    if (open && user) {
      form.reset({
        email: user.email ?? '',
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        companyName: user.developer?.company_name ?? '',
        innNumber: user.developer?.inn_number ?? '',
        phoneNumber: user.developer?.phone_number ?? '',
      });
    }
  }, [open, user, form]);

  if (!user) return null;

  const onSubmit = form.handleSubmit((data) => {
    // Send only changed fields (PATCH semantics)
    const payload: {
      email?: string;
      first_name?: string;
      last_name?: string;
      company_name?: string;
      inn_number?: string;
      phone_number?: string;
    } = {};
    if (data.email !== user.email) payload.email = data.email;
    if (data.firstName !== (user.first_name ?? '')) payload.first_name = data.firstName;
    if (data.lastName !== (user.last_name ?? '')) payload.last_name = data.lastName;
    if (data.companyName !== (user.developer?.company_name ?? '')) {
      payload.company_name = data.companyName;
    }
    if (data.innNumber !== (user.developer?.inn_number ?? '')) {
      payload.inn_number = data.innNumber;
    }
    if (data.phoneNumber !== (user.developer?.phone_number ?? '')) {
      payload.phone_number = data.phoneNumber;
    }

    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    updateDeveloper.mutate(
      { id: user.id, data: payload },
      {
        onSuccess: () => {
          toast.success('Данные девелопера обновлены');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  });

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          title='Редактирование девелопера'
          description={`${user.first_name} ${user.last_name}`.trim() || user.email}
        />
        <form onSubmit={onSubmit}>
          <Modal.Body>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='ed-email'>
                  Email <Label.Asterisk />
                </Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input
                      id='ed-email'
                      type='email'
                      placeholder='example@mail.com'
                      {...form.register('email')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.email && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <Label.Root htmlFor='ed-firstName'>
                    Имя <Label.Asterisk />
                  </Label.Root>
                  <Input.Root hasError={!!form.formState.errors.firstName}>
                    <Input.Wrapper>
                      <Input.Input id='ed-firstName' type='text' placeholder='Имя' {...form.register('firstName')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {form.formState.errors.firstName && (
                    <span className='text-paragraph-xs text-error-base'>
                      {form.formState.errors.firstName.message}
                    </span>
                  )}
                </div>
                <div className='flex flex-col gap-1'>
                  <Label.Root htmlFor='ed-lastName'>
                    Фамилия <Label.Asterisk />
                  </Label.Root>
                  <Input.Root hasError={!!form.formState.errors.lastName}>
                    <Input.Wrapper>
                      <Input.Input id='ed-lastName' type='text' placeholder='Фамилия' {...form.register('lastName')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {form.formState.errors.lastName && (
                    <span className='text-paragraph-xs text-error-base'>
                      {form.formState.errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='ed-companyName'>
                  Название компании <Label.Asterisk />
                </Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input
                      id='ed-companyName'
                      type='text'
                      placeholder='ООО «Пример»'
                      {...form.register('companyName')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.companyName && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.companyName.message}
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='ed-innNumber'>ИНН</Label.Root>
                <Input.Root hasError={!!form.formState.errors.innNumber}>
                  <Input.Wrapper>
                    <Input.Input
                      id='ed-innNumber'
                      type='text'
                      inputMode='numeric'
                      maxLength={12}
                      placeholder='12 цифр'
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity(
                          'Убедитесь, что это значение ИИН содержит не более 12 символов.',
                        );
                      }}
                      onInput={(e) => {
                        e.currentTarget.setCustomValidity('');
                      }}
                      {...form.register('innNumber', {
                        setValueAs: (v: string) => (v ?? '').replace(/\D/g, ''),
                      })}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.innNumber && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.innNumber.message}
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='ed-phoneNumber'>Телефон</Label.Root>
                <Input.Root hasError={!!form.formState.errors.phoneNumber}>
                  <Input.Wrapper>
                    <Input.Input
                      id='ed-phoneNumber'
                      type='tel'
                      maxLength={20}
                      placeholder='+7 999 000 00 00'
                      {...form.register('phoneNumber')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.phoneNumber && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.phoneNumber.message}
                  </span>
                )}
              </div>

              {user.documents && user.documents.length > 0 && (
                <div className='flex flex-col gap-1'>
                  <Label.Root>Документы</Label.Root>
                  <div className='flex flex-wrap gap-2'>
                    {user.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50 whitespace-nowrap'
                      >
                        <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                        {doc.document_name || doc.doc_type}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root type='button' variant='basic' size='small'>
                Отмена
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              type='submit'
              variant='primary'
              size='small'
              disabled={updateDeveloper.isPending}
            >
              {updateDeveloper.isPending ? 'Сохранение...' : 'Сохранить'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Edit Broker Modal ---

function EditBrokerModal({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateBroker = useAdminUpdateBroker();

  const form = useForm<AdminUpdateBrokerFormData>({
    resolver: zodResolver(adminUpdateBrokerSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      innNumber: '',
      phoneNumber: '',
    },
  });

  React.useEffect(() => {
    if (open && user) {
      form.reset({
        email: user.email ?? '',
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        innNumber: user.broker?.inn_number ?? '',
        phoneNumber: user.broker?.phone_number ?? '',
      });
    }
  }, [open, user, form]);

  if (!user) return null;

  const onSubmit = form.handleSubmit((data) => {
    // Send only changed fields (PATCH semantics)
    const payload: {
      email?: string;
      first_name?: string;
      last_name?: string;
      inn_number?: string;
      phone_number?: string;
    } = {};
    if (data.email !== user.email) payload.email = data.email;
    if (data.firstName !== (user.first_name ?? '')) payload.first_name = data.firstName;
    if (data.lastName !== (user.last_name ?? '')) payload.last_name = data.lastName;
    if (data.innNumber !== (user.broker?.inn_number ?? '')) payload.inn_number = data.innNumber;
    if (data.phoneNumber !== (user.broker?.phone_number ?? '')) {
      payload.phone_number = data.phoneNumber;
    }

    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    updateBroker.mutate(
      { id: user.id, data: payload },
      {
        onSuccess: () => {
          toast.success('Данные брокера обновлены');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  });

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          title='Редактирование брокера'
          description={`${user.first_name} ${user.last_name}`.trim() || user.email}
        />
        <form onSubmit={onSubmit}>
          <Modal.Body>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='eb-email'>
                  Email <Label.Asterisk />
                </Label.Root>
                <Input.Root hasError={!!form.formState.errors.email}>
                  <Input.Wrapper>
                    <Input.Input
                      id='eb-email'
                      type='email'
                      placeholder='example@mail.com'
                      {...form.register('email')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.email && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <Label.Root htmlFor='eb-firstName'>
                    Имя <Label.Asterisk />
                  </Label.Root>
                  <Input.Root hasError={!!form.formState.errors.firstName}>
                    <Input.Wrapper>
                      <Input.Input
                        id='eb-firstName'
                        type='text'
                        placeholder='Имя'
                        {...form.register('firstName')}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {form.formState.errors.firstName && (
                    <span className='text-paragraph-xs text-error-base'>
                      {form.formState.errors.firstName.message}
                    </span>
                  )}
                </div>
                <div className='flex flex-col gap-1'>
                  <Label.Root htmlFor='eb-lastName'>
                    Фамилия <Label.Asterisk />
                  </Label.Root>
                  <Input.Root hasError={!!form.formState.errors.lastName}>
                    <Input.Wrapper>
                      <Input.Input
                        id='eb-lastName'
                        type='text'
                        placeholder='Фамилия'
                        {...form.register('lastName')}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {form.formState.errors.lastName && (
                    <span className='text-paragraph-xs text-error-base'>
                      {form.formState.errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='eb-innNumber'>ИНН</Label.Root>
                <Input.Root hasError={!!form.formState.errors.innNumber}>
                  <Input.Wrapper>
                    <Input.Input
                      id='eb-innNumber'
                      type='text'
                      inputMode='numeric'
                      maxLength={12}
                      placeholder='12 цифр'
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity(
                          'Убедитесь, что это значение ИИН содержит не более 12 символов.',
                        );
                      }}
                      onInput={(e) => {
                        e.currentTarget.setCustomValidity('');
                      }}
                      {...form.register('innNumber', {
                        setValueAs: (v: string) => (v ?? '').replace(/\D/g, ''),
                      })}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.innNumber && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.innNumber.message}
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='eb-phoneNumber'>Телефон</Label.Root>
                <Input.Root hasError={!!form.formState.errors.phoneNumber}>
                  <Input.Wrapper>
                    <Input.Input
                      id='eb-phoneNumber'
                      type='tel'
                      maxLength={20}
                      placeholder='+7 999 000 00 00'
                      {...form.register('phoneNumber')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.phoneNumber && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.phoneNumber.message}
                  </span>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root type='button' variant='basic' size='small'>
                Отмена
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              type='submit'
              variant='primary'
              size='small'
              disabled={updateBroker.isPending}
            >
              {updateBroker.isPending ? 'Сохранение...' : 'Сохранить'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
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
  const [editTarget, setEditTarget] = React.useState<AdminUser | null>(null);
  const [editBrokerTarget, setEditBrokerTarget] = React.useState<AdminUser | null>(null);

  const params = {
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ordering: '-created_at',
    page_size: 20,
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
        action={
          <Link href='/admin/users/new-developer'>
            <FancyButton.Root variant='primary' size='small'>
              <HugeiconsIcon icon={UserAdd01Icon} size={16} color='currentColor' strokeWidth={1.5} />
              Добавить девелопера
            </FancyButton.Root>
          </Link>
        }
      />

      {/* Filters — flat underline tab bar */}
      <div className='mt-6 flex items-center gap-1 border-b border-gray-100'>
        {filters.map((f) => (
          <button
            key={f.value}
            type='button'
            onClick={() => setRoleFilter(f.value)}
            className={
              `cursor-pointer ${roleFilter === f.value
                ? 'border-b-2 border-blue-600 px-3 pb-2.5 text-[13px] font-medium text-gray-900'
                : 'border-b-2 border-transparent px-3 pb-2.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600'}`
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
        <div className='mt-6 overflow-x-auto rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40'>
          <table className='min-w-[1250px] w-full text-left'>
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
                  ИНН
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Телефон
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Документы
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
                    <span className='text-[13px] font-medium text-gray-900 whitespace-nowrap'>
                      {user.first_name} {user.last_name}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500 whitespace-nowrap'>{user.email}</span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 whitespace-nowrap'>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center gap-1.5'>
                      {!user.is_active ? (
                        <span className='inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-700 whitespace-nowrap'>
                          <span className='inline-block size-1.5 rounded-full bg-red-500 mr-1' />
                          Заблокирован
                        </span>
                      ) : (
                        <span className='inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 whitespace-nowrap'>
                          <span className='inline-block size-1.5 rounded-full bg-emerald-500 mr-1' />
                          Активен
                        </span>
                      )}
                      {user.role === 'broker' && (
                        user.broker?.is_verified ? (
                          <span className='rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 whitespace-nowrap'>
                            Верифицирован
                          </span>
                        ) : (
                          <span className='rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 whitespace-nowrap'>
                            Не верифицирован
                          </span>
                        )
                      )}
                    </div>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500 whitespace-nowrap'>
                      {user.broker?.inn_number ?? '—'}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500 whitespace-nowrap'>
                      {user.broker?.phone_number ?? '—'}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center gap-2'>
                      {user.documents?.length > 0 ? (
                        user.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50 whitespace-nowrap'
                          >
                            <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                            {doc.document_name || doc.doc_type}
                          </a>
                        ))
                      ) : (
                        <span className='text-[13px] text-gray-400'>—</span>
                      )}
                    </div>
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center justify-end gap-1.5'>
                      {user.role === 'broker' && !user.broker?.is_verified && (
                        <FancyButton.Root variant='primary' size='xsmall' onClick={() => setVerifyTarget(user)}>
                          <HugeiconsIcon icon={SecurityCheckIcon} size={16} color='currentColor' strokeWidth={1.5} />
                          Верифицировать
                        </FancyButton.Root>
                      )}
                      {user.role === 'developer' && (
                        <FancyButton.Root variant='basic' size='xsmall' onClick={() => setEditTarget(user)}>
                          <HugeiconsIcon icon={Edit02Icon} size={16} color='currentColor' strokeWidth={1.5} />
                          Редактировать
                        </FancyButton.Root>
                      )}
                      {user.role === 'broker' && (
                        <FancyButton.Root variant='basic' size='xsmall' onClick={() => setEditBrokerTarget(user)}>
                          <HugeiconsIcon icon={Edit02Icon} size={16} color='currentColor' strokeWidth={1.5} />
                          Редактировать
                        </FancyButton.Root>
                      )}
                      <FancyButton.Root variant={!user.is_active ? 'primary' : 'destructive'} size='xsmall' onClick={() => setBlockTarget(user)}>
                        {!user.is_active ? (
                          <HugeiconsIcon icon={SquareUnlock01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                        ) : (
                          <HugeiconsIcon icon={SquareLock01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                        )}
                        {!user.is_active ? 'Разблокировать' : 'Заблокировать'}
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
      <EditDeveloperModal
        user={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />
      <EditBrokerModal
        user={editBrokerTarget}
        open={!!editBrokerTarget}
        onOpenChange={(open) => {
          if (!open) setEditBrokerTarget(null);
        }}
      />
    </div>
  );
}
