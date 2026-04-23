'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, Award01Icon, UserIcon, LockPasswordIcon, UnavailableIcon } from '@hugeicons/core-free-icons';

import { useParticipatedAuctions } from '@/features/auctions';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import type { Auction } from '@/shared/types/auctions';
import * as FancyButton from '@/shared/ui/fancy-button';
import { ChangePasswordModal } from './change-password-modal';

function AuctionItem({ auction }: { auction: Auction }) {
  const statusCls =
    auction.status === 'active'
      ? 'bg-emerald-50 text-emerald-700'
      : auction.status === 'finished'
        ? 'bg-blue-50 text-blue-700'
        : auction.status === 'failed' || auction.status === 'cancelled'
          ? 'bg-red-50 text-red-700'
          : 'bg-gray-100 text-gray-600';
  const statusLabel =
    auction.status === 'active'
      ? 'Активный'
      : auction.status === 'finished'
        ? 'Завершён'
        : auction.status === 'failed'
          ? 'Несостоявшийся'
          : auction.status === 'cancelled'
            ? 'Отменён'
            : 'Черновик';

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

export default function CabinetPage() {
  const [pwdOpen, setPwdOpen] = React.useState(false);
  const { data: activeData } = useParticipatedAuctions({ status: 'active', page_size: 5 });
  const { data: finishedData } = useParticipatedAuctions({ status: 'finished', page_size: 5 });
  const { data: failedData } = useParticipatedAuctions({ status: 'failed', page_size: 5 });

  const activeAuctions = activeData?.results ?? [];
  const finishedAuctions = finishedData?.results ?? [];
  const failedAuctions = failedData?.results ?? [];

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
