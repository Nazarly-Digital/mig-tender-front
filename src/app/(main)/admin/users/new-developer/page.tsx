'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Download01Icon,
  File02Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';

import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import { useAdminCreateDeveloper } from '@/features/admin';
import {
  adminCreateDeveloperSchema,
  type AdminCreateDeveloperFormData,
} from '@/shared/lib/validations';
import { formatPhoneInput, toE164, PHONE_INPUT_DEFAULT } from '@/shared/lib/phone';

const ACCEPT_MIME = 'image/jpeg,image/png,image/webp,image/heic,application/pdf';

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: unknown } };
  const data = err.response?.data;
  if (!data) return 'Произошла ошибка';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.detail === 'string') return obj.detail;
    const messages: string[] = [];
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) messages.push(...value.filter((v): v is string => typeof v === 'string'));
      else if (typeof value === 'string') messages.push(value);
    }
    if (messages.length) return messages.join('. ');
  }
  return 'Произошла ошибка';
}

function FilePicker({
  id,
  value,
  onChange,
  hasError,
}: {
  id: string;
  value: File | undefined;
  onChange: (file: File | undefined) => void;
  hasError?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        type='file'
        accept={ACCEPT_MIME}
        className='hidden'
        onChange={(e) => onChange(e.target.files?.[0])}
      />
      {value ? (
        <div
          className={`flex items-center justify-between rounded-lg border ${
            hasError ? 'border-red-300' : 'border-gray-200'
          } bg-white px-3 py-2`}
        >
          <div className='flex items-center gap-2 overflow-hidden'>
            <HugeiconsIcon
              icon={File02Icon}
              size={16}
              color='currentColor'
              strokeWidth={1.5}
              className='shrink-0 text-gray-500'
            />
            <span className='truncate text-[13px] text-gray-700'>{value.name}</span>
            <span className='shrink-0 text-[11px] text-gray-400'>
              {(value.size / 1024 / 1024).toFixed(2)} МБ
            </span>
          </div>
          <button
            type='button'
            onClick={() => {
              onChange(undefined);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className='ml-2 shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          >
            <HugeiconsIcon icon={Delete02Icon} size={14} color='currentColor' strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed ${
            hasError ? 'border-red-300' : 'border-gray-300'
          } bg-white px-3 py-2.5 text-[13px] font-medium text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-50`}
        >
          <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
          Загрузить файл
        </button>
      )}
    </>
  );
}

export default function NewDeveloperPage() {
  const router = useRouter();
  const createDeveloper = useAdminCreateDeveloper();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminCreateDeveloperFormData>({
    resolver: zodResolver(adminCreateDeveloperSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      companyName: '',
      innNumber: '',
      phoneNumber: PHONE_INPUT_DEFAULT,
      innDocument: undefined as unknown as File,
      passportDocument: undefined as unknown as File,
      password: '',
      passwordConfirm: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    createDeveloper.mutate(
      {
        email: data.email,
        password: data.password,
        password_confirm: data.passwordConfirm,
        company_name: data.companyName,
        first_name: data.firstName,
        last_name: data.lastName,
        inn_number: data.innNumber,
        phone_number: toE164(data.phoneNumber),
        inn: data.innDocument as unknown as File,
        passport: data.passportDocument as unknown as File,
      },
      {
        onSuccess: () => {
          toast.success('Девелопер создан');
          router.push('/admin/users');
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  });

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link
          href='/admin/users'
          className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors'
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Новый девелопер</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Создайте аккаунт девелопера. Пароль можно будет сообщить пользователю лично.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className='mt-6 w-full max-w-[1040px]'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
          <div className='text-[14px] font-semibold text-gray-900'>Основная информация</div>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='nd-email'>
              Email <Label.Asterisk />
            </Label.Root>
            <Input.Root hasError={!!errors.email}>
              <Input.Wrapper>
                <Input.Input
                  id='nd-email'
                  type='email'
                  placeholder='example@mail.com'
                  autoComplete='off'
                  {...register('email')}
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.email && (
              <p className='text-xs text-red-500'>{errors.email.message}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='nd-firstName'>
                Имя <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!errors.firstName}>
                <Input.Wrapper>
                  <Input.Input
                    id='nd-firstName'
                    type='text'
                    placeholder='Имя'
                    {...register('firstName')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.firstName && (
                <p className='text-xs text-red-500'>{errors.firstName.message}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='nd-lastName'>
                Фамилия <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!errors.lastName}>
                <Input.Wrapper>
                  <Input.Input
                    id='nd-lastName'
                    type='text'
                    placeholder='Фамилия'
                    {...register('lastName')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.lastName && (
                <p className='text-xs text-red-500'>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='nd-companyName'>
              Название компании <Label.Asterisk />
            </Label.Root>
            <Input.Root hasError={!!errors.companyName}>
              <Input.Wrapper>
                <Input.Input
                  id='nd-companyName'
                  type='text'
                  placeholder='ООО «Пример»'
                  {...register('companyName')}
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.companyName && (
              <p className='text-xs text-red-500'>{errors.companyName.message}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='nd-innNumber'>
                ИНН <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!errors.innNumber}>
                <Input.Wrapper>
                  <Input.Input
                    id='nd-innNumber'
                    type='text'
                    inputMode='numeric'
                    placeholder='7707083893'
                    {...register('innNumber')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.innNumber && (
                <p className='text-xs text-red-500'>{errors.innNumber.message}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='nd-phoneNumber'>
                Телефон <Label.Asterisk />
              </Label.Root>
              <Controller
                name='phoneNumber'
                control={control}
                render={({ field }) => (
                  <Input.Root hasError={!!errors.phoneNumber}>
                    <Input.Wrapper>
                      <Input.Input
                        id='nd-phoneNumber'
                        type='tel'
                        inputMode='tel'
                        autoComplete='tel'
                        placeholder='+7 (999) 000-00-00'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(formatPhoneInput(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                )}
              />
              {errors.phoneNumber && (
                <p className='text-xs text-red-500'>{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
            <div className='text-[14px] font-semibold text-gray-900'>Документы</div>

            <div className='space-y-1.5'>
              <Label.Root htmlFor='nd-innDocument'>
                Документ ИНН <Label.Asterisk />
              </Label.Root>
              <Controller
                name='innDocument'
                control={control}
                render={({ field }) => (
                  <FilePicker
                    id='nd-innDocument'
                    value={field.value as File | undefined}
                    onChange={field.onChange}
                    hasError={!!errors.innDocument}
                  />
                )}
              />
              {errors.innDocument && (
                <p className='text-xs text-red-500'>
                  {errors.innDocument.message as string}
                </p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label.Root htmlFor='nd-passportDocument'>
                Паспорт <Label.Asterisk />
              </Label.Root>
              <Controller
                name='passportDocument'
                control={control}
                render={({ field }) => (
                  <FilePicker
                    id='nd-passportDocument'
                    value={field.value as File | undefined}
                    onChange={field.onChange}
                    hasError={!!errors.passportDocument}
                  />
                )}
              />
              {errors.passportDocument && (
                <p className='text-xs text-red-500'>
                  {errors.passportDocument.message as string}
                </p>
              )}
            </div>
          </div>

          <div className='mt-auto rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
            <div className='text-[14px] font-semibold text-gray-900'>Безопасность</div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='nd-password'>
                  Пароль <Label.Asterisk />
                </Label.Root>
                <Input.Root hasError={!!errors.password}>
                  <Input.Wrapper>
                    <Input.Input
                      id='nd-password'
                      type='password'
                      placeholder='Минимум 8 символов'
                      autoComplete='new-password'
                      {...register('password')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {errors.password && (
                  <p className='text-xs text-red-500'>{errors.password.message}</p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='nd-passwordConfirm'>
                  Повторите пароль <Label.Asterisk />
                </Label.Root>
                <Input.Root hasError={!!errors.passwordConfirm}>
                  <Input.Wrapper>
                    <Input.Input
                      id='nd-passwordConfirm'
                      type='password'
                      placeholder='Повторите пароль'
                      autoComplete='new-password'
                      {...register('passwordConfirm')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {errors.passwordConfirm && (
                  <p className='text-xs text-red-500'>{errors.passwordConfirm.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className='mt-5 flex items-center gap-3'>
          <Link href='/admin/users'>
            <FancyButton.Root variant='basic' size='small' type='button'>
              Отмена
            </FancyButton.Root>
          </Link>
          <FancyButton.Root
            variant='primary'
            size='small'
            type='submit'
            disabled={createDeveloper.isPending}
          >
            {createDeveloper.isPending ? 'Создание...' : 'Создать девелопера'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
