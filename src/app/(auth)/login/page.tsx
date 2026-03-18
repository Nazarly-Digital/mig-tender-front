'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiUserFill,
} from '@remixicon/react';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, type LoginFormData } from '@/shared/lib/validations';
import * as Alert from '@/shared/ui/alert';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import { useLogin } from '@/features/auth';

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
        <button type='button' onClick={() => setShowPassword((s) => !s)}>
          {showPassword ? (
            <RiEyeOffLine className='size-5 text-[#9CA3AF]' />
          ) : (
            <RiEyeLine className='size-5 text-[#9CA3AF]' />
          )}
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
});

export default function PageLogin() {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = React.useState('');

  const onSubmit = (data: LoginFormData) => {
    setError('');
    login.mutate(data, {
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
    });
  };

  return (
    <div className='w-full max-w-[472px] px-4'>
      <div className='flex w-full flex-col gap-6 rounded-xl border border-[#E5E7EB] bg-white p-6 md:p-8'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex size-16 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB]'>
            <RiUserFill className='size-6 text-[#6B7280] lg:size-8' />
          </div>

          <div className='space-y-1 text-center'>
            <div className='text-[24px] font-bold tracking-[-0.02em] text-[#111827]'>
              Войти в аккаунт
            </div>
            <div className='text-[14px] text-[#6B7280]'>
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

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          <div className='flex flex-col gap-3'>
            {/* Email */}
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='email'>
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!errors.email}>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    id='email'
                    type='text'
                    placeholder='example@mail.com'
                    {...register('email')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.email?.message && (
                <p className='text-[12px] text-error-base'>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='password'>
                Пароль <Label.Asterisk />
              </Label.Root>
              <PasswordInput
                id='password'
                hasError={!!errors.password}
                {...register('password')}
              />
              {errors.password?.message && (
                <p className='text-[12px] text-error-base'>{errors.password.message}</p>
              )}
            </div>
          </div>

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
