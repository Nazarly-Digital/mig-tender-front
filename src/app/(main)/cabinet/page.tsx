'use client';

import * as React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  Award01Icon,
  LockPasswordIcon,
  UnavailableIcon,
  Download01Icon,
  File02Icon,
} from '@hugeicons/core-free-icons';

import { useParticipatedAuctions } from '@/features/auctions';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import type { Auction } from '@/shared/types/auctions';
import * as FancyButton from '@/shared/ui/fancy-button';
import { useSessionStore, isUserDeveloper } from '@/entities/auth/model/store';
import { useMe, useUploadDeveloperDDUTemplate } from '@/features/auth';
import { ChangePasswordModal } from './change-password-modal';

// Resolves the real outcome of a finished auction from the current broker's point of view
// (win / loss / waiting for owner decision / rejected / failed / cancelled), not just `status`.
function getBrokerAuctionStatus(auction: Auction, userId: number | undefined): { label: string; cls: string } {
  if (auction.status === 'cancelled') {
    return { label: 'Отменён', cls: 'bg-red-50 text-red-700' };
  }
  // Owner explicitly refused the result — keep "Отклонён".
  if (auction.owner_decision === 'rejected') {
    return { label: 'Отклонён', cls: 'bg-red-50 text-red-700' };
  }
  // Auction died without a confirmed winner (most often: zero bids) —
  // it wasn't "rejected", it just didn't take place.
  if (auction.status === 'failed') {
    return { label: 'Не состоялся', cls: 'bg-red-50 text-red-700' };
  }
  if (auction.status === 'active') {
    return { label: 'Активный', cls: 'bg-emerald-50 text-emerald-700' };
  }
  if (auction.status === 'scheduled') {
    return { label: 'Запланирован', cls: 'bg-gray-100 text-gray-600' };
  }
  if (auction.status === 'draft') {
    return { label: 'Черновик', cls: 'bg-gray-100 text-gray-600' };
  }

  // status === 'finished' — derive from winner + owner decision + deal outcome.
  // Backend маскирует winner_bid.broker = null для проигравшего брокера
  // (см. бэк-фикс 6308404 — sealed-bid privacy). Победитель видит свои
  // данные в реальном виде. Optional chain нужен на оба уровня.
  const iAmWinner = userId != null && auction.winner_bid?.broker?.id === userId;

  if (iAmWinner) {
    if (auction.has_failed_deal) {
      return { label: 'Несостоявшийся', cls: 'bg-red-50 text-red-700' };
    }
    if (auction.owner_decision === 'confirmed') {
      return { label: 'Победа', cls: 'bg-emerald-50 text-emerald-700' };
    }
    return { label: 'Ожидает решения', cls: 'bg-amber-50 text-amber-700' };
  }

  if (!auction.winner_bid) {
    return { label: 'Без победителя', cls: 'bg-gray-100 text-gray-600' };
  }

  return { label: 'Не выиграл', cls: 'bg-gray-100 text-gray-600' };
}

function AuctionItem({ auction }: { auction: Auction }) {
  const userId = useSessionStore((s) => s.user?.id);
  const { label: statusLabel, cls: statusCls } = getBrokerAuctionStatus(auction, userId);

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className='flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0 rounded-none hover:bg-blue-50/20 transition-colors'
    >
      <div className='flex items-center gap-3'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-gray-50'>
          <HugeiconsIcon icon={Award01Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-gray-500' />
        </div>
        <div>
          <div className='text-sm font-medium text-gray-900'>Аукцион #{auction.id}</div>
          <div className='text-xs text-gray-400 flex items-center gap-1.5'>
            {auction.mode === 'closed' || auction.min_price == null ? (
              <span>Закрытый</span>
            ) : (
              <>
                <span>от {formatPrice(auction.min_price, 'RUB')}</span>
                <span className='text-gray-300'>·</span>
              </>
            )}
            <span>{formatDateShort(auction.end_date)}</span>
          </div>
        </div>
      </div>
      <span className={`${statusCls} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {statusLabel}
      </span>
    </Link>
  );
}

function DeveloperDDUTemplateCard() {
  useMe(); // ensures session.user.developer is fresh
  const user = useSessionStore((s) => s.user);
  const upload = useUploadDeveloperDDUTemplate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const currentUrl = user?.developer?.ddu_template_url ?? null;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Файл должен быть в формате PDF');
      return;
    }
    upload.mutate(file, {
      onSuccess: () => {
        toast.success('Шаблон ДДУ обновлён');
        if (inputRef.current) inputRef.current.value = '';
      },
      onError: () => {
        toast.error('Не удалось загрузить шаблон');
        if (inputRef.current) inputRef.current.value = '';
      },
    });
  };

  return (
    <div className='mt-6 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-gray-50'>
            <HugeiconsIcon icon={File02Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-500' />
          </div>
          <div>
            <div className='text-[14px] font-semibold text-gray-900'>Шаблон ДДУ</div>
            <div className='text-[12px] text-gray-500'>
              Брокеры скачают этот PDF при оформлении сделки. Только PDF, до 10 МБ.
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type='file'
          accept='application/pdf'
          className='hidden'
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <FancyButton.Root
          variant='basic'
          size='small'
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
          {upload.isPending ? 'Загрузка...' : currentUrl ? 'Заменить шаблон' : 'Загрузить шаблон'}
        </FancyButton.Root>
      </div>

      <div className='mt-4 border-t border-blue-50 pt-3'>
        {currentUrl ? (
          <a
            href={currentUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700'
          >
            <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
            Скачать текущий шаблон
          </a>
        ) : (
          <span className='text-[13px] text-gray-400'>
            Шаблон ещё не загружен. Без него брокер не сможет оформить ДДУ по сделке.
          </span>
        )}
      </div>
    </div>
  );
}

function DeveloperCabinetView({ onChangePassword }: { onChangePassword: () => void }) {
  const user = useSessionStore((s) => s.user);
  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '';

  return (
    <div className='w-full px-8 py-8'>
      <div className='flex items-center gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Личный кабинет</h1>
          <p className='mt-1 text-sm text-gray-500'>
            {fullName} · {user?.developer?.company_name ?? 'Девелопер'}
          </p>
        </div>
      </div>

      <div className='mt-6 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-gray-50'>
            <HugeiconsIcon icon={LockPasswordIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-500' />
          </div>
          <div>
            <div className='text-[14px] font-semibold text-gray-900'>Безопасность</div>
            <div className='text-[12px] text-gray-500'>Смените пароль, если считаете что он скомпрометирован</div>
          </div>
        </div>
        <FancyButton.Root variant='basic' size='small' onClick={onChangePassword}>
          Сменить пароль
        </FancyButton.Root>
      </div>

      <DeveloperDDUTemplateCard />
    </div>
  );
}

export default function CabinetPage() {
  const [pwdOpen, setPwdOpen] = React.useState(false);
  const user = useSessionStore((s) => s.user);
  const isDeveloper = isUserDeveloper(user);

  const { data: activeData } = useParticipatedAuctions({ status: 'active', page_size: 5 });
  const { data: finishedData } = useParticipatedAuctions({ status: 'finished', page_size: 5 });
  const { data: failedData } = useParticipatedAuctions({ status: 'failed', page_size: 5 });

  const activeAuctions = activeData?.results ?? [];
  const finishedAuctions = finishedData?.results ?? [];
  const failedAuctions = failedData?.results ?? [];

  if (isDeveloper) {
    return (
      <>
        <DeveloperCabinetView onChangePassword={() => setPwdOpen(true)} />
        <ChangePasswordModal open={pwdOpen} onOpenChange={setPwdOpen} />
      </>
    );
  }

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        {/* <div className='flex size-10 items-center justify-center rounded-xl bg-gray-100'>
          <HugeiconsIcon icon={UserIcon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-600' />
        </div> */}
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Личный кабинет</h1>
          <p className='mt-1 text-sm text-gray-500'>Ваши аукционы</p>
        </div>
      </div>

      {/* Security */}
      <div className='mt-6 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-gray-50'>
            <HugeiconsIcon icon={LockPasswordIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-500' />
          </div>
          <div>
            <div className='text-[14px] font-semibold text-gray-900'>Безопасность</div>
            <div className='text-[12px] text-gray-500'>Смените пароль, если считаете что он скомпрометирован</div>
          </div>
        </div>
        <FancyButton.Root variant='basic' size='small' onClick={() => setPwdOpen(true)}>
          Сменить пароль
        </FancyButton.Root>
      </div>

      <ChangePasswordModal open={pwdOpen} onOpenChange={setPwdOpen} />

      <div className='mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-2'>
        {/* Active participations */}
        <div className='min-h-90 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
          <div className='px-5 py-4 border-b border-blue-50 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <HugeiconsIcon icon={Clock01Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
              <span className='text-[14px] font-semibold text-gray-900'>Мои активные аукционы</span>
            </div>
            <Link href='/auctions' className='text-[13px] text-gray-400 hover:text-gray-600 transition-colors'>
              Все аукционы
            </Link>
          </div>
          {activeAuctions.length === 0 ? (
            <div className='py-8 text-center text-sm text-gray-400'>
              Нет активных аукционов
            </div>
          ) : (
            <div className='flex flex-col'>
              {activeAuctions.map((a) => (
                <AuctionItem key={a.id} auction={a} />
              ))}
            </div>
          )}
        </div>

        {/* Finished */}
        <div className='min-h-90 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
          <div className='px-5 py-4 border-b border-blue-50 flex items-center gap-2'>
            <HugeiconsIcon icon={Award01Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
            <span className='text-[14px] font-semibold text-gray-900'>Мои завершённые аукционы</span>
          </div>
          {finishedAuctions.length === 0 ? (
            <div className='py-8 text-center text-sm text-gray-400'>
              Нет завершённых аукционов
            </div>
          ) : (
            <div className='flex flex-col'>
              {finishedAuctions.map((a) => (
                <AuctionItem key={a.id} auction={a} />
              ))}
            </div>
          )}
        </div>

        {/* Failed */}
        <div className='min-h-90 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
          <div className='px-5 py-4 border-b border-blue-50 flex items-center gap-2'>
            <HugeiconsIcon icon={UnavailableIcon} size={16} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
            <span className='text-[14px] font-semibold text-gray-900'>Мои несостоявшиеся аукционы</span>
          </div>
          {failedAuctions.length === 0 ? (
            <div className='py-8 text-center text-sm text-gray-400'>
              Нет несостоявшихся аукционов
            </div>
          ) : (
            <div className='flex flex-col'>
              {failedAuctions.map((a) => (
                <AuctionItem key={a.id} auction={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
