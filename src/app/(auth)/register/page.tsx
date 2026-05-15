'use client';

/**
 * Регистрация (3-шаговая, ТЗ от 2026-05-15):
 *   Шаг 1: Email → отправка OTP-кода
 *   Шаг 2: Ввод 6-значного кода (verify-email)
 *   Шаг 3: Имя + телефон + пароль ×2 + роль (дропдаун) + 2 чекбокса
 *
 * Дизайн — оригинальный AlignUI (gradient карточка, кольцо вокруг
 * логотипа, Label.Asterisk, Alert variant=lighter и т.д.) — чтобы
 * не выпадать из остального UI.
 *
 * После успеха: токены в session store, редирект на главную (/).
 * Дозаполнение профиля (фамилия, ИНН, документы) — в /cabinet.
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiInformationLine,
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
import { cn } from '@/shared/lib/cn';
import { formatPhoneInputLocked, PHONE_INPUT_DEFAULT } from '@/shared/lib/phone';
import * as Alert from '@/shared/ui/alert';
import * as Checkbox from '@/shared/ui/checkbox';
import * as DigitInput from '@/shared/ui/digit-input';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as LinkButton from '@/shared/ui/link-button';
import * as Select from '@/shared/ui/select';

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
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          placeholder='••••••••••'
          {...inputProps}
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

type EmailForm = { email: string };
type DataForm = {
  firstName: string;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  role: 'broker' | 'developer';
  offerAccepted: boolean;
  obligationAccepted: boolean;
};

const ROLE_TOOLTIP =
  'Брокер — участвую в аукционах и приобретаю объекты.\nДевелопер — размещаю объекты для аукциона.';

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
      role: 'broker',
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
    // ТЗ от 2026-05-15 — чекбокс обязательства только для broker'а;
    // developer без него тоже может зарегистрироваться.
    (watched.role === 'developer' || watched.obligationAccepted);

  React.useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ---- Шаг 1: email → отправка кода ----
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
        role: values.role,
        offer_accepted: values.offerAccepted,
        // ТЗ от 2026-05-15 — чекбокс «обязательство в аукционе»
        // только для broker'а; developer не участвует в торгах,
        // поэтому шлём false (бэк допускает).
        obligation_accepted:
          values.role === 'broker' ? values.obligationAccepted : false,
      });
      // ТЗ от 2026-05-15 — после регистрации редиректим на /cabinet,
      // чтобы юзер сразу увидел свою верификацию и заполнил данные.
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
    <div className='w-full max-w-[472px] px-4'>
      <div className='mt-8 flex w-full flex-col gap-6 rounded-20 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
        <div className='flex flex-col items-center gap-2'>
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
              {step === 1 && 'Регистрация'}
              {step === 2 && 'Подтверждение email'}
              {step === 3 && 'Данные аккаунта'}
            </div>
            <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
              {step === 1 && 'Введите ваш email для начала регистрации'}
              {step === 2 && (
                <>
                  Введите код, отправленный на{' '}
                  <span className='font-medium text-text-strong-950'>{email}</span>
                </>
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
          <form onSubmit={onSendCode} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='email'>
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!emailForm.formState.errors.email}>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    id='email'
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
                <p className='text-paragraph-xs text-error-base'>
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <FancyButton.Root
              type='submit'
              variant='primary'
              size='medium'
              className='w-full'
              disabled={getCode.isPending || timer > 0}
            >
              {getCode.isPending
                ? 'Отправка...'
                : timer > 0
                  ? `Подождите ${timer} сек`
                  : 'Продолжить'}
            </FancyButton.Root>

            <div className='text-center text-paragraph-sm text-text-sub-600'>
              Уже есть аккаунт?{' '}
              <LinkButton.Root variant='primary' size='medium' underline asChild>
                <Link href='/login'>Войти</Link>
              </LinkButton.Root>
            </div>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onVerify();
            }}
            className='flex flex-col gap-6'
          >
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
                disabled={code.length < 6 || verifyEmail.isPending}
              >
                {verifyEmail.isPending ? 'Проверка...' : 'Подтвердить'}
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
                    onClick={onResend}
                    disabled={resendCode.isPending}
                  >
                    Отправить снова
                  </LinkButton.Root>
                )}
              </div>

              <button
                type='button'
                onClick={() => {
                  setStep(1);
                  setCode('');
                  setError(null);
                }}
                className='text-paragraph-sm text-text-sub-600 hover:text-text-strong-950'
              >
                ← Изменить email
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Data */}
        {step === 3 && (
          <form onSubmit={onRegister} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='firstName'>
                Имя <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!dataForm.formState.errors.firstName}>
                <Input.Wrapper>
                  <Input.Icon as={RiUserLine} />
                  <Input.Input
                    id='firstName'
                    placeholder='Иван'
                    value={watched.firstName}
                    onChange={(e) => {
                      // Только буквы (RU/EN), пробел и дефис.
                      const cleaned = e.target.value.replace(
                        /[^a-zA-Zа-яА-ЯёЁ\s-]/g,
                        '',
                      );
                      dataForm.setValue('firstName', cleaned, {
                        shouldValidate: true,
                      });
                    }}
                  />
                </Input.Wrapper>
              </Input.Root>
              {dataForm.formState.errors.firstName && (
                <p className='text-paragraph-xs text-error-base'>
                  {dataForm.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='phoneNumber'>
                Номер телефона <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!dataForm.formState.errors.phoneNumber}>
                <Input.Wrapper>
                  <Input.Icon as={RiPhoneLine} />
                  <Input.Input
                    id='phoneNumber'
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
                <p className='text-paragraph-xs text-error-base'>
                  {dataForm.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='password'>
                Пароль <Label.Asterisk />
              </Label.Root>
              <PasswordInput
                id='password'
                hasError={!!dataForm.formState.errors.password}
                {...dataForm.register('password', {
                  required: 'Введите пароль',
                  minLength: { value: 8, message: 'Минимум 8 символов' },
                })}
              />
              {dataForm.formState.errors.password && (
                <p className='text-paragraph-xs text-error-base'>
                  {dataForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='passwordConfirm'>
                Повторите пароль <Label.Asterisk />
              </Label.Root>
              <PasswordInput
                id='passwordConfirm'
                hasError={!!dataForm.formState.errors.passwordConfirm}
                {...dataForm.register('passwordConfirm', {
                  required: 'Повторите пароль',
                })}
              />
              {dataForm.formState.errors.passwordConfirm && (
                <p className='text-paragraph-xs text-error-base'>
                  {dataForm.formState.errors.passwordConfirm.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label.Root htmlFor='role'>
                Я регистрируюсь как <Label.Asterisk />
                <span
                  title={ROLE_TOOLTIP}
                  className='ml-1 inline-flex items-center text-text-soft-400'
                >
                  <RiInformationLine className='size-4' />
                </span>
              </Label.Root>
              <Select.Root
                value={watched.role}
                onValueChange={(v) =>
                  dataForm.setValue('role', (v as 'broker' | 'developer') ?? 'broker')
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value='broker'>Брокер</Select.Item>
                  <Select.Item value='developer'>Девелопер</Select.Item>
                </Select.Content>
              </Select.Root>
              <p className='whitespace-pre-line text-paragraph-xs text-text-sub-600'>
                {ROLE_TOOLTIP}
              </p>
            </div>

            <div className='flex flex-col gap-2 rounded-12 bg-bg-weak-50 px-3 py-3'>
              <label className='flex items-start gap-2 text-paragraph-sm'>
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
                    className='text-primary-base underline-offset-2 hover:underline'
                  >
                    оферты
                  </a>
                </span>
              </label>
              {/* ТЗ от 2026-05-15 — чекбокс «обязательство в аукционе»
                  только для broker'а: developer не торгует, ему этот
                  пункт не относится. */}
              {watched.role === 'broker' && (
                <label className='flex items-start gap-2 text-paragraph-sm'>
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
              )}
            </div>

            <div className='flex flex-col gap-3'>
              <FancyButton.Root
                type='submit'
                variant='primary'
                size='medium'
                className='w-full'
                disabled={!dataReady || register.isPending}
              >
                {register.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
              </FancyButton.Root>
              {/* «← К коду подтверждения» убран по фидбеку 2026-05-15 —
                  email уже подтверждён, возвращаться к шагу OTP некуда. */}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
