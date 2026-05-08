import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useGetCode,
  useVerifyEmail,
  useResendCode,
  useRegisterBroker,
} from './queries';
import type { GetCodeError429 } from '@/shared/types/auth';
import {
  emailStepSchema,
  type EmailStepFormData,
  brokerRegisterSchema,
  type BrokerRegisterFormData,
} from '@/shared/lib/validations';
import { toE164, PHONE_INPUT_DEFAULT } from '@/shared/lib/phone';
import { translateBackendMessage } from '@/shared/lib/translate-backend-error';

export function useBrokerRegistration() {
  const router = useRouter();

  const emailForm = useForm<EmailStepFormData>({
    resolver: zodResolver(emailStepSchema),
  });

  const registerForm = useForm<BrokerRegisterFormData>({
    resolver: zodResolver(brokerRegisterSchema),
    defaultValues: { phoneNumber: PHONE_INPUT_DEFAULT },
  });

  const [step, setStep] = React.useState(1);
  const [code, setCode] = React.useState('');
  const [inn, setInnFile] = React.useState<File | null>(null);
  const [passport, setPassportFile] = React.useState<File | null>(null);
  const [fileErrors, setFileErrors] = React.useState<{ inn?: string; passport?: string }>({});
  const [error, setError] = React.useState('');
  const [timer, setTimer] = React.useState(0);
  const [offerAccepted, setOfferAccepted] = React.useState(false);
  const [auctionObligationAccepted, setAuctionObligationAccepted] =
    React.useState(false);

  // Wrap file setters so that selecting a file clears the matching error.
  const setInn = React.useCallback((f: File | null) => {
    setInnFile(f);
    if (f) setFileErrors((prev) => ({ ...prev, inn: undefined }));
  }, []);
  const setPassport = React.useCallback((f: File | null) => {
    setPassportFile(f);
    if (f) setFileErrors((prev) => ({ ...prev, passport: undefined }));
  }, []);

  const getCode = useGetCode();
  const verifyEmail = useVerifyEmail();
  const resendCode = useResendCode();
  const registerBroker = useRegisterBroker();

  // Countdown timer
  React.useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleGetCode = emailForm.handleSubmit((data) => {
    setError('');
    getCode.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setTimer(60);
          setStep(2);
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 409 || err.response?.data?.error === 'Пользователь уже существует.') {
              toast.error('Аккаунт с таким email уже существует');
              router.replace('/login');
              return;
            } else if (err.response?.status === 429) {
              const data = err.response.data as GetCodeError429;
              setTimer(data.remaining_time ?? 60);
              setError('Слишком много попыток. Подождите и попробуйте снова');
            } else {
              setError('Произошла ошибка. Попробуйте позже');
            }
          }
        },
      },
    );
  });

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verifyEmail.mutate(
      { email: emailForm.getValues('email'), code },
      {
        onSuccess: () => {
          setStep(3);
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 400) {
              setError('Неверный код подтверждения');
            } else {
              setError('Произошла ошибка. Попробуйте позже');
            }
          }
        },
      },
    );
  };

  const handleResendCode = () => {
    setError('');
    resendCode.mutate(
      { email: emailForm.getValues('email') },
      {
        onSuccess: () => {
          setTimer(60);
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 429) {
              const data = err.response.data as GetCodeError429;
              setTimer(data.remaining_time ?? 60);
              setError('Слишком много попыток. Подождите и попробуйте снова');
            } else {
              setError('Произошла ошибка. Попробуйте позже');
            }
          }
        },
      },
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // File errors live outside react-hook-form, so surface them next to the
    // matching inputs at the same moment RHF surfaces its own field errors.
    const nextFileErrors: { inn?: string; passport?: string } = {};
    if (!inn) nextFileErrors.inn = 'Загрузите документ ИНН';
    if (!passport) nextFileErrors.passport = 'Загрузите паспорт';
    setFileErrors(nextFileErrors);

    registerForm.handleSubmit((data) => {
      if (nextFileErrors.inn || nextFileErrors.passport) return;

      registerBroker.mutate(
        {
          email: emailForm.getValues('email'),
          password: data.password,
          password_confirm: data.passwordConfirm,
          first_name: data.firstName,
          last_name: data.lastName,
          inn_number: data.innNumber,
          phone_number: toE164(data.phoneNumber),
          inn: inn!,
          passport: passport!,
          auction_obligation_accepted: auctionObligationAccepted,
        },
        {
          onSuccess: () => {
            router.replace('/dashboard');
          },
          onError: (err) => {
            if (err instanceof AxiosError) {
              const errData = err.response?.data;
              if (typeof errData === 'object' && errData !== null) {
                const messages = Object.values(errData)
                  .flat()
                  .filter((m): m is string => typeof m === 'string')
                  .map(translateBackendMessage)
                  .map((m) => m.replace(/\.+$/, ''));
                setError(messages.join('. ') || 'Произошла ошибка');
              } else {
                setError('Произошла ошибка. Попробуйте позже');
              }
            }
          },
        },
      );
    })(e);
  };

  return {
    // forms
    emailForm,
    registerForm,

    // state
    step,
    code,
    setCode,
    inn,
    setInn,
    passport,
    setPassport,
    fileErrors,
    error,
    timer,
    offerAccepted,
    setOfferAccepted,
    auctionObligationAccepted,
    setAuctionObligationAccepted,

    // handlers
    handleGetCode,
    handleVerifyEmail,
    handleResendCode,
    handleRegister,

    // loading states
    isGetCodePending: getCode.isPending,
    isVerifyPending: verifyEmail.isPending,
    isResendPending: resendCode.isPending,
    isRegisterPending: registerBroker.isPending,
  };
}
