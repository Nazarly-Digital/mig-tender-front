'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as LabelPrimitive from '@radix-ui/react-label';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiUserFill,
} from '@remixicon/react';
import { AxiosError } from 'axios';

import { cn } from '@/shared/lib/cn';
import * as Alert from '@/shared/ui/alert';
import * as Checkbox from '@/shared/ui/checkbox';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as LinkButton from '@/shared/ui/link-button';
import { useLogin } from '@/features/auth';

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

export default function PageLogin() {
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!value) return 'Введите email';
    if (!re.test(value)) return 'Введите корректный email';
    return '';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 401) {
              setError('Неверный email или пароль');
            } else {
              setError('Произошла ошибка. Попробуйте позже');
            }
          }
        },
      },
    );
  };

  return (
    <div className='w-full max-w-[472px] px-4'>
      <div className='flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
        <div className='flex flex-col items-center gap-2'>
          {/* icon */}
          <div
            className={cn(
              'relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24',
              // bg
              'before:absolute before:inset-0 before:rounded-full',
              'before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10',
            )}
          >
            <div className='relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 lg:size-16'>
              <RiUserFill className='size-6 text-text-sub-600 lg:size-8' />
            </div>
          </div>

          <div className='space-y-1 text-center'>
            <div className='text-title-h6 lg:text-title-h5'>
              Войти в аккаунт
            </div>
            <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
              Введите ваши данные для входа
            </div>
          </div>
        </div>

        <Divider.Root />

        {error && (
          <Alert.Root variant='lighter' status='error' size='small'>
            {error}
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='email'>
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!emailError}>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    id='email'
                    name='email'
                    type='text'
                    placeholder='example@mail.com'
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(validateEmail(e.target.value));
                    }}
                    onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                  />
                </Input.Wrapper>
              </Input.Root>
              {emailError && (
                <p className='text-paragraph-xs text-error-base'>{emailError}</p>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='password'>
                Пароль <Label.Asterisk />
              </Label.Root>
              <PasswordInput
                id='password'
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* <div className='flex items-center justify-between gap-4'>
            <div className='flex items-start gap-2'>
              <Checkbox.Root id='agree' name='remember' />
              <LabelPrimitive.Root
                htmlFor='agree'
                className='block cursor-pointer text-paragraph-sm'
              >
                Запомнить меня
              </LabelPrimitive.Root>
            </div>
            <LinkButton.Root variant='gray' size='medium' underline asChild>
              <Link href='/reset-password'>Забыли пароль?</Link>
            </LinkButton.Root>
          </div> */}

          <FancyButton.Root
            type='submit'
            variant='primary'
            size='medium'
            disabled={login.isPending}
          >
            {login.isPending ? 'Вход...' : 'Войти'}
          </FancyButton.Root>
        </form>
      </div>
    </div>
  );
}
