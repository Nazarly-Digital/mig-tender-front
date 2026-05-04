import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  usePasswordResetRequest,
  usePasswordResetVerify,
  usePasswordResetConfirm,
} from './queries';
import type { GetCodeError429 } from '@/shared/types/auth';
import {
  emailStepSchema,
  type EmailStepFormData,
  passwordResetConfirmSchema,
  type PasswordResetConfirmFormData,
} from '@/shared/lib/validations';
import { translateBackendMessage } from '@/shared/lib/translate-backend-error';

export function usePasswordReset() {
  const router = useRouter();

  const emailForm = useForm<EmailStepFormData>({
    resolver: zodResolver(emailStepSchema),
  });

  const passwordForm = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
  });

  const [step, setStep] = React.useState(1);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [timer, setTimer] = React.useState(0);

  const requestCode = usePasswordResetRequest();
  const verifyCode = usePasswordResetVerify();
  const confirmReset = usePasswordResetConfirm();

  React.useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleRequestCode = emailForm.handleSubmit((data) => {
    setError('');
    requestCode.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setTimer(60);
          setStep(2);
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 404) {
              setError('Пользователь с таким email не найден');
            } else if (err.response?.status === 429) {
              const d = err.response.data as GetCodeError429;
              setTimer(d.remaining_time ?? 60);
              setError('Слишком много попыток. Подождите и попробуйте снова');
            } else {
              setError('Произошла ошибка. Попробуйте позже');
            }
          }
        },
      },
    );
  });

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verifyCode.mutate(
      { email: emailForm.getValues('email'), code },
      {
        onSuccess: () => setStep(3),
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
    requestCode.mutate(
      { email: emailForm.getValues('email') },
      {
        onSuccess: () => setTimer(60),
        onError: (err) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 429) {
              const d = err.response.data as GetCodeError429;
              setTimer(d.remaining_time ?? 60);
              setError('Слишком много попыток. Подождите и попробуйте снова');
            } else {
              setError('Произошла ошибка. Попробуйте позже');
            }
          }
        },
      },
    );
  };

  const handleConfirmReset = passwordForm.handleSubmit((data) => {
    setError('');
    confirmReset.mutate(
      {
        email: emailForm.getValues('email'),
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      },
      {
        onSuccess: () => {
          toast.success('Пароль успешно изменён. Войдите с новым паролем.');
          router.replace('/login');
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
  });

  return {
    emailForm,
    passwordForm,
    step,
    code,
    setCode,
    error,
    timer,
    handleRequestCode,
    handleVerifyCode,
    handleResendCode,
    handleConfirmReset,
    isRequestPending: requestCode.isPending,
    isVerifyPending: verifyCode.isPending,
    isConfirmPending: confirmReset.isPending,
  };
}
