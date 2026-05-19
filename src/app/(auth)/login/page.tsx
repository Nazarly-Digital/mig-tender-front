'use client';

import * as React from 'react';
import Link from 'next/link';
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
import * as LinkButton from '@/shared/ui/link-button';
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
        {/* onMouseDown preventDefault — Input.Wrapper это <label>,
            и без этого клик по кнопке «съедался» лейблом (фокус
            уходил на input между mousedown и click). */}
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

export default function PageLogin() {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    // defaultValues — иначе zod видит undefined и ругается
    // «Invalid input: expected string, received undefined» (фидбек 2026-05-16).
    defaultValues: { email: '', password: '' },
  });
  const watchedEmail = watch('email');

  const [error, setError] = React.useState('');
  const [timer, setTimer] = React.useState(0);

  React.useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const onSubmit = (data: LoginFormData) => {
    if (timer > 0) return;
    setError('');
    // ТЗ от 2026-05-15 — логин только по email. Раньше также можно
    // было по телефону (нормализовали в `<digits>@noemail.local`),
    // но реальные пользователи всегда регались с email — поле
    // вводило в заблуждение.
    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };
    login.mutate(payload, {
      onSuccess: () => {
        router.replace('/dashboard');
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          const status = err.response?.status;
          if (status === 401) {
            setError('Неверный email или пароль');
          } else if (status === 429) {
            const data = err.response?.data as { remaining_time?: number; detail?: string } | undefined;
            const retryAfterHeader = err.response?.headers?.['retry-after'];
            const seconds =
              data?.remaining_time ??
              (typeof retryAfterHeader === 'string' ? parseInt(retryAfterHeader, 10) : NaN);
            const fallback = Number.isFinite(seconds) && seconds > 0 ? seconds : 60;
            setTimer(fallback);
            setError('Слишком много попыток. Подождите и попробуйте снова');
          } else {
            setError('Произошла ошибка. Попробуйте позже');
          }
        }
      },
    });
  };

  return (
    <div className='w-full max-w-[472px] px-4'>
      <div className='flex w-full flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 md:p-8'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex size-16 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50'>
            <RiUserFill className='size-6 text-gray-500 lg:size-8' />
          </div>

          <div className='space-y-1 text-center'>
            <div className='text-xl font-bold tracking-tight text-gray-900'>
              Войти в аккаунт
            </div>
            <div className='text-sm text-gray-500'>
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

        {/* noValidate — отключаем браузерную HTML5-валидацию (типа
            «Please enter a part following '@'» на английском), чтобы
            ошибки шли через zod-схему на русском. */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className='flex flex-col gap-6'
        >
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
                    type='email'
                    placeholder='example@mail.com'
                    autoComplete='username'
                    value={watchedEmail ?? ''}
                    onChange={(e) => {
                      // По фидбеку 2026-05-15 — фильтруем мусор сразу,
                      // чтобы юзер не мог ввести `%;."№(.:;[(%`. Email
                      // ограничиваем безопасным набором: a-z A-Z 0-9
                      // плюс @ . _ - +
                      const cleaned = e.target.value.replace(
                        /[^a-zA-Z0-9@._\-+]/g,
                        '',
                      );
                      setValue('email', cleaned, { shouldValidate: true });
                    }}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.email?.message && (
                <p className='text-xs text-red-500'>{errors.email.message}</p>
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
                <p className='text-xs text-red-500'>{errors.password.message}</p>
              )}
              <LinkButton.Root
                variant='primary'
                size='small'
                underline
                asChild
                className='mt-1 self-start'
              >
                <Link href='/forgot-password'>Забыли пароль?</Link>
              </LinkButton.Root>
            </div>
          </div>

          <FancyButton.Root
            type='submit'
            variant='primary'
            size='medium'
            disabled={login.isPending || timer > 0}
          >
            {login.isPending
              ? 'Вход...'
              : timer > 0
                ? `Подождите ${timer} сек`
                : 'Войти'}
          </FancyButton.Root>
        </form>
      </div>

      <div className='mb-8 mt-6 flex items-center justify-center gap-1.5'>
        <span className='text-sm text-gray-500'>Нет аккаунта?</span>
        <LinkButton.Root variant='primary' size='medium' underline asChild>
          <Link href='/register'>Зарегистрироваться</Link>
        </LinkButton.Root>
      </div>
    </div>
  );
}
