'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import { useChangePassword } from '@/features/auth';
import { changePasswordSchema, type ChangePasswordFormData } from '@/shared/lib/validations';

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
    for (const v of Object.values(obj)) {
      if (Array.isArray(v)) messages.push(...v.filter((x): x is string => typeof x === 'string'));
      else if (typeof v === 'string') messages.push(v);
    }
    if (messages.length) return messages.join('. ');
  }
  return 'Произошла ошибка';
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const change = useChangePassword();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: '', new_password: '', new_password_confirm: '' },
  });

  React.useEffect(() => {
    if (!open) {
      form.reset({ old_password: '', new_password: '', new_password_confirm: '' });
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit((data) => {
    change.mutate(data, {
      onSuccess: () => {
        toast.success('Пароль успешно изменён');
        onOpenChange(false);
      },
      onError: (err) => {
        const msg = getApiError(err);
        if (/старый пароль/i.test(msg)) {
          form.setError('old_password', { message: msg });
        } else if (/не совпадают/i.test(msg)) {
          form.setError('new_password_confirm', { message: msg });
        } else {
          toast.error(msg);
        }
      },
    });
  });

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[440px]'>
        <Modal.Header
          title='Смена пароля'
          description='Новый пароль должен содержать минимум 8 символов'
        />
        <form onSubmit={onSubmit}>
          <Modal.Body>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='cp-old'>
                  Текущий пароль <Label.Asterisk />
                </Label.Root>
                <Input.Root hasError={!!form.formState.errors.old_password}>
                  <Input.Wrapper>
                    <Input.Input
                      id='cp-old'
                      type={showOld ? 'text' : 'password'}
                      autoComplete='current-password'
                      placeholder='••••••••'
                      {...form.register('old_password')}
                    />
                    <button
                      type='button'
                      aria-label={showOld ? 'Скрыть пароль' : 'Показать пароль'}
                      onClick={() => setShowOld((v) => !v)}
                      className='ml-2 text-gray-400 hover:text-gray-600'
                    >
                      <HugeiconsIcon
                        icon={showOld ? ViewOffSlashIcon : ViewIcon}
                        size={16}
                        color='currentColor'
                        strokeWidth={1.5}
                      />
                    </button>
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.old_password && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.old_password.message}
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='cp-new'>
                  Новый пароль <Label.Asterisk />
                </Label.Root>
                <Input.Root hasError={!!form.formState.errors.new_password}>
                  <Input.Wrapper>
                    <Input.Input
                      id='cp-new'
                      type={showNew ? 'text' : 'password'}
                      autoComplete='new-password'
                      placeholder='Минимум 8 символов'
                      {...form.register('new_password')}
                    />
                    <button
                      type='button'
                      aria-label={showNew ? 'Скрыть пароль' : 'Показать пароль'}
                      onClick={() => setShowNew((v) => !v)}
                      className='ml-2 text-gray-400 hover:text-gray-600'
                    >
                      <HugeiconsIcon
                        icon={showNew ? ViewOffSlashIcon : ViewIcon}
                        size={16}
                        color='currentColor'
                        strokeWidth={1.5}
                      />
                    </button>
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.new_password && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.new_password.message}
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='cp-confirm'>
                  Повторите новый пароль <Label.Asterisk />
                </Label.Root>
                <Input.Root hasError={!!form.formState.errors.new_password_confirm}>
                  <Input.Wrapper>
                    <Input.Input
                      id='cp-confirm'
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete='new-password'
                      placeholder='••••••••'
                      {...form.register('new_password_confirm')}
                    />
                    <button
                      type='button'
                      aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
                      onClick={() => setShowConfirm((v) => !v)}
                      className='ml-2 text-gray-400 hover:text-gray-600'
                    >
                      <HugeiconsIcon
                        icon={showConfirm ? ViewOffSlashIcon : ViewIcon}
                        size={16}
                        color='currentColor'
                        strokeWidth={1.5}
                      />
                    </button>
                  </Input.Wrapper>
                </Input.Root>
                {form.formState.errors.new_password_confirm && (
                  <span className='text-paragraph-xs text-error-base'>
                    {form.formState.errors.new_password_confirm.message}
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
            <FancyButton.Root type='submit' variant='primary' size='small' disabled={change.isPending}>
              {change.isPending ? 'Сохранение...' : 'Изменить пароль'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
