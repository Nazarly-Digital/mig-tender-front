'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiLockPasswordLine,
} from '@remixicon/react';

import * as Alert from '@/shared/ui/alert';
import * as DigitInput from '@/shared/ui/digit-input';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as LinkButton from '@/shared/ui/link-button';
import { usePasswordReset } from '@/features/auth';

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input.Input> & { hasError?: boolean }
>(function PasswordInput(props, ref) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { hasError, ...inputProps } = props;

  return (
    <Input.Root hasError={hasError}>
      <Input.Wrapper>
        <Input.Icon as={RiLock2Line} />
        <Input.Input
          type={showPassword ? 'text' : 'password'}
          placeholder='••••••••••'
          ref={ref}
          {...inputProps}
        />
        {/* onMouseDown preventDefault — Input.Wrapper это <label>. */}
        <button
          type='button'
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowPassword((s) => !s)}
          className='relative z-10 shrink-0 cursor-pointer'
        >
          {showPassword ? (
            <RiEyeOffLine className='size-5 text-gray-400' />
          ) : (
            <RiEyeLine className='size-5 text-gray-400' />
          )}
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
});

export default function PageForgotPassword() {
  const {
    emailForm,
    passwordForm,
    step,
    code,
    setCode,
    error,
    timer,
    handleRequestCode,
    handleVerifyCode,
    handleResendCode,
    handleConfirmReset,
    isRequestPending,
    isVerifyPending,
    isConfirmPending,
  } = usePasswordReset();

  const emailErrors = emailForm.formState.errors;
  const pwdErrors = passwordForm.formState.errors;

  return (
    <div className='w-full max-w-[472px] px-4'>
      <div className='flex w-full flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 md:p-8'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex size-16 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50'>
            <RiLockPasswordLine className='size-6 text-gray-500 lg:size-8' />
          </div>

          <div className='space-y-1 text-center'>
            <div className='text-xl font-bold tracking-tight text-gray-900'>
              {step === 1 && 'Восстановление пароля'}
              {step === 2 && 'Подтверждение email'}
              {step === 3 && 'Новый пароль'}
            </div>
            <div className='text-sm text-gray-500'>
              {step === 1 && 'Введите email от вашего аккаунта'}
              {step === 2 && (
                <>
                  Введите код, отправленный на{' '}
                  <span className='font-medium text-gray-900'>
                    {emailForm.getValues('email')}
                  </span>
                </>
              )}
              {step === 3 && 'Задайте новый пароль для входа'}
            </div>
          </div>
        </div>

        <Divider.Root />

        {error && (
          <Alert.Root variant='lighter' status='error' size='small'>
            {error}
          </Alert.Root>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} noValidate className='flex flex-col gap-6'>
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='email'>
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!emailErrors.email}>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    id='email'
                    type='email'
                    placeholder='example@mail.com'
                    value={emailForm.watch('email') ?? ''}
                    onChange={(e) => {
                      // Фильтруем мусор по фидбеку 2026-05-15.
                      const cleaned = e.target.value.replace(
                        /[^a-zA-Z0-9@._\-+]/g,
                        '',
                      );
                      emailForm.setValue('email', cleaned, {
                        shouldValidate: true,
                      });
                    }}
                  />
                </Input.Wrapper>
              </Input.Root>
              {emailErrors.email && (
                <p className='text-xs text-red-500'>{emailErrors.email.message}</p>
              )}
            </div>

            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              className='w-full'
              disabled={isRequestPending || timer > 0}
            >
              {isRequestPending
                ? 'Отправка...'
                : timer > 0
                  ? `Подождите ${timer} сек`
                  : 'Отправить код'}
            </FancyButton.Root>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} noValidate className='flex flex-col gap-6'>
            <div className='flex flex-col gap-1'>
              <Label.Root>
                Код подтверждения <Label.Asterisk />
              </Label.Root>
              <DigitInput.Root
                value={code}
                onChange={setCode}
                numInputs={6}
                inputType='number'
                shouldAutoFocus
              />
            </div>

            <div className='flex flex-col gap-3'>
              <FancyButton.Root
                type='submit'
                variant='primary'
                size='medium'
                className='w-full'
                disabled={code.length < 6 || isVerifyPending}
              >
                {isVerifyPending ? 'Проверка...' : 'Подтвердить'}
              </FancyButton.Root>

              <div className='flex items-center justify-center gap-1.5'>
                <span className='text-sm text-gray-500'>Не получили код?</span>
                {timer > 0 ? (
                  <span className='text-sm text-gray-400'>
                    Повторно через {timer} сек
                  </span>
                ) : (
                  <LinkButton.Root
                    variant='primary'
                    size='medium'
                    underline
                    type='button'
                    onClick={handleResendCode}
                    disabled={isRequestPending}
                  >
                    Отправить повторно
                  </LinkButton.Root>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Step 3: New password */}
        {step === 3 && (
          <form onSubmit={handleConfirmReset} noValidate className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='new_password'>
                  Новый пароль <Label.Asterisk />
                </Label.Root>
                <PasswordInput
                  id='new_password'
                  hasError={!!pwdErrors.new_password}
                  {...passwordForm.register('new_password')}
                />
                {pwdErrors.new_password && (
                  <p className='text-xs text-red-500'>
                    {pwdErrors.new_password.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='new_password_confirm'>
                  Подтверждение пароля <Label.Asterisk />
                </Label.Root>
                <PasswordInput
                  id='new_password_confirm'
                  hasError={!!pwdErrors.new_password_confirm}
                  {...passwordForm.register('new_password_confirm')}
                />
                {pwdErrors.new_password_confirm && (
                  <p className='text-xs text-red-500'>
                    {pwdErrors.new_password_confirm.message}
                  </p>
                )}
              </div>
            </div>

            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              className='w-full'
              disabled={isConfirmPending}
            >
              {isConfirmPending ? 'Сохранение...' : 'Сохранить пароль'}
            </FancyButton.Root>
          </form>
        )}
      </div>

      <div className='mb-8 mt-6 flex items-center justify-center gap-1.5'>
        <span className='text-sm text-gray-500'>Вспомнили пароль?</span>
        <LinkButton.Root variant='primary' size='medium' underline asChild>
          <Link href='/login'>Войти</Link>
        </LinkButton.Root>
      </div>
    </div>
  );
}
