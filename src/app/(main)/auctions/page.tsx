'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon, Clock01Icon, Add01Icon } from '@hugeicons/core-free-icons';

import { AuctionGridSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import { useMyAuctions, useAuctions } from '@/features/auctions';
import { useSessionStore } from '@/entities/auth/model/store';
import type {
  Auction,
  AuctionStatus,
  AuctionMode,
} from '@/shared/types/auctions';

const STATUS_CONFIG: Record<AuctionStatus, { label: string; cls: string; dot: string; text: string }> = {
  active: { label: 'Активный', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  draft: { label: 'Черновик', cls: 'bg-gray-100 text-gray-600', dot: 'bg-amber-500', text: 'text-amber-600' },
  finished: { label: 'Завершён', cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', text: 'text-blue-600' },
  cancelled: { label: 'Отменён', cls: 'bg-red-50 text-red-700', dot: 'bg-red-500', text: 'text-red-500' },
};

const MODE_LABELS: Record<AuctionMode, string> = {
  open: 'Открытый',
  closed: 'Закрытый',
};

function formatPrice(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num);
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getTimeProgress(startDate: string, endDate: string): number {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

function getProgressColor(progress: number): 'blue' | 'orange' | 'red' {
  if (progress >= 80) return 'red';
  if (progress >= 50) return 'orange';
  return 'blue';
}

function AuctionCard({ auction }: { auction: Auction }) {
  const statusCfg = STATUS_CONFIG[auction.status];
  const isActive = auction.status === 'active';
  const progress = getTimeProgress(auction.start_date, auction.end_date);

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className='group flex flex-col rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 hover:border-blue-200 hover:shadow-sm transition-all duration-200'
    >
      {/* Header: title + price */}
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-[14px] font-semibold text-gray-900'>Аукцион #{auction.id}</h3>
          <div className='mt-1 flex items-center gap-1.5'>
            <span className={`size-1.5 rounded-full ${statusCfg.dot}`} />
            <span className={`text-[11px] font-medium ${statusCfg.text}`}>{statusCfg.label}</span>
            <span className='text-[11px] text-gray-300'>·</span>
            <span className='text-[11px] text-gray-400'>{MODE_LABELS[auction.mode]}</span>
          </div>
        </div>
        <span className='text-[17px] font-bold text-gray-900 shrink-0'>{formatPrice(auction.current_price)}</span>
      </div>

      {/* Progress */}
      <div className='mt-4'>
        <div className='mb-1 flex justify-between text-[11px]'>
          <span className='text-gray-400'>{auction.bids_count} ставок · мин. {formatPrice(auction.min_price)}</span>
          {isActive && <span className='font-semibold text-gray-500'>{progress}%</span>}
        </div>
        <div className='h-1 overflow-hidden rounded-full bg-gray-100'>
          <div className='h-full rounded-full bg-blue-500' style={{ width: `${isActive ? progress : auction.status === 'finished' ? 100 : 0}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className='mt-3 flex items-center gap-3 border-t border-blue-50 pt-3 text-[12px] text-gray-400'>
        <span className='flex items-center gap-1'>
          <HugeiconsIcon icon={Award01Icon} size={13} color='currentColor' strokeWidth={1.5} className='text-gray-300' />
          {auction.bids_count} ставок
        </span>
        <span className='flex items-center gap-1'>
          <HugeiconsIcon icon={Clock01Icon} size={13} color='currentColor' strokeWidth={1.5} className='text-gray-300' />
          до {formatDate(auction.end_date)}
        </span>
      </div>
    </Link>
  );
}

type Tab = 'all' | 'active' | 'finished';

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'finished', label: 'Завершённые' },
];

export default function AuctionsPage() {
  const [tab, setTab] = React.useState<Tab>('all');
  const user = useSessionStore((s) => s.user);
  const isDeveloper = user?.role === 'developer';

  const params = {
    ...(tab !== 'all' && { status: tab as 'active' | 'finished' }),
    ordering: '-created_at',
  };

  const myAuctions = useMyAuctions(isDeveloper ? params : undefined);
  const allAuctions = useAuctions(!isDeveloper ? params : undefined);
  const { data, isLoading } = isDeveloper ? myAuctions : allAuctions;
  const auctions = data?.results ?? [];

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
            {isDeveloper ? 'Мои аукционы' : 'Аукционы'}
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            {isDeveloper ? 'Управление вашими аукционами' : 'Доступные аукционы на торгах'}
          </p>
        </div>
        {isDeveloper && (
          <Link href='/auctions/create'>
            <FancyButton.Root variant='primary' size='small'>
              <HugeiconsIcon icon={Add01Icon} size={16} color='currentColor' strokeWidth={1.5} />
              Создать аукцион
            </FancyButton.Root>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className='mt-6 flex items-center gap-0 border-b border-gray-200'>
        {TABS.map((t) => (
          <button
            key={t.value}
            type='button'
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.value
                ? 'border-blue-600 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className='mt-6'>
          <AuctionGridSkeleton count={8} />
        </div>
      ) : auctions.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-16'>
          <div className='flex size-11 items-center justify-center rounded-xl bg-gray-50'>
            <HugeiconsIcon icon={Award01Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
          </div>
          <div className='text-base font-semibold text-gray-900'>
            {tab === 'all' ? 'Нет аукционов' : tab === 'active' ? 'Нет активных аукционов' : 'Нет завершённых аукционов'}
          </div>
          {isDeveloper && tab === 'all' && (
            <>
              <div className='text-sm text-gray-500'>Создайте свой первый аукцион</div>
              <Link href='/auctions/create' className='mt-1'>
                <FancyButton.Root variant='primary' size='small'>
                  <HugeiconsIcon icon={Add01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                  Создать аукцион
                </FancyButton.Root>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {auctions.map((auction) => (<AuctionCard key={auction.id} auction={auction} />))}
        </div>
      )}
    </div>
  );
}
