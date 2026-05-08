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
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

import { TableSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import { DatePicker } from '@/shared/ui/date-picker';
import { PageHeader } from '@/shared/components/page-header';
import { PropertiesTablePagination } from '@/shared/components/properties-table';
import {
  useAdminUsers,
  useBlockUser,
  useAdminVerifyBroker,
  useAdminRejectBroker,
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
import { formatPhoneInput, toE164, PHONE_INPUT_DEFAULT } from '@/shared/lib/phone';
import { openAuthedFile } from '@/shared/lib/fetch-file';

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

// --- Reject Broker Modal ---

function RejectBrokerModal({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rejectBroker = useAdminRejectBroker();
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  if (!user) return null;

  const trimmed = reason.trim();
  const tooLong = trimmed.length > 1000;

  const handleConfirm = () => {
    if (!trimmed) {
      toast.error('Укажите причину отклонения');
      return;
    }
    if (tooLong) {
      toast.error('Причина не должна превышать 1000 символов');
      return;
    }
    rejectBroker.mutate(
      { id: user.id, reason: trimmed },
      {
        onSuccess: () => {
          toast.success('Верификация отклонена');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header
          title='Отклонить верификацию?'
          description={`${user.first_name} ${user.last_name} (${user.email})`}
        />
        <Modal.Body>
          <div className='flex flex-col gap-1.5'>
            <Label.Root htmlFor='reject-reason'>
              Причина отказа <Label.Asterisk />
            </Label.Root>
            <textarea
              id='reject-reason'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1100}
              rows={4}
              placeholder='Опишите, что нужно исправить'
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none'
            />
            <div className='flex items-center justify-between'>
              <span className='text-[11px] text-gray-400'>Брокер увидит причину в уведомлении</span>
              <span className={`text-[11px] ${tooLong ? 'text-red-600' : 'text-gray-400'}`}>{trimmed.length}/1000</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant='destructive'
            size='small'
            onClick={handleConfirm}
            disabled={rejectBroker.isPending || !trimmed || tooLong}
          >
            {rejectBroker.isPending ? 'Загрузка...' : 'Отклонить'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Documents Modal ---

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Паспорт',
  inn: 'ИНН',
  others: 'Прочие',
};

// Render order — passport/inn first (verification-critical), then others.
const DOC_TYPE_ORDER: Array<'passport' | 'inn' | 'others'> = ['passport', 'inn', 'others'];

function DocumentsModal({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!user) return null;

  const grouped = DOC_TYPE_ORDER.map((type) => ({
    type,
    label: DOC_TYPE_LABELS[type],
    docs: (user.documents ?? []).filter((d) => d.doc_type === type),
  })).filter((g) => g.docs.length > 0);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[520px]'>
        <Modal.Header
          title='Документы'
          description={`${user.first_name} ${user.last_name} (${user.email})`}
        />
        <Modal.Body>
          {grouped.length === 0 ? (
            <p className='text-[13px] text-gray-500'>У пользователя нет загруженных документов.</p>
          ) : (
            <div className='flex flex-col gap-5'>
              {grouped.map((group) => (
                <section key={group.type} className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-[12px] font-semibold uppercase tracking-wide text-gray-500'>
                      {group.label}
                    </h4>
                    <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600'>
                      {group.docs.length}
                    </span>
                  </div>
                  <ul className='flex flex-col gap-1.5'>
                    {group.docs.map((doc) => (
                      <li
                        key={doc.id}
                        className='flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5'
                      >
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-[13px] font-medium text-gray-900'>
                            {doc.document_name || doc.filename || group.label}
                          </p>
                          {doc.extension && (
                            <p className='text-[11px] text-gray-400'>
                              {doc.extension.replace(/^\./, '').toUpperCase()}
                            </p>
                          )}
                        </div>
                        <button
                          type='button'
                          onClick={() => openAuthedFile(doc.url)}
                          className='inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer whitespace-nowrap'
                        >
                          <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                          Скачать
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>
              Закрыть
            </FancyButton.Root>
          </Modal.Close>
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
      dduTemplate: undefined as unknown as File,
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
        phoneNumber: formatPhoneInput(user.developer?.phone_number || PHONE_INPUT_DEFAULT),
        dduTemplate: undefined as unknown as File,
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
      ddu_template?: File;
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
    const e164Phone = toE164(data.phoneNumber);
    if (e164Phone !== (user.developer?.phone_number ?? '')) {
      payload.phone_number = e164Phone;
    }
    if (data.dduTemplate instanceof File) {
      payload.ddu_template = data.dduTemplate;
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
                      inputMode='tel'
                      placeholder='+7 (999) 000-00-00'
                      {...form.register('phoneNumber', {
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          form.setValue('phoneNumber', formatPhoneInput(e.target.value));
                        },
                      })}
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
                      <button
                        key={doc.id}
                        type='button'
                        onClick={() => openAuthedFile(doc.url)}
                        className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50 whitespace-nowrap cursor-pointer'
                      >
                        <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                        {doc.document_name || doc.doc_type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='ed-dduTemplate'>Шаблон ДДУ (PDF)</Label.Root>
                {user.developer?.ddu_template_url && (
                  <a
                    href={user.developer.ddu_template_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex w-fit items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50'
                  >
                    <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                    Текущий шаблон
                  </a>
                )}
                <input
                  id='ed-dduTemplate'
                  type='file'
                  accept='application/pdf'
                  className='block w-full text-[12px] text-gray-600 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-gray-700 hover:file:bg-gray-50'
                  onChange={(e) =>
                    form.setValue(
                      'dduTemplate',
                      (e.target.files?.[0] ?? undefined) as unknown as File,
                      { shouldValidate: true },
                    )
                  }
                />
                <span className='text-[11px] text-gray-400'>
                  Загрузите PDF, чтобы заменить текущий шаблон. Оставьте пустым, чтобы не менять.
                </span>
                {form.formState.errors.dduTemplate && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.dduTemplate.message as string}
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
      firstName: '',
      lastName: '',
      innNumber: '',
      phoneNumber: '',
    },
  });

  React.useEffect(() => {
    if (open && user) {
      form.reset({
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        innNumber: user.broker?.inn_number ?? '',
        phoneNumber: formatPhoneInput(user.broker?.phone_number || PHONE_INPUT_DEFAULT),
      });
    }
  }, [open, user, form]);

  if (!user) return null;

  const onSubmit = form.handleSubmit((data) => {
    const payload: {
      first_name?: string;
      last_name?: string;
      inn_number?: string;
      phone_number?: string;
    } = {};
    if (data.firstName !== (user.first_name ?? '')) payload.first_name = data.firstName;
    if (data.lastName !== (user.last_name ?? '')) payload.last_name = data.lastName;
    if (data.innNumber !== (user.broker?.inn_number ?? '')) payload.inn_number = data.innNumber;
    const e164Phone = toE164(data.phoneNumber);
    if (e164Phone !== (user.broker?.phone_number ?? '')) {
      payload.phone_number = e164Phone;
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
                      inputMode='tel'
                      placeholder='+7 (999) 000-00-00'
                      {...form.register('phoneNumber', {
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          form.setValue('phoneNumber', formatPhoneInput(e.target.value));
                        },
                      })}
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

type RoleFilter = 'all' | 'developer' | 'broker' | 'admin';

const PAGE_SIZE = 20;

function formatRegistrationDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${d.getFullYear()}`;
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'blocked'>('all');
  const [verificationFilter, setVerificationFilter] = React.useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [blockTarget, setBlockTarget] = React.useState<AdminUser | null>(null);
  const [verifyTarget, setVerifyTarget] = React.useState<AdminUser | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<AdminUser | null>(null);
  const [editTarget, setEditTarget] = React.useState<AdminUser | null>(null);
  const [editBrokerTarget, setEditBrokerTarget] = React.useState<AdminUser | null>(null);
  const [documentsTarget, setDocumentsTarget] = React.useState<AdminUser | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter, verificationFilter, search, dateFrom, dateTo]);

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = {
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' }),
    ...(verificationFilter !== 'all' && roleFilter === 'broker' && { verification_status: verificationFilter }),
    ...(search && { search }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
    ordering: '-date_joined',
    page_size: PAGE_SIZE,
    page,
  };

  const { data, isLoading } = useAdminUsers(params);
  const users = data?.results ?? [];
  const totalPages = data?.count ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  const filters: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'developer', label: 'Девелоперы' },
    { value: 'broker', label: 'Брокеры' },
    { value: 'admin', label: 'Админы' },
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

      {/* Secondary filters */}
      <div className='mt-4 flex flex-wrap items-center gap-3'>
        <input
          type='text'
          placeholder='Поиск по email или имени…'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className='h-9 w-72 rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
          className='h-9 rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
        >
          <option value='all'>Любой статус</option>
          <option value='active'>Активные</option>
          <option value='blocked'>Заблокированные</option>
        </select>
        {roleFilter === 'broker' && (
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
            className='h-9 rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
          >
            <option value='all'>Любая верификация</option>
            <option value='pending'>На проверке</option>
            <option value='accepted'>Верифицирован</option>
            <option value='rejected'>Отклонён</option>
          </select>
        )}
        <span className='text-[12px] font-medium text-gray-500'>Период:</span>
        {/* Нативный <input type='date'> ставит placeholder из локали
            браузера (dd.mm.yyyy на английских системах). DatePicker
            из shared/ui всегда рисует «дд.мм.гггг» и календарь на
            русском (react-day-picker locale=ru). */}
        <DatePicker size='small' value={dateFrom} onChange={setDateFrom} />
        <DatePicker size='small' value={dateTo} onChange={setDateTo} min={dateFrom || undefined} />
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
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Дата регистрации
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
                      {user.role === 'broker' && (() => {
                        // Three real verification states — spec covers
                        // accepted / pending / rejected. Earlier we only
                        // looked at `is_verified` so a rejected broker
                        // shared the «Не верифицирован» badge with one
                        // who hadn't been reviewed yet, hiding admin
                        // rejection from the list view.
                        const vs = user.broker?.verification_status;
                        if (vs === 'accepted') {
                          return (
                            <span className='rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 whitespace-nowrap'>
                              Верифицирован
                            </span>
                          );
                        }
                        if (vs === 'rejected') {
                          return (
                            <span
                              className='rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-700 whitespace-nowrap'
                              title={user.broker?.rejection_reason ?? undefined}
                            >
                              Отклонён
                            </span>
                          );
                        }
                        return (
                          <span className='rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 whitespace-nowrap'>
                            На проверке
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500 whitespace-nowrap'>
                      {user.broker?.inn_number ?? user.developer?.inn_number ?? '—'}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500 whitespace-nowrap'>
                      {user.broker?.phone_number ?? user.developer?.phone_number ?? '—'}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    {user.documents?.length > 0 ? (
                      <button
                        type='button'
                        onClick={() => setDocumentsTarget(user)}
                        className='inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50 whitespace-nowrap cursor-pointer'
                      >
                        <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                        Документы ({user.documents.length})
                      </button>
                    ) : (
                      <span className='text-[13px] text-gray-400'>—</span>
                    )}
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500 whitespace-nowrap'>
                      {formatRegistrationDate(user.date_joined)}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center justify-end gap-1.5'>
                      {user.role === 'broker' && user.broker?.verification_status !== 'accepted' && (
                        <FancyButton.Root variant='primary' size='xsmall' onClick={() => setVerifyTarget(user)}>
                          <HugeiconsIcon icon={SecurityCheckIcon} size={16} color='currentColor' strokeWidth={1.5} />
                          Верифицировать
                        </FancyButton.Root>
                      )}
                      {user.role === 'broker' && user.broker?.verification_status === 'pending' && (
                        <FancyButton.Root variant='destructive' size='xsmall' onClick={() => setRejectTarget(user)}>
                          <HugeiconsIcon icon={Cancel01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                          Отклонить
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

      {!isLoading && users.length > 0 && (
        <PropertiesTablePagination
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
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
      <RejectBrokerModal
        user={rejectTarget}
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
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
      <DocumentsModal
        user={documentsTarget}
        open={!!documentsTarget}
        onOpenChange={(open) => {
          if (!open) setDocumentsTarget(null);
        }}
      />
    </div>
  );
}
