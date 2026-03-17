'use client';

import * as React from 'react';
import {
  RiBuilding2Line,
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiUserLine,
  RiUserAddFill,
} from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import * as Alert from '@/shared/ui/alert';
import * as DigitInput from '@/shared/ui/digit-input';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import { InputField } from '@/shared/ui/input-field';
import { InputLabel } from '@/shared/ui/input-label';
import * as LinkButton from '@/shared/ui/link-button';
import { useDeveloperRegistration } from '@/features/auth';

function PasswordInput(
  props: React.ComponentPropsWithoutRef<typeof Input.Input>,
) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input.Root>
      <Input.Wrapper>
        <Input.Icon as={RiLock2Line} />
        <Input.Input
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
}

export default function PageRegisterDeveloper() {
  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    companyName,
    setCompanyName,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
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
  } = useDeveloperRegistration();

  return (
    <div className='w-full max-w-[472px] px-4'>
      <div className='flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
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
              {step === 1 && 'Регистрация девелопера'}
              {step === 2 && 'Подтверждение email'}
              {step === 3 && 'Данные аккаунта'}
            </div>
            <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
              {step === 1 && 'Введите ваш email для начала регистрации'}
              {step === 2 && (
                <>Введите код, отправленный на <span className='font-medium text-text-strong-950'>{email}</span></>
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
              <InputLabel htmlFor='email' label='Email' required />
              <InputField
                id='email'
                type='email'
                placeholder='example@mail.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<RiMailLine className='size-5' />}
                size='lg'
              />
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
              <InputLabel label='Код подтверждения' required />
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

        {/* Step 3: Developer data */}
        {step === 3 && (
          <form onSubmit={handleRegister} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <InputLabel htmlFor='firstName' label='Имя' />
                <InputField
                  id='firstName'
                  type='text'
                  placeholder='Введите имя'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<RiUserLine className='size-5' />}
                  size='lg'
                />
              </div>

              <div className='flex flex-col gap-1'>
                <InputLabel htmlFor='lastName' label='Фамилия' />
                <InputField
                  id='lastName'
                  type='text'
                  placeholder='Введите фамилию'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  leftIcon={<RiUserLine className='size-5' />}
                  size='lg'
                />
              </div>

              <div className='flex flex-col gap-1'>
                <InputLabel htmlFor='companyName' label='Название компании' required />
                <InputField
                  id='companyName'
                  type='text'
                  placeholder='Введите название компании'
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  leftIcon={<RiBuilding2Line className='size-5' />}
                  size='lg'
                />
              </div>

              <div className='flex flex-col gap-1'>
                <InputLabel htmlFor='password' label='Пароль' required />
                <PasswordInput
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className='flex flex-col gap-1'>
                <InputLabel htmlFor='passwordConfirm' label='Подтверждение пароля' required />
                <PasswordInput
                  id='passwordConfirm'
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              className='w-full'
              disabled={isRegisterPending}
            >
              {isRegisterPending ? 'Регистрация...' : 'Зарегистрироваться'}
            </FancyButton.Root>
          </form>
        )}
      </div>
    </div>
  );
}
