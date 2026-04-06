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

export function useBrokerRegistration() {
  const router = useRouter();

  const emailForm = useForm<EmailStepFormData>({
    resolver: zodResolver(emailStepSchema),
  });

  const registerForm = useForm<BrokerRegisterFormData>({
    resolver: zodResolver(brokerRegisterSchema),
  });

  const [step, setStep] = React.useState(1);
  const [code, setCode] = React.useState('');
  const [inn, setInn] = React.useState<File | null>(null);
  const [passport, setPassport] = React.useState<File | null>(null);
  const [error, setError] = React.useState('');
  const [timer, setTimer] = React.useState(0);
  const [showObligationModal, setShowObligationModal] = React.useState(false);

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

  const handleRegister = registerForm.handleSubmit(() => {
    setError('');

    if (!inn || !passport) {
      setError('Необходимо загрузить документ ИНН и паспорт');
      return;
    }

    setShowObligationModal(true);
  });

  const onAcceptObligation = () => {
    setShowObligationModal(false);

    const data = registerForm.getValues();

    registerBroker.mutate(
      {
        email: emailForm.getValues('email'),
        password: data.password,
        password_confirm: data.passwordConfirm,
        first_name: data.firstName || undefined,
        last_name: data.lastName || undefined,
        inn_number: data.innNumber,
        phone_number: data.phoneNumber,
        inn: inn!,
        passport: passport!,
      },
      {
        onSuccess: () => {
          router.replace('/dashboard');
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            const errData = err.response?.data;
            if (typeof errData === 'object' && errData !== null) {
              const messages = Object.values(errData).flat();
              setError(messages.join('. ') || 'Произошла ошибка');
            } else {
              setError('Произошла ошибка. Попробуйте позже');
            }
          }
        },
      },
    );
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
    error,
    timer,

    // handlers
    handleGetCode,
    handleVerifyEmail,
    handleResendCode,
    handleRegister,
    onAcceptObligation,

    // modal
    showObligationModal,

    // loading states
    isGetCodePending: getCode.isPending,
    isVerifyPending: verifyEmail.isPending,
    isResendPending: resendCode.isPending,
    isRegisterPending: registerBroker.isPending,
  };
}
