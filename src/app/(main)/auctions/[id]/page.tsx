'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  RiAuctionLine,
  RiUserLine,
  RiArrowUpLine,
  RiTrophyLine,
  RiLiveLine,
} from '@remixicon/react';
import toast from 'react-hot-toast';

import * as Badge from '@/shared/ui/badge';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as ProgressBar from '@/shared/ui/progress-bar';
import * as StatusBadge from '@/shared/ui/status-badge';
import * as Alert from '@/shared/ui/alert';
import { PageHeader } from '@/shared/components/page-header';
import { useSessionStore } from '@/entities/auth/model/store';
import { useAuctionDetail, useJoinAuction, usePlaceSealedBid } from '@/features/auctions';
import { useAuctionSocket } from '@/shared/lib/use-auction-socket';
import type { Bid, AuctionStatus } from '@/shared/types/auctions';

const STATUS_CONFIG: Record<AuctionStatus, { label: string; status: 'completed' | 'pending' | 'failed' | 'disabled' }> = {
  active: { label: 'Активный', status: 'completed' },
  draft: { label: 'Черновик', status: 'disabled' },
  finished: { label: 'Завершён', status: 'pending' },
  cancelled: { label: 'Отменён', status: 'failed' },
};

function formatPrice(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num);
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
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

function getProgressColor(p: number): 'blue' | 'orange' | 'red' {
  if (p >= 80) return 'red';
  if (p >= 50) return 'orange';
  return 'blue';
}

function useCountdown(endDate: string | undefined) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    if (!endDate) return;
    const update = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Завершён'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}ч ${m}м ${s}с`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

function BidItem({ bid, isHighest, isOwn }: { bid: Bid; isHighest: boolean; isOwn: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${isHighest ? 'bg-success-lighter ring-1 ring-inset ring-success-base/20' : 'bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200'}`}>
      <div className='flex items-center gap-3'>
        <div className={`flex size-8 items-center justify-center rounded-full ${isHighest ? 'bg-success-base' : 'bg-bg-weak-50'}`}>
          {isHighest ? (
            <RiTrophyLine className='size-4 text-white' />
          ) : (
            <RiUserLine className={`size-4 ${isOwn ? 'text-primary-base' : 'text-text-soft-400'}`} />
          )}
        </div>
        <div>
          <div className='text-label-sm text-text-strong-950'>
            {formatPrice(bid.amount)} ₸
          </div>
          <div className='text-paragraph-xs text-text-soft-400'>
            Брокер #{bid.broker} {isOwn && '(вы)'}
          </div>
        </div>
      </div>
      <div className='text-paragraph-xs text-text-soft-400'>
        {formatTime(bid.created_at)}
      </div>
    </div>
  );
}

// === OPEN Auction (WebSocket live) ===
function OpenAuctionView({ auctionId }: { auctionId: number }) {
  const user = useSessionStore((s) => s.user);
  const isBroker = user?.role === 'broker';
  const { connected, auctionData, bids, participants, error, placeBid, clearError } = useAuctionSocket(auctionId);
  const [bidAmount, setBidAmount] = React.useState('');
  const countdown = useCountdown(auctionData?.end_date);

  const isActive = auctionData?.status === 'active';
  const isOwner = auctionData?.owner_id === user?.id;
  const isHighestBidder = auctionData?.highest_bid_id != null && bids[0]?.broker === user?.id;
  const canBid = isBroker && isActive && !isOwner && !isHighestBidder;
  const progress = auctionData ? getTimeProgress(auctionData.start_date, auctionData.end_date) : 0;

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount.trim()) return;
    placeBid(bidAmount);
    setBidAmount('');
  };

  if (!auctionData) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <div className='text-paragraph-sm text-text-soft-400'>
          {connected ? 'Загрузка данных аукциона...' : 'Подключение...'}
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr,380px]'>
      {/* Left: Auction info + bids */}
      <div className='space-y-6'>
        {/* Status bar */}
        <div className='flex flex-wrap items-center gap-3'>
          <StatusBadge.Root variant='light' status={STATUS_CONFIG[auctionData.status].status}>
            <StatusBadge.Dot />
            {STATUS_CONFIG[auctionData.status].label}
          </StatusBadge.Root>
          <Badge.Root variant='lighter' color='blue' size='small'>
            Открытый
          </Badge.Root>
          {connected && (
            <div className='flex items-center gap-1.5 text-paragraph-xs text-success-base'>
              <RiLiveLine className='size-3.5' />
              Live
            </div>
          )}
        </div>

        {/* Progress */}
        {isActive && (
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='flex items-center justify-between text-paragraph-sm text-text-sub-600'>
              <span>Осталось: <span className='font-medium text-text-strong-950'>{countdown}</span></span>
              <span>{progress}%</span>
            </div>
            <div className='mt-2'>
              <ProgressBar.Root value={progress} color={getProgressColor(progress)} />
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='text-subheading-2xs uppercase text-text-soft-400'>Текущая цена</div>
            <div className='mt-1 text-title-h5 text-text-strong-950'>{formatPrice(auctionData.current_price)}</div>
          </div>
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='text-subheading-2xs uppercase text-text-soft-400'>Мин. цена</div>
            <div className='mt-1 text-title-h5 text-text-sub-600'>{formatPrice(auctionData.min_price)}</div>
          </div>
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='text-subheading-2xs uppercase text-text-soft-400'>Ставок</div>
            <div className='mt-1 text-title-h5 text-text-strong-950'>{auctionData.bids_count}</div>
          </div>
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='text-subheading-2xs uppercase text-text-soft-400'>Участников</div>
            <div className='mt-1 text-title-h5 text-text-strong-950'>{participants.length}</div>
          </div>
        </div>

        {/* Bids list */}
        <div>
          <h3 className='text-label-md text-text-strong-950 mb-3'>История ставок</h3>
          {bids.length === 0 ? (
            <div className='rounded-xl bg-bg-weak-50 py-8 text-center text-paragraph-sm text-text-soft-400'>
              Ставок пока нет. Будьте первым!
            </div>
          ) : (
            <div className='space-y-2'>
              {bids.map((bid, i) => (
                <BidItem
                  key={bid.id}
                  bid={bid}
                  isHighest={i === 0}
                  isOwn={bid.broker === user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Bid panel */}
      <div className='lg:sticky lg:top-6 lg:self-start'>
        <div className='rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
          <h3 className='text-label-md text-text-strong-950 mb-1'>Сделать ставку</h3>
          <p className='text-paragraph-xs text-text-soft-400 mb-4'>
            {auctionData.bids_count === 0
              ? `Первая ставка будет автоматически равна мин. цене (${formatPrice(auctionData.min_price)})`
              : `Минимальная следующая ставка: ${formatPrice(auctionData.current_price)} + шаг`
            }
          </p>

          {error && (
            <Alert.Root variant='lighter' status='error' size='xsmall' className='mb-3'>
              {error}
            </Alert.Root>
          )}

          {canBid ? (
            <form onSubmit={handleBid} className='space-y-3'>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='bid-amount'>Сумма ставки</Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input
                      id='bid-amount'
                      type='number'
                      step='0.01'
                      placeholder={auctionData.bids_count === 0 ? auctionData.min_price : ''}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <FancyButton.Root
                type='submit'
                variant='primary'
                size='medium'
                className='w-full'
                disabled={!connected}
              >
                <FancyButton.Icon as={RiArrowUpLine} />
                Поставить ставку
              </FancyButton.Root>
            </form>
          ) : (
            <div className='rounded-xl bg-bg-weak-50 py-4 text-center text-paragraph-sm text-text-soft-400'>
              {!isBroker && 'Только брокеры могут делать ставки'}
              {isBroker && isOwner && 'Вы являетесь владельцем аукциона'}
              {isBroker && isHighestBidder && 'Вы уже лидер торгов'}
              {isBroker && !isActive && 'Аукцион не активен'}
            </div>
          )}

          {/* Dates info */}
          <Divider.Root variant='line-spacing' className='my-0 py-4' />
          <div className='space-y-2 text-paragraph-xs'>
            <div className='flex justify-between'>
              <span className='text-text-soft-400'>Начало</span>
              <span className='text-text-sub-600'>{formatDateTime(auctionData.start_date)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-text-soft-400'>Окончание</span>
              <span className='text-text-sub-600'>{formatDateTime(auctionData.end_date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === CLOSED Auction (REST API) ===
function ClosedAuctionView({ auctionId }: { auctionId: number }) {
  const { data: auction, isLoading } = useAuctionDetail(auctionId);
  const user = useSessionStore((s) => s.user);
  const isBroker = user?.role === 'broker';
  const isOwner = auction?.owner_id === user?.id;
  const placeBid = usePlaceSealedBid();
  const joinAuction = useJoinAuction();
  const [bidAmount, setBidAmount] = React.useState('');
  const countdown = useCountdown(auction?.end_date);

  if (isLoading || !auction) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <div className='text-paragraph-sm text-text-soft-400'>Загрузка...</div>
      </div>
    );
  }

  const isActive = auction.status === 'active';
  const isFinished = auction.status === 'finished';
  const progress = getTimeProgress(auction.start_date, auction.end_date);
  const statusCfg = STATUS_CONFIG[auction.status];

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount.trim()) return;
    placeBid.mutate(
      { id: auctionId, amount: bidAmount },
      {
        onSuccess: () => {
          toast.success('Ставка отправлена');
          setBidAmount('');
        },
        onError: () => toast.error('Ошибка при отправке ставки'),
      },
    );
  };

  const handleJoin = () => {
    joinAuction.mutate(auctionId, {
      onSuccess: () => toast.success('Вы присоединились к аукциону'),
      onError: () => toast.error('Ошибка при присоединении'),
    });
  };

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr,380px]'>
      {/* Left */}
      <div className='space-y-6'>
        <div className='flex flex-wrap items-center gap-3'>
          <StatusBadge.Root variant='light' status={statusCfg.status}>
            <StatusBadge.Dot />
            {statusCfg.label}
          </StatusBadge.Root>
          <Badge.Root variant='lighter' color='orange' size='small'>
            Закрытый
          </Badge.Root>
        </div>

        {isActive && (
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='flex items-center justify-between text-paragraph-sm text-text-sub-600'>
              <span>Осталось: <span className='font-medium text-text-strong-950'>{countdown}</span></span>
              <span>{progress}%</span>
            </div>
            <div className='mt-2'>
              <ProgressBar.Root value={progress} color={getProgressColor(progress)} />
            </div>
          </div>
        )}

        <div className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='text-subheading-2xs uppercase text-text-soft-400'>Мин. цена</div>
            <div className='mt-1 text-title-h5 text-text-strong-950'>{formatPrice(auction.min_price)}</div>
          </div>
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='text-subheading-2xs uppercase text-text-soft-400'>Ставок</div>
            <div className='mt-1 text-title-h5 text-text-strong-950'>{auction.bids_count}</div>
          </div>
          <div className='rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <div className='text-subheading-2xs uppercase text-text-soft-400'>Объект</div>
            <div className='mt-1 text-title-h5 text-text-strong-950'>#{auction.property_id}</div>
          </div>
        </div>

        {/* Info for closed auction */}
        <div className='rounded-xl bg-bg-weak-50 p-5'>
          <h3 className='text-label-sm text-text-strong-950 mb-2'>Как работает закрытый аукцион</h3>
          <ul className='space-y-1.5 text-paragraph-sm text-text-sub-600'>
            <li>1. Ставки скрыты от других участников</li>
            <li>2. Вы можете обновить свою ставку пока аукцион активен</li>
            <li>3. После окончания владелец выберет победителя</li>
          </ul>
        </div>

        {/* Winner display */}
        {isFinished && auction.winner_bid_id && (
          <Alert.Root variant='light' status='success' size='large'>
            <RiTrophyLine className='size-5 text-success-base' />
            Победитель определён. Ставка #{auction.winner_bid_id}
          </Alert.Root>
        )}
      </div>

      {/* Right: Bid panel */}
      <div className='lg:sticky lg:top-6 lg:self-start'>
        <div className='rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
          <h3 className='text-label-md text-text-strong-950 mb-1'>
            {isOwner ? 'Управление аукционом' : 'Ваша ставка'}
          </h3>
          <p className='text-paragraph-xs text-text-soft-400 mb-4'>
            {isOwner
              ? 'Ставки будут видны после завершения аукциона'
              : 'Ваша ставка скрыта от других участников'
            }
          </p>

          {isBroker && !isOwner && isActive && (
            <>
              <form onSubmit={handleBid} className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='sealed-bid'>Сумма ставки</Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id='sealed-bid'
                        type='number'
                        step='0.01'
                        placeholder={auction.min_price}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
                <FancyButton.Root
                  type='submit'
                  variant='primary'
                  size='medium'
                  className='w-full'
                  disabled={placeBid.isPending}
                >
                  {placeBid.isPending ? 'Отправка...' : 'Отправить ставку'}
                </FancyButton.Root>
              </form>
              <button
                type='button'
                onClick={handleJoin}
                disabled={joinAuction.isPending}
                className='mt-3 w-full text-center text-paragraph-xs text-primary-base hover:underline'
              >
                Присоединиться к аукциону
              </button>
            </>
          )}

          {isOwner && (
            <div className='rounded-xl bg-bg-weak-50 py-4 text-center text-paragraph-sm text-text-soft-400'>
              Вы являетесь владельцем аукциона
            </div>
          )}

          {!isBroker && !isOwner && (
            <div className='rounded-xl bg-bg-weak-50 py-4 text-center text-paragraph-sm text-text-soft-400'>
              Только брокеры могут делать ставки
            </div>
          )}

          <Divider.Root variant='line-spacing' className='my-0 py-4' />
          <div className='space-y-2 text-paragraph-xs'>
            <div className='flex justify-between'>
              <span className='text-text-soft-400'>Начало</span>
              <span className='text-text-sub-600'>{formatDateTime(auction.start_date)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-text-soft-400'>Окончание</span>
              <span className='text-text-sub-600'>{formatDateTime(auction.end_date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === Main page ===
export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = Number(params.id);
  const { data: auction, isLoading } = useAuctionDetail(auctionId);

  if (isLoading) {
    return (
      <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
        <div className='flex flex-1 items-center justify-center py-20'>
          <div className='text-paragraph-sm text-text-soft-400'>Загрузка аукциона...</div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
        <div className='flex flex-1 items-center justify-center py-20'>
          <div className='text-paragraph-sm text-text-soft-400'>Аукцион не найден</div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title={`Аукцион #${auction.id}`}
        description={`Объект #${auction.property_id}`}
        icon={RiAuctionLine}
        backHref='/auctions'
      />

      {auction.mode === 'open' ? (
        <OpenAuctionView auctionId={auctionId} />
      ) : (
        <ClosedAuctionView auctionId={auctionId} />
      )}
    </div>
  );
}
