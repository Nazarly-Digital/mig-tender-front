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
  useRegisterDeveloper,
  useUploadDocument,
} from './queries';
import type { GetCodeError429 } from '@/shared/types/auth';
import {
  emailStepSchema,
  type EmailStepFormData,
  developerRegisterSchema,
  type DeveloperRegisterFormData,
} from '@/shared/lib/validations';

export function useDeveloperRegistration() {
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [timer, setTimer] = React.useState(0);

  const emailForm = useForm<EmailStepFormData>({
    resolver: zodResolver(emailStepSchema),
  });

  const registerForm = useForm<DeveloperRegisterFormData>({
    resolver: zodResolver(developerRegisterSchema),
  });

  const [inn, setInn] = React.useState<File | null>(null);
  const [passport, setPassport] = React.useState<File | null>(null);
  const [uploadingDocs, setUploadingDocs] = React.useState(false);

  const getCode = useGetCode();
  const verifyEmail = useVerifyEmail();
  const resendCode = useResendCode();
  const registerDeveloper = useRegisterDeveloper();
  const uploadDocument = useUploadDocument();

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
            if (err.response?.status === 409 || err.response?.data?.error === 'User already exists.') {
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

  const handleRegister = registerForm.handleSubmit((data) => {
    setError('');

    registerDeveloper.mutate(
      {
        email: emailForm.getValues('email'),
        password: data.password,
        password_confirm: data.passwordConfirm,
        first_name: data.firstName || undefined,
        last_name: data.lastName || undefined,
        company_name: data.companyName,
      },
      {
        onSuccess: () => {
          setStep(4);
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
  });

  const handleUploadDocuments = async () => {
    setError('');
    setUploadingDocs(true);
    try {
      if (inn) {
        await uploadDocument.mutateAsync({ doc_type: 'inn', document: inn });
      }
      if (passport) {
        await uploadDocument.mutateAsync({ doc_type: 'passport', document: passport });
      }
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        if (typeof data === 'object' && data !== null) {
          const messages = Object.values(data).flat();
          setError(messages.join('. ') || 'Ошибка загрузки документов');
        } else {
          setError('Ошибка загрузки документов');
        }
      }
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleSkipDocuments = () => {
    router.replace('/dashboard');
  };

  return {
    // state
    step,
    code,
    setCode,
    error,
    timer,
    inn,
    setInn,
    passport,
    setPassport,

    // forms
    emailForm,
    registerForm,

    // handlers
    handleGetCode,
    handleVerifyEmail,
    handleResendCode,
    handleRegister,
    handleUploadDocuments,
    handleSkipDocuments,

    // loading states
    isGetCodePending: getCode.isPending,
    isVerifyPending: verifyEmail.isPending,
    isResendPending: resendCode.isPending,
    isRegisterPending: registerDeveloper.isPending,
    isUploadingDocs: uploadingDocs,
  };
}
