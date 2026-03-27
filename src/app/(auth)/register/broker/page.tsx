'use client';

import * as React from 'react';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiFileTextLine,
  RiLock2Line,
  RiMailLine,
  RiUploadCloud2Line,
  RiUserLine,
  RiUserAddFill,
} from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import * as Alert from '@/shared/ui/alert';
import * as DigitInput from '@/shared/ui/digit-input';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Checkbox from '@/shared/ui/checkbox';
import * as LinkButton from '@/shared/ui/link-button';
import { useBrokerRegistration } from '@/features/auth';

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input.Input>
>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input.Root>
      <Input.Wrapper>
        <Input.Icon as={RiLock2Line} />
        <Input.Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder='••••••••••'
          {...props}
        />
        <button type='button' onClick={() => setShowPassword((s) => !s)}>
          {showPassword ? (
            <RiEyeOffLine className='size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300' />
          ) : (
            <RiEyeLine className='size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300' />
          )}
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
});
PasswordInput.displayName = 'PasswordInput';

export default function PageRegisterBroker() {
  const {
    emailForm,
    registerForm,
    step,
    code,
    setCode,
    inn,
    setInn,
    passport,
    setPassport,
    error,
    timer,
    handleGetCode,
    handleVerifyEmail,
    handleResendCode,
    handleRegister,
    isGetCodePending,
    isVerifyPending,
    isResendPending,
    isRegisterPending,
  } = useBrokerRegistration();

  const [offerAccepted, setOfferAccepted] = React.useState(false);
  const emailErrors = emailForm.formState.errors;
  const regErrors = registerForm.formState.errors;

  return (
    <div className='w-full max-w-[472px] px-4'>
      <div className='flex w-full flex-col gap-6 rounded-20 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
        <div className='flex flex-col items-center gap-2'>
          {/* icon */}
          <div
            className={cn(
              'relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24',
              'before:absolute before:inset-0 before:rounded-full',
              'before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10',
            )}
          >
            <div className='relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 lg:size-16'>
              <RiUserAddFill className='size-6 text-text-sub-600 lg:size-8' />
            </div>
          </div>

          <div className='space-y-1 text-center'>
            <div className='text-title-h6 lg:text-title-h5'>
              {step === 1 && 'Регистрация брокера'}
              {step === 2 && 'Подтверждение email'}
              {step === 3 && 'Данные аккаунта'}
            </div>
            <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
              {step === 1 && 'Введите ваш email для начала регистрации'}
              {step === 2 && (
                <>Введите код, отправленный на <span className='font-medium text-text-strong-950'>{emailForm.getValues('email')}</span></>
              )}
              {step === 3 && 'Заполните данные для завершения регистрации'}
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
          <form onSubmit={handleGetCode} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='email'>
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    id='email'
                    type='email'
                    placeholder='example@mail.com'
                    {...emailForm.register('email')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {emailErrors.email && (
                <p className='text-paragraph-xs text-error-base'>{emailErrors.email.message}</p>
              )}
            </div>

            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              className='w-full'
              disabled={isGetCodePending || timer > 0}
            >
              {isGetCodePending ? 'Отправка...' : timer > 0 ? `Подождите ${timer} сек` : 'Продолжить'}
            </FancyButton.Root>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyEmail} className='flex flex-col gap-6'>
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
                <span className='text-paragraph-sm text-text-sub-600'>
                  Не получили код?
                </span>
                {timer > 0 ? (
                  <span className='text-paragraph-sm text-text-soft-400'>
                    Повторно через {timer} сек
                  </span>
                ) : (
                  <LinkButton.Root
                    variant='primary'
                    size='medium'
                    underline
                    type='button'
                    onClick={handleResendCode}
                    disabled={isResendPending}
                  >
                    Отправить повторно
                  </LinkButton.Root>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Step 3: Broker data */}
        {step === 3 && (
          <form onSubmit={handleRegister} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='firstName'>Имя</Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiUserLine} />
                    <Input.Input
                      id='firstName'
                      type='text'
                      placeholder='Введите имя'
                      {...registerForm.register('firstName')}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='lastName'>Фамилия</Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiUserLine} />
                    <Input.Input
                      id='lastName'
                      type='text'
                      placeholder='Введите фамилию'
                      {...registerForm.register('lastName')}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='innNumber'>
                  ИНН номер <Label.Asterisk />
                </Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiFileTextLine} />
                    <Input.Input
                      id='innNumber'
                      type='text'
                      placeholder='Введите ИНН номер'
                      {...registerForm.register('innNumber')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {regErrors.innNumber && (
                  <p className='text-paragraph-xs text-error-base'>{regErrors.innNumber.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root>
                  Документ ИНН <Label.Asterisk />
                </Label.Root>
                <label className='flex cursor-pointer items-center gap-2 rounded-10 border border-stroke-soft-200 px-3 py-2.5 transition-colors hover:bg-bg-weak-50'>
                  <RiUploadCloud2Line className='size-5 shrink-0 text-text-soft-400' />
                  <span className='truncate text-paragraph-sm text-text-soft-400'>
                    {inn ? inn.name : 'Выберите файл'}
                  </span>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*,.pdf'
                    onChange={(e) => setInn(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root>
                  Паспорт <Label.Asterisk />
                </Label.Root>
                <label className='flex cursor-pointer items-center gap-2 rounded-10 border border-stroke-soft-200 px-3 py-2.5 transition-colors hover:bg-bg-weak-50'>
                  <RiUploadCloud2Line className='size-5 shrink-0 text-text-soft-400' />
                  <span className='truncate text-paragraph-sm text-text-soft-400'>
                    {passport ? passport.name : 'Выберите файл'}
                  </span>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*,.pdf'
                    onChange={(e) => setPassport(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='password'>
                  Пароль <Label.Asterisk />
                </Label.Root>
                <PasswordInput
                  id='password'
                  {...registerForm.register('password')}
                />
                {regErrors.password && (
                  <p className='text-paragraph-xs text-error-base'>{regErrors.password.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label.Root htmlFor='passwordConfirm'>
                  Подтверждение пароля <Label.Asterisk />
                </Label.Root>
                <PasswordInput
                  id='passwordConfirm'
                  {...registerForm.register('passwordConfirm')}
                />
                {regErrors.passwordConfirm && (
                  <p className='text-paragraph-xs text-error-base'>{regErrors.passwordConfirm.message}</p>
                )}
              </div>
            </div>

            <label className='flex cursor-pointer items-start gap-3 rounded-xl bg-bg-weak-50 p-4'>
              <div className='flex-1'>
                <span className='text-paragraph-sm font-medium text-text-strong-950'>
                  Соглашаюсь с условиями{' '}
                  <a
                    href='/offer'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary-base underline'
                    onClick={(e) => e.stopPropagation()}
                  >
                    оферты
                  </a>
                </span>
                <p className='mt-0.5 text-paragraph-xs text-text-sub-600'>
                  Это нужно для обработки и хранения документов. Одно согласие — для всех типов.
                </p>
              </div>
              <Checkbox.Root
                checked={offerAccepted}
                onCheckedChange={(v) => setOfferAccepted(v === true)}
              />
            </label>

            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              className='w-full'
              disabled={isRegisterPending || !offerAccepted}
            >
              {isRegisterPending ? 'Регистрация...' : 'Зарегистрироваться'}
            </FancyButton.Root>
          </form>
        )}
      </div>
    </div>
  );
}
