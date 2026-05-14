'use client';

/**
 * ВерификационныЙ статус-кaрточка по ТЗ от 2026-05-14 (раздел 2.3 + тексты).
 *
 * Показывает один из четырёх состояний:
 *   - «Не верифицирован» (NOT_SUBMITTED) — пользователь не отправлял профиль.
 *     Если заполнены ВСЕ обязательные поля → активная кнопка
 *     «Отправить на проверку», которая открывает confirmation-модалку.
 *   - «Не верифицирован» с rejection_reason — то же самое, плюс
 *     красная плашка с причиной отказа от админа.
 *   - «На проверке» (IN_REVIEW / legacy PENDING) — кнопки нет, статус-плашка
 *     амбер-цвета с пояснением.
 *   - «Верифицирован» (ACCEPTED) — зелёная плашка, кнопки нет.
 */

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiTimeLine,
} from '@remixicon/react';

import { useSubmitForReview } from '@/features/auth';
import { cn } from '@/shared/lib/cn';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';

type VerificationStatus =
  | 'not_submitted'
  | 'in_review'
  | 'pending' // legacy
  | 'accepted'
  | 'rejected'; // legacy

export type VerificationProfile = {
  verification_status?: string;
  is_verified?: boolean;
  rejection_reason?: string | null;
};

function getApiError(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        error?: string;
        detail?: string;
        missing_fields?: string[];
      };
    };
  };
  const data = err.response?.data;
  if (data?.missing_fields?.length) {
    const missing = data.missing_fields.join(', ');
    return `Заполните обязательные поля: ${missing}`;
  }
  return data?.error ?? data?.detail ?? 'Произошла ошибка';
}

function normalize(status: string | undefined): VerificationStatus {
  const s = (status ?? 'not_submitted') as VerificationStatus;
  if (s === 'pending') return 'in_review';
  if (s === 'rejected') return 'not_submitted';
  return s;
}

export function VerificationStatusCard({
  profile,
  isProfileComplete,
  onSubmitted,
}: {
  profile: VerificationProfile | null | undefined;
  isProfileComplete: boolean;
  onSubmitted?: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const submit = useSubmitForReview();

  const status = normalize(profile?.verification_status);
  const rejectionReason = profile?.rejection_reason || null;

  const handleSubmit = async () => {
    try {
      await submit.mutateAsync();
      // Тост по ТЗ (раздел «Тексты» п. 6).
      toast.success(
        'Данные отправлены. Мы пришлём уведомление, когда администратор завершит проверку.',
      );
      setConfirmOpen(false);
      onSubmitted?.();
    } catch (e) {
      toast.error(getApiError(e));
    }
  };

  // Иконка + цвет зависят от статуса.
  let icon = RiErrorWarningLine;
  let color = 'amber';
  let badgeText = 'Не верифицирован';
  let hint =
    'Чтобы получить доступ к аукционам, заполните все поля профиля и отправьте данные на проверку администратору.';

  if (status === 'in_review') {
    icon = RiTimeLine;
    color = 'blue';
    badgeText = 'На проверке';
    hint =
      'Ваши данные проверяет администратор. Обычно это занимает до 24 часов — мы пришлём уведомление, как только статус изменится.';
  } else if (status === 'accepted') {
    icon = RiCheckboxCircleLine;
    color = 'emerald';
    badgeText = 'Верифицирован';
    hint = 'Профиль подтверждён. Вам доступно участие в аукционах.';
  }

  const cardCls =
    color === 'emerald'
      ? 'border-emerald-100 bg-emerald-50/40'
      : color === 'blue'
        ? 'border-blue-100 bg-blue-50/40'
        : 'border-amber-100 bg-amber-50/40';

  const badgeCls =
    color === 'emerald'
      ? 'bg-emerald-100 text-emerald-700'
      : color === 'blue'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-amber-100 text-amber-700';

  const iconCls =
    color === 'emerald'
      ? 'text-emerald-600'
      : color === 'blue'
        ? 'text-blue-600'
        : 'text-amber-600';

  const Icon = icon;
  const showSubmit = status === 'not_submitted';

  return (
    <>
      <div
        className={cn(
          'mt-6 rounded-xl border p-5',
          cardCls,
        )}
      >
        <div className='flex items-start gap-3'>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg bg-white',
            )}
          >
            <Icon className={cn('size-5', iconCls)} />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  badgeCls,
                )}
              >
                {badgeText}
              </span>
            </div>
            <p className='mt-2 text-[13px] text-gray-700'>{hint}</p>

            {rejectionReason && status === 'not_submitted' && (
              <div className='mt-3 rounded-lg border border-red-100 bg-red-50/60 p-3'>
                <div className='text-[12px] font-semibold text-red-700'>
                  Администратор отклонил заявку
                </div>
                <p className='mt-1 text-[12px] text-red-600'>
                  Причина: {rejectionReason}
                </p>
              </div>
            )}

            {showSubmit && (
              <div className='mt-3'>
                <FancyButton.Root
                  variant='primary'
                  size='small'
                  disabled={!isProfileComplete}
                  onClick={() => setConfirmOpen(true)}
                >
                  Отправить на проверку
                </FancyButton.Root>
                {!isProfileComplete && (
                  <p className='mt-1.5 text-[11px] text-gray-500'>
                    Кнопка станет активной после заполнения всех обязательных
                    полей профиля.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалка подтверждения отправки. Тексты по ТЗ п. 5. */}
      <Modal.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Modal.Content className='max-w-[440px]'>
          <Modal.Header
            title='Отправить данные на проверку?'
            description='После отправки вы не сможете редактировать профиль, пока администратор не завершит проверку.'
          />
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='basic' size='small'>
                Отмена
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              variant='primary'
              size='small'
              disabled={submit.isPending}
              onClick={handleSubmit}
            >
              {submit.isPending ? 'Отправка…' : 'Отправить на проверку'}
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
