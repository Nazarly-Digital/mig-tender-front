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
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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
      className='group flex flex-col rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 transition-all duration-200 hover:shadow-regular-md hover:border-stroke-sub-300'
    >
      {/* Header */}
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <div className='text-[15px] font-semibold text-text-strong-950'>
            Аукцион #{auction.id}
          </div>
          <div className='mt-0.5 text-xs text-text-sub-600'>
            Объект #{auction.property_id}
          </div>
        </div>
      </div>

      {/* Progress bar for active auctions */}
      {isActive && (
        <div className='mt-4'>
          <ProgressBar.Root
            value={progress}
            color={getProgressColor(progress)}
          />
          <div className='mt-1.5 text-right text-[11px] text-text-soft-400'>
            {progress}% времени прошло
          </div>
        </div>
      )}

      {/* Status & Mode badges */}
      <div className='mt-4 flex flex-wrap items-center gap-1.5'>
        <StatusBadge.Root variant='light' status={statusCfg.status}>
          <StatusBadge.Dot />
          {statusCfg.label}
        </StatusBadge.Root>
        <Badge.Root variant='lighter' color='gray' size='small'>
          {MODE_LABELS[auction.mode]}
        </Badge.Root>
      </div>

      {/* Stats */}
      <div className='mt-4 grid grid-cols-2 gap-3'>
        <div className='rounded-lg bg-bg-weak-50 px-3 py-2.5'>
          <div className='text-[11px] font-medium uppercase tracking-wide text-text-soft-400'>Мин. цена</div>
          <div className='mt-0.5 text-sm font-semibold text-text-strong-950'>
            {formatPrice(auction.min_price)}
          </div>
        </div>
        <div className='rounded-lg bg-bg-weak-50 px-3 py-2.5'>
          <div className='text-[11px] font-medium uppercase tracking-wide text-text-soft-400'>Текущая макс.</div>
          <div className='mt-0.5 text-sm font-semibold text-text-strong-950'>
            {formatPrice(auction.current_price)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-4 flex items-center gap-4 border-t border-stroke-soft-200 pt-4 text-xs text-text-sub-600'>
        <div className='flex items-center gap-1.5'>
          <RiAuctionLine className='size-3.5 text-text-soft-400' />
          <span>{auction.bids_count} ставок</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <RiTimeLine className='size-3.5 text-text-soft-400' />
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

  const { data, isLoading } = isDeveloper
    ? myAuctions
    : allAuctions;

  const auctions = data?.results ?? [];

  return (
    <div className='flex flex-1 flex-col gap-8 px-6 py-8 lg:px-10'>
      <PageHeader
        title={isDeveloper ? 'Мои аукционы' : 'Аукционы'}
        description={isDeveloper ? 'Управление вашими аукционами' : 'Доступные аукционы на торгах'}
        icon={RiAuctionLine}
        action={
          isDeveloper ? (
            <Link href='/auctions/create'>
              <FancyButton.Root variant='primary' size='xsmall'>
                <FancyButton.Icon as={RiAddLine} />
                Создать аукцион
              </FancyButton.Root>
            </Link>
          ) : undefined
        }
      />

      {/* Filter */}
      <SegmentedControl.Root
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        className='w-fit'
      >
        <SegmentedControl.List>
          <SegmentedControl.Trigger value='all'>
            Все
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='active'>
            Активные
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='finished'>
            Завершённые
          </SegmentedControl.Trigger>
        </SegmentedControl.List>
      </SegmentedControl.Root>

      {/* Content */}
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center py-20'>
          <div className='text-sm text-text-soft-400'>
            Загрузка...
          </div>
        </div>
      ) : auctions.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20'>
          <div className='flex size-12 items-center justify-center rounded-full bg-bg-weak-50'>
            <RiAuctionLine className='size-5 text-text-soft-400' />
          </div>
          <div className='text-center'>
            <div className='text-sm font-medium text-text-sub-600'>
              {tab === 'all' ? 'Нет аукционов' : tab === 'active' ? 'Нет активных аукционов' : 'Нет завершённых аукционов'}
            </div>
            {isDeveloper && tab === 'all' && (
              <div className='mt-1 text-xs text-text-soft-400'>
                Создайте свой первый аукцион
              </div>
            )}
          </div>
          {isDeveloper && tab === 'all' && (
            <Link href='/auctions/create' className='mt-2'>
              <FancyButton.Root variant='primary' size='xsmall'>
                <FancyButton.Icon as={RiAddLine} />
                Создать аукцион
              </FancyButton.Root>
            </Link>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
