'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  RiAddLine,
  RiAuctionLine,
  RiTimeLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as ProgressBar from '@/shared/ui/progress-bar';
import * as SegmentedControl from '@/shared/ui/segmented-control';
import * as StatusBadge from '@/shared/ui/status-badge';
import { PageHeader } from '@/shared/components/page-header';
import { useMyAuctions, useAuctions } from '@/features/auctions';
import { useSessionStore } from '@/entities/auth/model/store';
import type {
  Auction,
  AuctionStatus,
  AuctionMode,
} from '@/shared/types/auctions';

const STATUS_CONFIG: Record<AuctionStatus, { label: string; status: 'completed' | 'pending' | 'failed' | 'disabled' }> = {
  active: { label: 'Активный', status: 'completed' },
  draft: { label: 'Черновик', status: 'disabled' },
  finished: { label: 'Завершён', status: 'pending' },
  cancelled: { label: 'Отменён', status: 'failed' },
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
      className='group flex flex-col rounded-xl border border-neutral-200/80 bg-white p-4 transition-all duration-150 hover:border-neutral-300 hover:shadow-sm'
    >
      <div>
        <div className='text-[14px] font-semibold text-neutral-900'>Аукцион #{auction.id}</div>
        <div className='mt-0.5 text-[12px] text-neutral-500'>Объект #{auction.property_id}</div>
      </div>

      {isActive && (
        <div className='mt-3'>
          <ProgressBar.Root value={progress} color={getProgressColor(progress)} />
          <div className='mt-1 text-right text-[11px] text-neutral-400'>{progress}% времени</div>
        </div>
      )}

      <div className='mt-3 flex flex-wrap items-center gap-1.5'>
        <StatusBadge.Root variant='light' status={statusCfg.status}>
          <StatusBadge.Dot />
          {statusCfg.label}
        </StatusBadge.Root>
        <Badge.Root variant='lighter' color='gray' size='small'>{MODE_LABELS[auction.mode]}</Badge.Root>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-2'>
        <div className='rounded-lg bg-neutral-50 px-3 py-2'>
          <div className='text-[10px] font-medium uppercase tracking-wider text-neutral-400'>Мин. цена</div>
          <div className='mt-0.5 text-[13px] font-semibold text-neutral-900'>{formatPrice(auction.min_price)}</div>
        </div>
        <div className='rounded-lg bg-neutral-50 px-3 py-2'>
          <div className='text-[10px] font-medium uppercase tracking-wider text-neutral-400'>Текущая макс.</div>
          <div className='mt-0.5 text-[13px] font-semibold text-neutral-900'>{formatPrice(auction.current_price)}</div>
        </div>
      </div>

      <div className='mt-3 flex items-center gap-3 border-t border-neutral-200/80 pt-3 text-[12px] text-neutral-500'>
        <div className='flex items-center gap-1'>
          <RiAuctionLine className='size-3.5 text-neutral-300' />
          <span>{auction.bids_count} ставок</span>
        </div>
        <div className='flex items-center gap-1'>
          <RiTimeLine className='size-3.5 text-neutral-300' />
          <span>до {formatDate(auction.end_date)}</span>
        </div>
      </div>
    </Link>
  );
}

type Tab = 'all' | 'active' | 'finished';

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
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title={isDeveloper ? 'Мои аукционы' : 'Аукционы'}
        description={isDeveloper ? 'Управление вашими аукционами' : 'Доступные аукционы на торгах'}
        action={isDeveloper ? (
          <Link href='/auctions/create'>
            <FancyButton.Root variant='primary' size='xsmall'>
              <FancyButton.Icon as={RiAddLine} />
              Создать аукцион
            </FancyButton.Root>
          </Link>
        ) : undefined}
      />

      <SegmentedControl.Root value={tab} onValueChange={(v) => setTab(v as Tab)} className='w-fit'>
        <SegmentedControl.List>
          <SegmentedControl.Trigger value='all'>Все</SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='active'>Активные</SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='finished'>Завершённые</SegmentedControl.Trigger>
        </SegmentedControl.List>
      </SegmentedControl.Root>

      {isLoading ? (
        <div className='flex flex-1 items-center justify-center py-16'>
          <div className='text-[13px] text-neutral-400'>Загрузка...</div>
        </div>
      ) : auctions.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-2 py-16'>
          <div className='flex size-10 items-center justify-center rounded-full bg-neutral-100'>
            <RiAuctionLine className='size-5 text-neutral-400' />
          </div>
          <div className='text-[13px] font-medium text-neutral-600'>
            {tab === 'all' ? 'Нет аукционов' : tab === 'active' ? 'Нет активных аукционов' : 'Нет завершённых аукционов'}
          </div>
          {isDeveloper && tab === 'all' && (
            <>
              <div className='text-[12px] text-neutral-400'>Создайте свой первый аукцион</div>
              <Link href='/auctions/create' className='mt-2'>
                <FancyButton.Root variant='primary' size='xsmall'>
                  <FancyButton.Icon as={RiAddLine} />
                  Создать аукцион
                </FancyButton.Root>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {auctions.map((auction) => (<AuctionCard key={auction.id} auction={auction} />))}
        </div>
      )}
    </div>
  );
}
