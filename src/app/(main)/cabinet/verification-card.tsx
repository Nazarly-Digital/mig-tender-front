'use client';

/**
 * Верификационные UI-блоки в ЛК (ТЗ от 2026-05-14, обновлено 2026-05-15).
 *
 * - VerificationStatusBanner — плашка-объяснение наверху ЛК. Скрывается
 *   когда verification_status = ACCEPTED (по фидбеку 2026-05-15: статус
 *   и так виден в сайдбаре, дублировать не нужно).
 * - SubmitForReviewButton — отдельная кнопка «Отправить на проверку»
 *   которая ставится ПОСЛЕ блока документов, а не внутри плашки.
 *   Disabled-подсказка убрана: кнопка просто кликабельная, и при
 *   нехватке полей бэк ответит missing_fields.
 */

import * as React from 'react';
import toast from 'react-hot-toast';
import {
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

/**
 * Плашка-баннер с цветом-статусом + текстом-подсказкой. Кнопки нет.
 * Скрывается для ACCEPTED (по фидбеку 2026-05-15).
 */
export function VerificationStatusBanner({
  profile,
}: {
  profile: VerificationProfile | null | undefined;
}) {
  const status = normalize(profile?.verification_status);
  const rejectionReason = profile?.rejection_reason || null;

  // Для подтверждённого профиля баннер не показываем — статус виден
  // в сайдбаре и в ProfileCard, дополнительная плашка избыточна.
  if (status === 'accepted') return null;

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
  }

  const cardCls =
    color === 'blue'
      ? 'border-blue-100 bg-blue-50/40'
      : 'border-amber-100 bg-amber-50/40';

  const badgeCls =
    color === 'blue'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-amber-100 text-amber-700';

  const iconCls = color === 'blue' ? 'text-blue-600' : 'text-amber-600';

  const Icon = icon;

  return (
    <div className={cn('mt-6 rounded-xl border p-5', cardCls)}>
      <div className='flex items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-white'>
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
        </div>
      </div>
    </div>
  );
}

/**
 * Кнопка «Отправить на проверку» — отдельный блок, стоит после доков.
 * Показывается только в not_submitted (и legacy rejected). В in_review /
 * accepted — null.
 *
 * Один клик делает save + submit. Опциональный `beforeSubmit` — функция
 * которую родитель передаёт чтобы сохранить ProfileEditCard'овые
 * значения перед сабмитом (фидбек 2026-05-15: отдельной «Сохранить»
 * для not_submitted больше нет).
 *
 * `isProfileComplete` — фича-гейт: пока хоть одно поле или документ
 * пустые, кнопка disabled (фидбек 2026-05-15, обновлённый: вернули
 * disable-state, который я было снял ранее).
 */
export function SubmitForReviewButton({
  profile,
  beforeSubmit,
  isProfileComplete = true,
  onSubmitted,
}: {
  profile: VerificationProfile | null | undefined;
  beforeSubmit?: () => Promise<void>;
  isProfileComplete?: boolean;
  onSubmitted?: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const submit = useSubmitForReview();
  const status = normalize(profile?.verification_status);

  // Клик по кнопке: СНАЧАЛА сохраняем профиль (если родитель пробросил
  // beforeSubmit). Если save упал — toast и НЕ открываем модалку.
  // По фидбеку 2026-05-16: все ошибки-тосты должны выходить ДО
  // модалки, а не поверх неё. Модалка открывается только когда
  // профиль успешно сохранён.
  const handleOpenConfirm = async () => {
    if (beforeSubmit) {
      setSaving(true);
      try {
        await beforeSubmit();
      } catch (e) {
        const err = e as { response?: { data?: Record<string, unknown> } };
        const data = err.response?.data;
        const firstField = data ? Object.keys(data)[0] : undefined;
        const firstMsg =
          firstField && data
            ? Array.isArray(data[firstField])
              ? (data[firstField] as string[]).join(', ')
              : String(data[firstField])
            : 'Не удалось сохранить профиль';
        toast.error(firstMsg);
        return;
      } finally {
        setSaving(false);
      }
    }
    setConfirmOpen(true);
  };

  // Подтверждение в модалке — профиль уже сохранён, остаётся
  // только сам submit-for-review.
  const handleSubmit = async () => {
    try {
      await submit.mutateAsync();
      toast.success(
        'Данные отправлены. Мы пришлём уведомление, когда администратор завершит проверку.',
      );
      setConfirmOpen(false);
      onSubmitted?.();
    } catch (e) {
      setConfirmOpen(false);
      toast.error(getApiError(e));
    }
  };

  if (status !== 'not_submitted') return null;

  return (
    <>
      <div className='mt-4 flex justify-end'>
        <FancyButton.Root
          variant='primary'
          size='small'
          // По фидбеку 2026-05-15 (обновлено) — disabled пока не
          // заполнены все обязательные поля и не загружены
          // ИНН + паспорт. Родитель считает isProfileComplete.
          disabled={!isProfileComplete || saving}
          onClick={handleOpenConfirm}
        >
          {saving ? 'Сохранение…' : 'Отправить на проверку'}
        </FancyButton.Root>
      </div>

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

/**
 * Backward-compat обёртка: некоторые места ещё импортируют
 * `VerificationStatusCard`. Рендерит и баннер, и кнопку в одном месте,
 * но с новой раскладкой (баннер скрыт для ACCEPTED).
 *
 * NB: после фидбека 2026-05-15 isProfileComplete больше не управляет
 * disabled-состоянием кнопки, оставлен в сигнатуре только ради
 * совместимости со старыми вызовами.
 */
export function VerificationStatusCard(props: {
  profile: VerificationProfile | null | undefined;
  isProfileComplete: boolean;
  onSubmitted?: () => void;
}) {
  return (
    <>
      <VerificationStatusBanner profile={props.profile} />
      <SubmitForReviewButton
        profile={props.profile}
        onSubmitted={props.onSubmitted}
      />
    </>
  );
}
