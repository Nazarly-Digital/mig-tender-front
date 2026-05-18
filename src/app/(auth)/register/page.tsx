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
import * as Modal from '@/shared/ui/modal';
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
        {/* onMouseDown preventDefault — Input.Wrapper это <label>,
            без этого клик по кнопке мог «съедаться» лейблом. */}
        <button
          type='button'
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowPassword((s) => !s)}
          className='relative z-10 shrink-0 cursor-pointer'
        >
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
  const [obligationOpen, setObligationOpen] = React.useState(false);

  const getCode = useGetCode();
  const resendCode = useResendCode();
  const verifyEmail = useVerifyEmail();
  const register = useSimpleRegister();

  const emailForm = useForm<EmailForm>({ defaultValues: { email: '' } });
  // Регистрируем email-поле с правилами валидации; ввод контролируем
  // через setValue в onChange ниже (фильтр символов по фидбеку 2026-05-15).
  React.useEffect(() => {
    emailForm.register('email', {
      required: 'Введите email',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Некорректный email',
      },
    });
  }, [emailForm]);
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
    // ТЗ от 2026-05-15 — кнопка теперь всегда активна (disabled только
    // во время mutation), поэтому валидируем required-поля здесь.
    if (!values.firstName?.trim()) {
      setError('Введите имя.');
      return;
    }
    if (!values.phoneNumber || values.phoneNumber === PHONE_INPUT_DEFAULT) {
      setError('Введите номер телефона.');
      return;
    }
    if (!values.offerAccepted) {
      setError('Согласитесь с условиями оферты.');
      return;
    }
    if (values.role === 'broker' && !values.obligationAccepted) {
      setError('Подтвердите обязательство при участии в аукционе.');
      return;
    }
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
      // ТЗ от 2026-05-16 — после регистрации редиректим на главную
      // (/dashboard). `replace` (а не `push`) — чтобы /register не
      // оставался в истории и кнопка «назад» не возвращала на форму.
      router.replace('/dashboard');
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
          {/* Иконка в стиле /login: простой кружок с серой обводкой
              (по фидбеку 2026-05-15 — старый «градиентный» стиль
              выпадал из дизайна). */}
          <div className='flex size-16 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50'>
            <RiUserAddFill className='size-6 text-gray-500 lg:size-8' />
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
              {/* Subtitle на шаге 3 убран по фидбеку 2026-05-15 —
                  заголовка «Данные аккаунта» достаточно. */}
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
          <form onSubmit={onSendCode} noValidate className='flex flex-col gap-6'>
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
                    value={emailForm.watch('email') ?? ''}
                    onChange={(e) => {
                      // Фильтруем мусор по фидбеку 2026-05-15 — оставляем
                      // только символы, валидные в email-адресе.
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
            noValidate
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
          <form onSubmit={onRegister} noValidate className='flex flex-col gap-6'>
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
                {/* (i)-тултип убран по фидбеку 2026-05-15 — он
                    title-атрибутом ничего не открывал, а описание
                    ролей теперь видно прямо в дропдауне. */}
              </Label.Root>
              <Select.Root
                value={watched.role}
                onValueChange={(v) =>
                  dataForm.setValue('role', (v as 'broker' | 'developer') ?? 'broker')
                }
              >
                {/* h-auto + py чтобы trigger вместил два-line контент
                    (по фидбеку 2026-05-15 — отступы между названием
                    и описанием увеличены). */}
                <Select.Trigger className='h-auto !min-h-[56px] py-2'>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {/* Описания вынесены в опции дропдауна по фидбеку
                      2026-05-15 — раньше висели отдельной плашкой ниже. */}
                  <Select.Item value='broker' className='py-2.5'>
                    <div className='flex flex-col gap-1'>
                      <span>Брокер</span>
                      <span className='text-paragraph-xs text-text-sub-600'>
                        Участвую в аукционах и приобретаю объекты
                      </span>
                    </div>
                  </Select.Item>
                  <Select.Item value='developer' className='py-2.5'>
                    <div className='flex flex-col gap-1'>
                      <span>Девелопер</span>
                      <span className='text-paragraph-xs text-text-sub-600'>
                        Размещаю объекты для аукциона
                      </span>
                    </div>
                  </Select.Item>
                </Select.Content>
              </Select.Root>
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
                  <span>
                    Принимаю{' '}
                    <button
                      type='button'
                      onClick={() => setObligationOpen(true)}
                      className='text-primary-base underline-offset-2 hover:underline cursor-pointer'
                    >
                      обязательство
                    </button>
                    {' '}при участии в аукционе
                  </span>
                </label>
              )}
            </div>

            <div className='flex flex-col gap-3'>
              {/* По фидбеку 2026-05-16 — кнопка снова disabled пока
                  не заполнены все поля и не отмечены чекбоксы
                  (dataReady). */}
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

              {/* «Уже есть аккаунт? Войти» — по фидбеку 2026-05-15:
                  на шаге 3 не было ссылки на login, юзер мог зависнуть. */}
              <div className='text-center text-paragraph-sm text-text-sub-600'>
                Уже есть аккаунт?{' '}
                <LinkButton.Root variant='primary' size='medium' underline asChild>
                  <Link href='/login'>Войти</Link>
                </LinkButton.Root>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Нижний отступ под карточкой формы — иначе при коротких
          вьюпортах форма прилипает к футеру. */}
      <div className='h-8' />

      {/* Модалка-объяснение «обязательство при участии в аукционе»
          (по фидбеку 2026-05-15 — раньше тоже была в форме брокер-
          регистрации). Открывается кликом по слову «обязательство». */}
      <Modal.Root open={obligationOpen} onOpenChange={setObligationOpen}>
        <Modal.Content className='max-w-[480px]'>
          <Modal.Header
            title='Обязательство при участии в аукционе'
            description='Перед регистрацией важно понимать, что вы соглашаетесь сделать.'
          />
          <Modal.Body>
            <div className='flex flex-col gap-3 text-paragraph-sm text-text-sub-600'>
              <p>
                Брокер, ставка которого выбрана победителем закрытого
                аукциона, обязан в установленный срок предоставить
                документы и оплатить сделку. Срок указан в условиях
                аукциона.
              </p>
              <p>
                Если документы не загружены или оплата не подтверждена в
                срок — сделка автоматически переходит в статус
                «Несостоявшаяся», а право победителя теряется.
              </p>
              <p>
                Принимая обязательство, вы подтверждаете готовность
                выполнить условия аукциона при победе.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='primary' size='small'>
                Понятно
              </FancyButton.Root>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
