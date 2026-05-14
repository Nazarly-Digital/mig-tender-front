'use client';

/**
 * Регистрация по ТЗ от 2026-05-14:
 *  Минимальный набор полей — Имя, Телефон, Пароль (×2), Роль, два чекбокса
 *  согласия. Без email-кода.
 *
 *  После успешной регистрации — статус «Не верифицирован», пользователь
 *  перенаправляется в `/cabinet` где заполняет остальное и нажимает
 *  «Отправить на проверку».
 *
 *  Бэк генерит placeholder email из телефона (`<digits>@noemail.local`),
 *  поэтому запасной путь логина по email через JWT работает без переделки.
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiInformationLine,
  RiLock2Line,
  RiPhoneLine,
  RiUserAddFill,
  RiUserLine,
} from '@remixicon/react';

import { useSimpleRegister } from '@/features/auth';
import { formatPhoneInputLocked, PHONE_INPUT_DEFAULT } from '@/shared/lib/phone';
import * as Alert from '@/shared/ui/alert';
import * as Checkbox from '@/shared/ui/checkbox';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as LinkButton from '@/shared/ui/link-button';
import * as Select from '@/shared/ui/select';

type FormValues = {
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

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input.Input> & { hasError?: boolean }
>(function PasswordInput(props, ref) {
  const [show, setShow] = React.useState(false);
  const { hasError, ...inputProps } = props;
  return (
    <Input.Root hasError={hasError}>
      <Input.Wrapper>
        <Input.Icon as={RiLock2Line} />
        <Input.Input
          ref={ref}
          type={show ? 'text' : 'password'}
          placeholder='••••••••'
          {...inputProps}
        />
        <button type='button' onClick={() => setShow((s) => !s)}>
          {show ? (
            <RiEyeOffLine className='size-5 text-text-soft-400' />
          ) : (
            <RiEyeLine className='size-5 text-text-soft-400' />
          )}
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
});

export default function PageRegister() {
  const router = useRouter();
  const register = useSimpleRegister();

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      phoneNumber: PHONE_INPUT_DEFAULT,
      password: '',
      passwordConfirm: '',
      role: 'broker',
      offerAccepted: false,
      obligationAccepted: false,
    },
    mode: 'onBlur',
  });

  const watched = form.watch();
  const errors = form.formState.errors;
  const allFilled =
    !!watched.firstName?.trim() &&
    !!watched.phoneNumber &&
    watched.phoneNumber !== PHONE_INPUT_DEFAULT &&
    !!watched.password &&
    !!watched.passwordConfirm &&
    watched.offerAccepted &&
    watched.obligationAccepted;

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    if (values.password !== values.passwordConfirm) {
      form.setError('passwordConfirm', { message: 'Пароли не совпадают' });
      return;
    }
    if (values.password.length < 8) {
      form.setError('password', { message: 'Минимум 8 символов' });
      return;
    }
    try {
      await register.mutateAsync({
        first_name: values.firstName.trim(),
        phone_number: values.phoneNumber,
        password: values.password,
        password_confirm: values.passwordConfirm,
        role: values.role,
        offer_accepted: values.offerAccepted,
        obligation_accepted: values.obligationAccepted,
      });
      router.push('/cabinet');
    } catch (e) {
      const err = e as {
        response?: { data?: Record<string, unknown> | { error?: string } };
      };
      const data = err.response?.data;
      // Поле-специфичные ошибки от бэка → проставляем в нужное поле формы.
      if (data && typeof data === 'object') {
        if ((data as Record<string, unknown>).phone_number) {
          form.setError('phoneNumber', {
            message: String((data as Record<string, unknown>).phone_number),
          });
        }
        if ((data as Record<string, unknown>).password) {
          const v = (data as Record<string, unknown>).password;
          form.setError('password', {
            message: Array.isArray(v) ? v.join(', ') : String(v),
          });
        }
        if ((data as Record<string, unknown>).error) {
          setSubmitError(String((data as Record<string, unknown>).error));
          return;
        }
      }
      setSubmitError(
        'Не удалось зарегистрироваться. Проверьте поля или попробуйте позже.',
      );
    }
  });

  return (
    <div className='flex min-h-svh items-center justify-center bg-gray-50 px-4 py-10'>
      <div className='w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
            <RiUserAddFill className='size-5' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
              Регистрация
            </h1>
            <p className='mt-0.5 text-[13px] text-gray-500'>
              Заполните минимальные данные — остальное в личном кабинете
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className='flex flex-col gap-4'>
          {/* Имя */}
          <div>
            <Label.Root htmlFor='firstName'>Имя</Label.Root>
            <Input.Root hasError={!!errors.firstName}>
              <Input.Wrapper>
                <Input.Icon as={RiUserLine} />
                <Input.Input
                  id='firstName'
                  placeholder='Иван'
                  {...form.register('firstName', { required: 'Введите имя' })}
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.firstName && (
              <p className='mt-1 text-xs text-red-600'>{errors.firstName.message}</p>
            )}
          </div>

          {/* Телефон */}
          <div>
            <Label.Root htmlFor='phoneNumber'>Номер телефона</Label.Root>
            <Input.Root hasError={!!errors.phoneNumber}>
              <Input.Wrapper>
                <Input.Icon as={RiPhoneLine} />
                <Input.Input
                  id='phoneNumber'
                  inputMode='tel'
                  placeholder='+7 (999) 123-45-67'
                  value={watched.phoneNumber}
                  onChange={(e) =>
                    form.setValue(
                      'phoneNumber',
                      formatPhoneInputLocked(e.target.value),
                      { shouldValidate: true },
                    )
                  }
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.phoneNumber && (
              <p className='mt-1 text-xs text-red-600'>{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Пароль */}
          <div>
            <Label.Root htmlFor='password'>Пароль</Label.Root>
            <PasswordInput
              id='password'
              hasError={!!errors.password}
              {...form.register('password', {
                required: 'Введите пароль',
                minLength: { value: 8, message: 'Минимум 8 символов' },
              })}
            />
            {errors.password && (
              <p className='mt-1 text-xs text-red-600'>{errors.password.message}</p>
            )}
          </div>

          {/* Подтверждение */}
          <div>
            <Label.Root htmlFor='passwordConfirm'>Повторите пароль</Label.Root>
            <PasswordInput
              id='passwordConfirm'
              hasError={!!errors.passwordConfirm}
              {...form.register('passwordConfirm', {
                required: 'Повторите пароль',
              })}
            />
            {errors.passwordConfirm && (
              <p className='mt-1 text-xs text-red-600'>
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          {/* Роль */}
          <div>
            <Label.Root htmlFor='role'>
              Я регистрируюсь как
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
                form.setValue('role', (v as 'broker' | 'developer') ?? 'broker')
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
            <p className='mt-1 whitespace-pre-line text-[11px] text-gray-500'>
              {ROLE_TOOLTIP}
            </p>
          </div>

          {/* Чекбоксы согласий */}
          <div className='flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3'>
            <label className='flex items-start gap-2 text-[13px]'>
              <Checkbox.Root
                checked={watched.offerAccepted}
                onCheckedChange={(v) =>
                  form.setValue('offerAccepted', v === true, { shouldValidate: true })
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
                  form.setValue('obligationAccepted', v === true, {
                    shouldValidate: true,
                  })
                }
              />
              <span>Принимаю обязательство при участии в аукционе</span>
            </label>
          </div>

          {submitError && (
            <Alert.Root status='error'>
              <Alert.Icon as={RiInformationLine} />
              <p>{submitError}</p>
            </Alert.Root>
          )}

          <FancyButton.Root
            type='submit'
            variant='primary'
            disabled={!allFilled || register.isPending}
          >
            {register.isPending ? 'Регистрация…' : 'Зарегистрироваться'}
          </FancyButton.Root>

          <div className='mt-2 text-center text-[13px] text-gray-500'>
            Уже есть аккаунт?{' '}
            <LinkButton.Root asChild>
              <Link href='/login'>Войти</Link>
            </LinkButton.Root>
          </div>
        </form>
      </div>
    </div>
  );
}
