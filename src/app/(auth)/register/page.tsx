'use client';

/**
 * Регистрация (3-шаговая, ТЗ от 2026-05-15):
 *  Шаг 1 — Email (отправка OTP-кода).
 *  Шаг 2 — Ввод 6-значного кода (verify-email).
 *  Шаг 3 — Имя, телефон, пароль ×2, чекбоксы согласий → /auth/register/.
 *
 * После успеха: токены в session store + редирект в /cabinet, где
 * пользователь добивает остальные поля (фамилия, ИНН, документы) и
 * нажимает «Отправить на проверку».
 *
 * НЕ запрашиваем здесь: фамилия, ИНН-номер, файлы — всё это в ЛК
 * (см. cabinet/profile-card.tsx).
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiPhoneLine,
  RiUserAddFill,
  RiUserLine,
} from '@remixicon/react';

import {
  useGetCode,
  useResendCode,
  useSimpleRegister,
  useVerifyEmail,
} from '@/features/auth';
import { formatPhoneInputLocked, PHONE_INPUT_DEFAULT } from '@/shared/lib/phone';
import * as Alert from '@/shared/ui/alert';
import * as Checkbox from '@/shared/ui/checkbox';
import * as DigitInput from '@/shared/ui/digit-input';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as LinkButton from '@/shared/ui/link-button';

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input.Input> & { hasError?: boolean }
>(function PasswordInput(props, ref) {
  const [show, setShow] = React.useState(false);
  const { hasError, ...rest } = props;
  return (
    <Input.Root hasError={hasError}>
      <Input.Wrapper>
        <Input.Icon as={RiLock2Line} />
        <Input.Input
          ref={ref}
          type={show ? 'text' : 'password'}
          placeholder='••••••••'
          {...rest}
        />
        <button type='button' onClick={() => setShow((s) => !s)}>
          {show ? (
            <RiEyeOffLine className='size-5 text-gray-400' />
          ) : (
            <RiEyeLine className='size-5 text-gray-400' />
          )}
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
});

type EmailForm = { email: string };
type DataForm = {
  firstName: string;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  offerAccepted: boolean;
  obligationAccepted: boolean;
};

function getApiError(error: unknown): string | null {
  const err = error as AxiosError<{
    error?: string;
    detail?: string;
    email?: string | string[];
  }>;
  const data = err.response?.data;
  if (!data) return null;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  if (data.email) {
    return Array.isArray(data.email) ? data.email.join(', ') : data.email;
  }
  return null;
}

export default function PageRegister() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [timer, setTimer] = React.useState(0);

  const getCode = useGetCode();
  const resendCode = useResendCode();
  const verifyEmail = useVerifyEmail();
  const register = useSimpleRegister();

  const emailForm = useForm<EmailForm>({ defaultValues: { email: '' } });
  const dataForm = useForm<DataForm>({
    defaultValues: {
      firstName: '',
      phoneNumber: PHONE_INPUT_DEFAULT,
      password: '',
      passwordConfirm: '',
      offerAccepted: false,
      obligationAccepted: false,
    },
  });
  const watched = dataForm.watch();
  const dataReady =
    !!watched.firstName?.trim() &&
    !!watched.phoneNumber &&
    watched.phoneNumber !== PHONE_INPUT_DEFAULT &&
    !!watched.password &&
    !!watched.passwordConfirm &&
    watched.offerAccepted &&
    watched.obligationAccepted;

  // Resend cooldown — 60 сек после get-code/resend.
  React.useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ---- Шаг 1: email → код ----
  const onSendCode = emailForm.handleSubmit(async ({ email: e }) => {
    setError(null);
    const normalized = e.trim().toLowerCase();
    try {
      await getCode.mutateAsync({ email: normalized });
      setEmail(normalized);
      setTimer(60);
      setStep(2);
    } catch (err) {
      setError(getApiError(err) ?? 'Не удалось отправить код. Попробуйте позже.');
    }
  });

  const onResend = async () => {
    setError(null);
    try {
      await resendCode.mutateAsync({ email });
      setTimer(60);
    } catch (err) {
      setError(getApiError(err) ?? 'Не удалось отправить код повторно.');
    }
  };

  // ---- Шаг 2: код → подтверждение → шаг 3 ----
  const onVerify = async () => {
    if (code.length < 6) return;
    setError(null);
    try {
      await verifyEmail.mutateAsync({ email, code });
      setStep(3);
    } catch (err) {
      setError(getApiError(err) ?? 'Неверный код.');
    }
  };

  // ---- Шаг 3: финальная регистрация ----
  const onRegister = dataForm.handleSubmit(async (values) => {
    setError(null);
    if (values.password !== values.passwordConfirm) {
      dataForm.setError('passwordConfirm', { message: 'Пароли не совпадают' });
      return;
    }
    if (values.password.length < 8) {
      dataForm.setError('password', { message: 'Минимум 8 символов' });
      return;
    }
    try {
      await register.mutateAsync({
        email,
        first_name: values.firstName.trim(),
        phone_number: values.phoneNumber,
        password: values.password,
        password_confirm: values.passwordConfirm,
        role: 'broker',
        offer_accepted: values.offerAccepted,
        obligation_accepted: values.obligationAccepted,
      });
      router.push('/cabinet');
    } catch (err) {
      const data = (err as AxiosError<Record<string, unknown>>)?.response?.data;
      if (data) {
        if (data.phone_number) {
          dataForm.setError('phoneNumber', {
            message: String(data.phone_number),
          });
        }
        if (data.password) {
          const v = data.password;
          dataForm.setError('password', {
            message: Array.isArray(v) ? v.join(', ') : String(v),
          });
        }
      }
      setError(getApiError(err) ?? 'Не удалось зарегистрироваться.');
    }
  });

  return (
    <div className='flex min-h-svh items-center justify-center bg-gray-50 px-4 py-10'>
      <div className='w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='mb-5 flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
            <RiUserAddFill className='size-5' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
              {step === 1 && 'Регистрация'}
              {step === 2 && 'Подтверждение email'}
              {step === 3 && 'Данные аккаунта'}
            </h1>
            <p className='mt-0.5 text-[13px] text-gray-500'>
              {step === 1 && 'Введите ваш email — отправим код подтверждения'}
              {step === 2 && (
                <>Код отправлен на <b>{email}</b></>
              )}
              {step === 3 && 'Заполните данные для завершения регистрации'}
            </p>
          </div>
        </div>

        <Divider.Root />

        {error && (
          <Alert.Root status='error' size='small' variant='lighter' className='mt-4'>
            {error}
          </Alert.Root>
        )}

        {step === 1 && (
          <form onSubmit={onSendCode} noValidate className='mt-5 flex flex-col gap-4'>
            <div>
              <Label.Root htmlFor='reg-email'>Email</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    id='reg-email'
                    type='email'
                    placeholder='example@mail.com'
                    {...emailForm.register('email', {
                      required: 'Введите email',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Некорректный email',
                      },
                    })}
                  />
                </Input.Wrapper>
              </Input.Root>
              {emailForm.formState.errors.email && (
                <p className='mt-1 text-xs text-red-600'>
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              disabled={getCode.isPending || timer > 0}
            >
              {getCode.isPending
                ? 'Отправка…'
                : timer > 0
                  ? `Подождите ${timer} сек`
                  : 'Отправить код'}
            </FancyButton.Root>
            <div className='text-center text-[13px] text-gray-500'>
              Уже есть аккаунт?{' '}
              <LinkButton.Root asChild>
                <Link href='/login'>Войти</Link>
              </LinkButton.Root>
            </div>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onVerify();
            }}
            className='mt-5 flex flex-col gap-4'
          >
            <div>
              <Label.Root>Код подтверждения</Label.Root>
              <DigitInput.Root
                value={code}
                onChange={setCode}
                numInputs={6}
                inputType='number'
                shouldAutoFocus
              />
            </div>
            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              disabled={code.length < 6 || verifyEmail.isPending}
            >
              {verifyEmail.isPending ? 'Проверка…' : 'Подтвердить'}
            </FancyButton.Root>
            <div className='flex items-center justify-center gap-1.5 text-[13px]'>
              <span className='text-gray-500'>Не получили код?</span>
              {timer > 0 ? (
                <span className='text-gray-400'>Повтор через {timer} сек</span>
              ) : (
                <button
                  type='button'
                  onClick={onResend}
                  className='text-blue-600 hover:underline disabled:opacity-50'
                  disabled={resendCode.isPending}
                >
                  Отправить снова
                </button>
              )}
            </div>
            <button
              type='button'
              onClick={() => {
                setStep(1);
                setCode('');
              }}
              className='text-center text-[13px] text-gray-500 hover:text-gray-700'
            >
              ← Изменить email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={onRegister} noValidate className='mt-5 flex flex-col gap-4'>
            <div>
              <Label.Root htmlFor='reg-name'>Имя</Label.Root>
              <Input.Root hasError={!!dataForm.formState.errors.firstName}>
                <Input.Wrapper>
                  <Input.Icon as={RiUserLine} />
                  <Input.Input
                    id='reg-name'
                    placeholder='Иван'
                    {...dataForm.register('firstName', {
                      required: 'Введите имя',
                    })}
                  />
                </Input.Wrapper>
              </Input.Root>
              {dataForm.formState.errors.firstName && (
                <p className='mt-1 text-xs text-red-600'>
                  {dataForm.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label.Root htmlFor='reg-phone'>Номер телефона</Label.Root>
              <Input.Root hasError={!!dataForm.formState.errors.phoneNumber}>
                <Input.Wrapper>
                  <Input.Icon as={RiPhoneLine} />
                  <Input.Input
                    id='reg-phone'
                    inputMode='tel'
                    placeholder='+7 (999) 123-45-67'
                    value={watched.phoneNumber}
                    onChange={(e) =>
                      dataForm.setValue(
                        'phoneNumber',
                        formatPhoneInputLocked(e.target.value),
                        { shouldValidate: true },
                      )
                    }
                  />
                </Input.Wrapper>
              </Input.Root>
              {dataForm.formState.errors.phoneNumber && (
                <p className='mt-1 text-xs text-red-600'>
                  {dataForm.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label.Root htmlFor='reg-pwd'>Пароль</Label.Root>
              <PasswordInput
                id='reg-pwd'
                hasError={!!dataForm.formState.errors.password}
                {...dataForm.register('password', {
                  required: 'Введите пароль',
                  minLength: { value: 8, message: 'Минимум 8 символов' },
                })}
              />
              {dataForm.formState.errors.password && (
                <p className='mt-1 text-xs text-red-600'>
                  {dataForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label.Root htmlFor='reg-pwd2'>Повторите пароль</Label.Root>
              <PasswordInput
                id='reg-pwd2'
                hasError={!!dataForm.formState.errors.passwordConfirm}
                {...dataForm.register('passwordConfirm', {
                  required: 'Повторите пароль',
                })}
              />
              {dataForm.formState.errors.passwordConfirm && (
                <p className='mt-1 text-xs text-red-600'>
                  {dataForm.formState.errors.passwordConfirm.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3'>
              <label className='flex items-start gap-2 text-[13px]'>
                <Checkbox.Root
                  checked={watched.offerAccepted}
                  onCheckedChange={(v) =>
                    dataForm.setValue('offerAccepted', v === true, {
                      shouldValidate: true,
                    })
                  }
                />
                <span>
                  Соглашаюсь с условиями{' '}
                  <a
                    href='/legal/offer'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline-offset-2 hover:underline'
                  >
                    оферты
                  </a>
                </span>
              </label>
              <label className='flex items-start gap-2 text-[13px]'>
                <Checkbox.Root
                  checked={watched.obligationAccepted}
                  onCheckedChange={(v) =>
                    dataForm.setValue('obligationAccepted', v === true, {
                      shouldValidate: true,
                    })
                  }
                />
                <span>Принимаю обязательство при участии в аукционе</span>
              </label>
            </div>

            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              disabled={!dataReady || register.isPending}
            >
              {register.isPending ? 'Регистрация…' : 'Зарегистрироваться'}
            </FancyButton.Root>

            <button
              type='button'
              onClick={() => setStep(2)}
              className='text-center text-[13px] text-gray-500 hover:text-gray-700'
            >
              ← К коду подтверждения
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
