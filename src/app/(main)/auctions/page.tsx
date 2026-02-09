'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  RiAddLine,
  RiAuctionLine,
  RiMore2Line,
  RiTimeLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as SegmentedControl from '@/shared/ui/segmented-control';
import { useMyAuctions, useAuctions } from '@/features/auctions';
import { useSessionStore } from '@/entities/auth/model/store';
import type {
  Auction,
  AuctionStatus,
  AuctionMode,
} from '@/shared/types/auctions';

const STATUS_CONFIG: Record<AuctionStatus, { label: string; color: 'blue' | 'green' | 'gray' | 'yellow' }> = {
  active: { label: 'Активный', color: 'green' },
  draft: { label: 'Черновик', color: 'gray' },
  finished: { label: 'Завершён', color: 'blue' },
  cancelled: { label: 'Отменён', color: 'gray' },
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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
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

function AuctionCard({ auction }: { auction: Auction }) {
  const statusCfg = STATUS_CONFIG[auction.status];

  return (
    <div className='flex flex-col rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {/* Header */}
      <div className='p-5 pb-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='text-label-md text-text-strong-950'>
              Аукцион #{auction.id}
            </div>
            <div className='mt-1 text-paragraph-sm text-text-sub-600'>
              {MODE_LABELS[auction.mode]} · Объект #{auction.property_id}
            </div>
          </div>
          <button
            type='button'
            className='flex size-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50'
          >
            <RiMore2Line className='size-5' />
          </button>
        </div>
      </div>

      <div className='px-5 pt-4'>
        <Divider.Root />
      </div>

      {/* Status badge */}
      <div className='flex items-center gap-2 px-5 pt-4'>
        <Badge.Root variant='lighter' color={statusCfg.color} size='medium'>
          {statusCfg.label}
        </Badge.Root>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-x-4 gap-y-3 px-5 pt-4'>
        <div>
          <div className='text-paragraph-sm text-text-sub-600'>Мин. цена</div>
          <div className='text-label-md text-text-strong-950'>
            {formatPrice(auction.min_price)}
          </div>
        </div>
        <div>
          <div className='text-paragraph-sm text-text-sub-600'>Текущая макс.</div>
          <div className='text-label-md text-text-strong-950'>
            {formatPrice(auction.current_price)}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className='grid grid-cols-2 gap-x-4 px-5 pt-3 pb-5'>
        <div>
          <div className='text-paragraph-sm text-text-sub-600'>Начало</div>
          <div className='text-label-md text-text-strong-950'>
            {formatShortDate(auction.start_date)}
          </div>
        </div>
        <div>
          <div className='text-paragraph-sm text-text-sub-600'>Конец</div>
          <div className='text-label-md text-text-strong-950'>
            {formatShortDate(auction.end_date)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='px-5'>
        <Divider.Root />
      </div>
      <div className='flex items-center gap-4 px-5 py-3.5 text-paragraph-sm text-text-sub-600'>
        <div className='flex items-center gap-1.5'>
          <RiAuctionLine className='size-4 text-text-soft-400' />
          <span>{auction.bids_count} ставок</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <RiTimeLine className='size-4 text-text-soft-400' />
          <span>до {formatDate(auction.end_date)} г.</span>
        </div>
      </div>
    </div>
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
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <div className='text-label-xl font-semibold text-text-strong-950'>
            {isDeveloper ? 'Мои аукционы' : 'Аукционы'}
          </div>
          <div className='mt-1 text-paragraph-sm text-text-sub-600'>
            {isDeveloper ? 'Управление вашими аукционами' : 'Доступные аукционы на торгах'}
          </div>
        </div>
        {isDeveloper && (
          <Link href='/auctions/create'>
            <FancyButton.Root variant='primary' size='small'>
              <RiAddLine className='size-4' />
              Создать аукцион
            </FancyButton.Root>
          </Link>
        )}
      </div>

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
        <div className='py-12 text-center text-paragraph-sm text-text-soft-400'>
          Загрузка...
        </div>
      ) : auctions.length === 0 ? (
        <div className='py-12 text-center text-paragraph-sm text-text-soft-400'>
          {tab === 'all' ? 'Нет аукционов' : tab === 'active' ? 'Нет активных аукционов' : 'Нет завершённых аукционов'}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
