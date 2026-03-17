'use client';

import {
  RiTimeLine,
  RiCloseCircleLine,
  RiCloseLine,
} from '@remixicon/react';
import { useState } from 'react';
import type { BrokerVerificationStatus } from '@/shared/types/auth';

type VerificationBannerProps = {
  status: BrokerVerificationStatus;
};

const config: Record<
  'pending' | 'rejected',
  {
    icon: typeof RiTimeLine;
    bg: string;
    border: string;
    iconColor: string;
    textColor: string;
    title: string;
    description: string;
  }
> = {
  pending: {
    icon: RiTimeLine,
    bg: 'bg-warning-lighter',
    border: 'ring-warning-base/20',
    iconColor: 'text-warning-base',
    textColor: 'text-text-strong-950',
    title: 'Ваш аккаунт проходит верификацию',
    description: 'Проверка документов может занять до 24 часов. Вы можете пользоваться платформой, но участие в аукционах будет доступно после подтверждения.',
  },
  rejected: {
    icon: RiCloseCircleLine,
    bg: 'bg-error-lighter',
    border: 'ring-error-base/20',
    iconColor: 'text-error-base',
    textColor: 'text-text-strong-950',
    title: 'Верификация отклонена',
    description: 'Ваши документы не прошли проверку. Обратитесь в поддержку для уточнения деталей.',
  },
};

export function VerificationBanner({ status }: VerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (status === 'accepted' || dismissed) return null;

  const c = config[status];
  const Icon = c.icon;

  return (
    <div className={`${c.bg} ring-1 ring-inset ${c.border} rounded-xl px-4 py-3 mx-4 mt-4 lg:mx-10 lg:mt-6`}>
      <div className='flex items-start gap-3'>
        <Icon className={`size-5 shrink-0 mt-0.5 ${c.iconColor}`} />
        <div className='flex-1 min-w-0'>
          <p className={`text-label-sm ${c.textColor}`}>{c.title}</p>
          <p className='text-paragraph-xs text-text-sub-600 mt-0.5'>{c.description}</p>
        </div>
        <button
          type='button'
          onClick={() => setDismissed(true)}
          className='shrink-0 p-0.5 rounded-md hover:bg-bg-white-0/50 transition-colors'
        >
          <RiCloseLine className='size-4 text-text-soft-400' />
        </button>
      </div>
    </div>
  );
}
