import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

import {
  useGetCode,
  useVerifyEmail,
  useResendCode,
  useRegisterBroker,
} from './queries';
import type { GetCodeError429 } from '@/shared/types/auth';

export function useBrokerRegistration() {
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [innNumber, setInnNumber] = React.useState('');
  const [inn, setInn] = React.useState<File | null>(null);
  const [passport, setPassport] = React.useState<File | null>(null);
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [error, setError] = React.useState('');
  const [timer, setTimer] = React.useState(0);

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

  const handleGetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    getCode.mutate(
      { email },
      {
        onSuccess: () => {
          setTimer(60);
          setStep(2);
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 409 || err.response?.data?.error === 'User already exists.') {
              toast.error('Аккаунт с таким email уже существует');
              router.push('/login');
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
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verifyEmail.mutate(
      { email, code },
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
      { email },
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

    if (password !== passwordConfirm) {
      setError('Пароли не совпадают');
      return;
    }

    if (!inn || !passport) {
      setError('Необходимо загрузить документ ИНН и паспорт');
      return;
    }

    registerBroker.mutate(
      {
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        inn_number: innNumber,
        inn,
        passport,
      },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            const data = err.response?.data;
            if (typeof data === 'object' && data !== null) {
              const messages = Object.values(data).flat();
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
    // state
    step,
    email,
    setEmail,
    code,
    setCode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    innNumber,
    setInnNumber,
    inn,
    setInn,
    passport,
    setPassport,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    error,
    timer,

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
