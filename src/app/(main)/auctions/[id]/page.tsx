'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Award01Icon,
  Clock01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ChampionIcon,
  Coins01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Building03Icon,
  Image01Icon,
} from '@hugeicons/core-free-icons';

import { AuctionDetailSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Modal from '@/shared/ui/modal';
import { useSessionStore } from '@/entities/auth/model/store';
import {
  useAuctionDetail,
  useParticipants,
  useSealedBids,
  usePlaceBid,
  useUpdateBid,
  useShortlist,
  useSelectWinner,
  useCancelAuction,
  useConfirmResult,
  useRejectResult,
} from '@/features/auctions';
import { useQueryClient } from '@tanstack/react-query';
import { dealKeys } from '@/features/deals';
import { useProperty } from '@/features/properties';
import { useAuctionDocumentRequests } from '@/features/document-requests';
import {
  BrokerIncomingRequests,
  DocumentRequestsList,
  RequestDocumentsButton,
  PendingRequestsWarning,
  getRequestLockStatusForBroker,
} from './document-requests-section';
import { useAuctionSocket } from '@/shared/hooks/use-auction-socket';
import { useSealedBidsSocket } from '@/shared/hooks/use-sealed-bids-socket';
import { formatPriceInput, stripPriceFormat } from '@/shared/lib/formatters';
import type { AuctionStatus, AuctionMode, Bid, AuctionLotProperty } from '@/shared/types/auctions';

// --- Helpers ---

const STATUS_CONFIG: Record<AuctionStatus, { label: string; cls: string }> = {
  active: { label: 'Активный', cls: 'bg-emerald-50 text-emerald-700' },
  draft: { label: 'Черновик', cls: 'bg-gray-100 text-gray-600' },
  finished: { label: 'Завершён', cls: 'bg-blue-50 text-blue-700' },
  cancelled: { label: 'Отменён', cls: 'bg-red-50 text-red-700' },
  scheduled: { label: 'Запланирован', cls: 'bg-gray-100 text-gray-600' },
  failed: { label: 'Несостоявшийся', cls: 'bg-red-50 text-red-700' },
};

const MODE_LABELS: Record<AuctionMode, string> = {
  open: 'Открытый',
  closed: 'Закрытый',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  townhouse: 'Таунхаус',
  commercial: 'Коммерция',
  land: 'Земля',
};

const PROPERTY_CLASS_LABELS: Record<string, string> = {
  comfort: 'Комфорт',
  business: 'Бизнес',
  premium: 'Премиум',
  elite: 'Элит',
};

function getPropertyTypeLabel(type: string | null | undefined): string {
  if (!type) return '—';
  return PROPERTY_TYPE_LABELS[String(type).toLowerCase().trim()] || type;
}

function getPropertyClassLabel(cls: string | null | undefined): string {
  if (!cls) return '—';
  return PROPERTY_CLASS_LABELS[String(cls).toLowerCase().trim()] || cls;
}

function formatPrice(value: string | null | undefined) {
  if (value == null) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num);
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0с';
  const totalSec = Math.ceil(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}д ${h}ч ${m}м`;
  if (h > 0) return `${h}ч ${m}м ${s}с`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

function getProgressColor(progress: number): 'blue' | 'orange' | 'red' {
  if (progress >= 80) return 'red';
  if (progress >= 50) return 'orange';
  return 'blue';
}

type CarouselImage = { url?: string | null; external_url?: string | null };

function AuctionImageCarousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (current >= images.length) setCurrent(0);
  }, [images.length, current]);

  if (images.length === 0) {
    return (
      <div className='flex h-72 items-center justify-center bg-gray-50 sm:h-96'>
        <HugeiconsIcon icon={Image01Icon} size={48} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);
  const src = images[current]?.url || images[current]?.external_url || '';

  return (
    <div className='group relative h-72 overflow-hidden bg-gray-50 sm:h-96'>
      <img
        src={src}
        alt=''
        className='h-full w-full object-cover transition-opacity duration-200'
      />
      {images.length > 1 && (
        <>
          <button
            type='button'
            onClick={prev}
            className='absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-opacity hover:bg-white'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-900' />
          </button>
          <button
            type='button'
            onClick={next}
            className='absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-opacity hover:bg-white'
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-900' />
          </button>
          <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'>
            {images.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { error?: string; detail?: string } } };
  return err.response?.data?.error ?? err.response?.data?.detail ?? 'Произошла ошибка';
}

function LotPropertyCard({ prop, index, total }: { prop: AuctionLotProperty; index?: number; total?: number }) {
  const { data: property } = useProperty(prop.id);
  const showIndex = typeof index === 'number' && typeof total === 'number' && total > 1;

  return (
    <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden'>
      <AuctionImageCarousel images={property?.images ?? []} />

      <div className='p-6'>
        {showIndex && (
          <div className='flex items-center gap-2 mb-3'>
            <span className='inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700'>
              {(index as number) + 1} / {total}
            </span>
            <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
              Объект из лота
            </span>
          </div>
        )}
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
            <HugeiconsIcon icon={Building03Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
            Информация об объекте
          </h3>
          <Link href={`/objects/${prop.id}`} className='text-xs font-medium text-blue-600 hover:underline'>
            Подробнее →
          </Link>
        </div>

        {/* Inline "label ... value" — only between xl and 2xl (narrow left column) */}
        <div className='hidden xl:block 2xl:hidden space-y-5 text-[13px]'>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500 shrink-0'>Адрес:</span>
            <span className='font-medium text-gray-900 text-right truncate'>{prop.address}</span>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500 shrink-0'>ID:</span>
            <span className='font-medium text-gray-900 font-mono text-right truncate'>{prop.reference_id}</span>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500 shrink-0'>Тип:</span>
            <span className='font-medium text-gray-900'>{getPropertyTypeLabel(prop.type)}</span>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500 shrink-0'>Площадь:</span>
            <span className='font-medium text-gray-900'>{prop.area ? `${prop.area} м²` : '—'}</span>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500 shrink-0'>Класс:</span>
            <span className='font-medium text-gray-900'>{getPropertyClassLabel(prop.property_class)}</span>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500 shrink-0'>Прайсовая цена:</span>
            <span className='font-semibold text-gray-900'>{prop.price != null ? `${formatPrice(prop.price)} ₽` : 'Скрыта'}</span>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-gray-500 shrink-0'>Комиссия:</span>
            <span className='font-medium text-gray-900'>{prop.commission_rate ? `${prop.commission_rate}%` : '—'}</span>
          </div>
        </div>

        {/* 2-column grid with labels on top — default (< xl) and 2xl+ */}
        <div className='grid grid-cols-2 gap-4 xl:gap-5 2xl:gap-4 xl:hidden 2xl:grid 2xl:grid-cols-5'>
          <div className='col-span-2 2xl:col-span-5'>
            <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Адрес</span>
            <span className='mt-1 block text-[13px] font-medium text-gray-900'>{prop.address}</span>
          </div>

          <div className='space-y-4 2xl:col-span-3'>
            <div>
              <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>ID</span>
              <span className='mt-1 block text-[13px] font-medium text-gray-900 font-mono break-all'>{prop.reference_id}</span>
            </div>
            <div>
              <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Площадь</span>
              <span className='mt-1 block text-[13px] font-medium text-gray-900'>{prop.area ? `${prop.area} м²` : '—'}</span>
            </div>
            <div>
              <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Прайсовая цена</span>
              <span className='mt-1 block text-[13px] font-semibold text-gray-900'>
                {prop.price != null ? `${formatPrice(prop.price)} ₽` : 'Скрыта'}
              </span>
            </div>
          </div>

          <div className='space-y-4 2xl:col-span-2'>
            <div>
              <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Тип</span>
              <span className='mt-1 block text-[13px] font-medium text-gray-900'>{getPropertyTypeLabel(prop.type)}</span>
            </div>
            <div>
              <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Класс</span>
              <span className='mt-1 block text-[13px] font-medium text-gray-900'>{getPropertyClassLabel(prop.property_class)}</span>
            </div>
            <div>
              <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Комиссия</span>
              <span className='mt-1 block text-[13px] font-medium text-gray-900'>{prop.commission_rate ? `${prop.commission_rate}%` : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Place Bid Modal ---

function PlaceBidModal({
  auctionId,
  open,
  onOpenChange,
  existingBid,
  onBidPlaced,
}: {
  auctionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBid?: Bid | null;
  onBidPlaced?: (amount: string) => void;
}) {
  const [amount, setAmount] = React.useState(existingBid?.amount ?? '');
  const placeBid = usePlaceBid();
  const updateBid = useUpdateBid();

  const isUpdate = !!existingBid;
  const mutation = isUpdate ? updateBid : placeBid;

  // Seed the input only on open transitions, not on every existingBid refetch
  // (otherwise WS updates clobber what the user is typing).
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (open && !wasOpen.current) {
      setAmount(existingBid?.amount ?? '');
    }
    wasOpen.current = open;
  }, [open, existingBid]);

  // Hard upper bound (matches MAX_PRICE in shared/lib/validations.ts).
  const MAX_BID = 1_000_000_000_000; // 1 trillion ₽

  const numericAmount = parseFloat(stripPriceFormat(amount)) || 0;
  const isEmpty = !amount.trim();
  const isAboveMax = !isEmpty && numericAmount > MAX_BID;
  const isInvalid = !isEmpty && (numericAmount <= 0 || isNaN(numericAmount));
  const isDisabled = mutation.isPending || isEmpty || isInvalid || isAboveMax;

  const getError = (): string | null => {
    if (isEmpty) return null;
    if (isInvalid) return 'Введите корректную сумму';
    if (isAboveMax) return `Максимальная ставка: ${formatPrice(String(MAX_BID))} ₽`;
    return null;
  };
  const error = getError();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    mutation.mutate(
      { auctionId, data: { amount: stripPriceFormat(amount) } },
      {
        onSuccess: () => {
          toast.success(isUpdate ? 'Ставка обновлена' : 'Ставка размещена');
          onBidPlaced?.(stripPriceFormat(amount));
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header
          title={isUpdate ? 'Обновить ставку' : 'Сделать ставку'}
          description='Введите сумму вашей ставки'
        />
        <form onSubmit={handleSubmit}>
          <Modal.Body className='space-y-4'>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='bid-amount'>
                Сумма ставки <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='bid-amount'
                    type='text'
                    inputMode='decimal'
                    placeholder='0 ₽'
                    value={formatPriceInput(amount)}
                    onChange={(e) => setAmount(stripPriceFormat(e.target.value))}
                  />
                </Input.Wrapper>
              </Input.Root>
              {error && <p className='text-[11px] text-red-500'>{error}</p>}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='basic' size='small'>
                Отмена
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              variant='primary'
              size='small'
              type='submit'
              disabled={isDisabled}
            >
              {mutation.isPending
                ? 'Отправка...'
                : isUpdate
                  ? 'Обновить'
                  : 'Разместить'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Select Winner Modal (manual fallback: backend auto-picks winner on CLOSED finish) ---

function SelectWinnerModal({
  auctionId,
  bids,
  open,
  onOpenChange,
}: {
  auctionId: number;
  bids: Bid[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedBrokerId, setSelectedBrokerId] = React.useState<number | null>(null);
  const selectWinner = useSelectWinner();

  React.useEffect(() => {
    if (!open) setSelectedBrokerId(null);
  }, [open]);

  const handleSubmit = () => {
    if (selectedBrokerId == null) return;
    selectWinner.mutate(
      { auctionId, data: { brokerId: selectedBrokerId } },
      {
        onSuccess: () => {
          toast.success('Победитель выбран');
          setSelectedBrokerId(null);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[500px]'>
        <Modal.Header
          title='Выбор победителя'
          description='Выберите брокера-победителя аукциона'
        />
        <Modal.Body className='max-h-[320px] space-y-2 overflow-y-auto'>
          {bids.length === 0 ? (
            <div className='py-4 text-center text-sm text-gray-400'>
              Нет ставок
            </div>
          ) : (
            bids.map((bid) => {
              const isSelected = selectedBrokerId === bid.broker_id;
              return (
                <button
                  key={bid.id}
                  type='button'
                  role='radio'
                  aria-checked={isSelected}
                  onClick={() => setSelectedBrokerId(bid.broker_id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className='flex items-center gap-2.5'>
                    <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
                      {isSelected && <div className='size-2.5 rounded-full bg-blue-600' />}
                    </div>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {bid.first_name || bid.last_name
                          ? `${bid.first_name ?? ''} ${bid.last_name ?? ''}`.trim()
                          : `Брокер #${bid.broker_id}`}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {formatDateTime(bid.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className='text-base font-semibold text-gray-900'>
                    {formatPrice(bid.amount)} ₽
                  </div>
                </button>
              );
            })
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant='primary'
            size='small'
            disabled={selectedBrokerId == null || selectWinner.isPending}
            onClick={handleSubmit}
          >
            {selectWinner.isPending ? 'Выбор...' : 'Подтвердить'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Live Bid Input for OPEN auction ---

function LiveBidInput({
  sendBid,
  connected,
  currentPrice,
  minPrice,
  minBidIncrement,
  bidsCount,
  hasMyBid,
  myBidAmount,
  isHighestBidder,
  wsError,
}: {
  sendBid: (amount: string) => void;
  connected: boolean;
  currentPrice: string | null;
  minPrice: string | null;
  minBidIncrement: string;
  bidsCount: number;
  hasMyBid: boolean;
  myBidAmount: string | null;
  isHighestBidder: boolean;
  wsError: string | null;
}) {
  // Backend hides min_price / current_price from brokers when the developer
  // disabled `show_price_to_brokers`. In that case the broker sees no
  // numeric minimum — the server still validates on submit.
  const pricesHidden = minPrice == null && currentPrice == null;

  // "First bid" in the auction (across all brokers) — starts from min_price.
  const isFirstGlobalBid = bidsCount === 0 || parseFloat(currentPrice ?? '0') <= 0;
  const [amount, setAmount] = React.useState('');

  // Minimum allowed bid:
  // - first bid: >= min_price
  // - subsequent: > current leader + increment
  // - hidden: no client-side floor (server enforces).
  const minBid = pricesHidden
    ? null
    : isFirstGlobalBid
      ? parseFloat(minPrice ?? '0')
      : parseFloat(currentPrice ?? '0') + (parseFloat(minBidIncrement) || 0);

  // Hard upper bound to keep absurd values out (also matches MAX_PRICE in
  // shared/lib/validations.ts for property pricing).
  const MAX_BID = 1_000_000_000_000; // 1 trillion ₽

  const numericAmount = parseFloat(amount) || 0;
  const isEmpty = !amount.trim();
  const isBelowMin = !isEmpty && minBid != null && numericAmount < minBid;
  const isAboveMax = !isEmpty && numericAmount > MAX_BID;
  const isInvalid = !isEmpty && (numericAmount <= 0 || isNaN(numericAmount));
  const isDisabled = !connected || isEmpty || isBelowMin || isAboveMax || isInvalid;

  const getError = (): string | null => {
    if (isEmpty) return null;
    if (isInvalid) return 'Введите корректную сумму';
    if (isBelowMin && minBid != null)
      return `Минимальная ставка: ${formatPrice(String(Math.ceil(minBid)))} ₽`;
    if (isAboveMax) return `Максимальная ставка: ${formatPrice(String(MAX_BID))} ₽`;
    return null;
  };
  const error = getError();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    sendBid(amount);
    setAmount('');
  };

  const title = hasMyBid ? 'Повысить ставку' : 'Сделать ставку';
  const submitLabel = connected
    ? (hasMyBid ? 'Повысить' : 'Поставить')
    : 'Подключение...';

  return (
    <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
      <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3'>
        <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
        {title}
      </h3>
      {hasMyBid && myBidAmount != null && (
        <div className='mb-3 rounded-lg bg-blue-50/70 px-3 py-2'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Текущая ставка</span>
          <span className='mt-0.5 block text-[15px] font-bold text-blue-700'>{formatPrice(myBidAmount)} ₽</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='live-bid-amount'>
            {hasMyBid ? 'Новая сумма (выше текущей)' : 'Сумма ставки'}
          </Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                id='live-bid-amount'
                type='text'
                inputMode='decimal'
                placeholder={
                  minBid != null
                    ? formatPriceInput(String(Math.ceil(minBid))) + ' ₽'
                    : 'Введите вашу ставку'
                }
                value={formatPriceInput(amount)}
                onChange={(e) => setAmount(stripPriceFormat(e.target.value))}
              />
            </Input.Wrapper>
          </Input.Root>
          {wsError ? (
            <p className='text-[11px] text-red-500'>{wsError}</p>
          ) : error ? (
            <p className='text-[11px] text-red-500'>{error}</p>
          ) : (
            <p className='text-[11px] text-gray-400'>
              {pricesHidden
                ? 'Стартовая цена скрыта застройщиком'
                : isHighestBidder && minBid != null
                  ? `Вы лидер. Можно повысить (минимум: ${formatPrice(String(Math.ceil(minBid)))} ₽)`
                  : isFirstGlobalBid && minBid != null
                    ? `Минимум: ${formatPrice(String(Math.ceil(minBid)))} ₽ (стартовая цена)`
                    : minBid != null
                      ? `Минимум: ${formatPrice(String(Math.ceil(minBid)))} ₽`
                      : 'Введите вашу ставку'}
            </p>
          )}
        </div>
        <FancyButton.Root variant='primary' size='small' type='submit' className='w-full' disabled={isDisabled || !!wsError}>
          <HugeiconsIcon icon={Coins01Icon} size={16} />
          {submitLabel}
        </FancyButton.Root>
      </form>
    </div>
  );
}

// --- Main Page ---

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = Number(params.id);
  const user = useSessionStore((s) => s.user);
  const isDeveloper = user?.role === 'developer' || user?.is_developer === true;
  const isBroker = user?.role === 'broker' || user?.is_broker === true;
  const isBrokerVerified = user?.broker?.verification_status === 'accepted';

  const isAdmin = user?.role === 'admin' || user?.is_admin === true;
  const queryClient = useQueryClient();
  const { data: auction, isLoading: isAuctionLoading, refetch } = useAuctionDetail(auctionId);
  const refetchRef = React.useRef(refetch);
  refetchRef.current = refetch;
  const isOpenAuction = auction?.mode === 'open';
  const isOwnerOrAdmin = auction != null && (auction.owner_id === user?.id || isAdmin);
  // For CLOSED auctions, participants and sealed-bids are owner/admin only
  const canViewClosedData = auction != null && !isOpenAuction && isOwnerOrAdmin;
  const participantsEnabled = auction != null && (isOpenAuction || isOwnerOrAdmin);
  const { data: participants, isLoading: isParticipantsLoading } = useParticipants(auctionId, { enabled: participantsEnabled });
  const { data: sealedBids, isLoading: isSealedBidsLoading } = useSealedBids(auctionId, { enabled: canViewClosedData });

  const isActiveOpen = isOpenAuction && auction?.status === 'active';
  const isActiveClosed = !isOpenAuction && auction?.status === 'active';

  // WebSocket for OPEN auctions
  const ws = useAuctionSocket(auctionId, isActiveOpen === true);

  // WebSocket for CLOSED auctions (owner/admin only, read-only)
  const sealedWs = useSealedBidsSocket(auctionId, isActiveClosed === true && isOwnerOrAdmin);

  // Refetch auction detail when WS reports auction finished (to get winner_bid data)
  // Also invalidate deals cache so /deals page shows new deal without reload
  const wsStatus = ws.auction?.status;
  React.useEffect(() => {
    if (wsStatus === 'finished' && auction?.status !== 'finished') {
      refetchRef.current();
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    }
  }, [wsStatus, auction?.status, queryClient]);

  // Auto-refetch when auction end_date passes (for all auction types, including closed for brokers)
  React.useEffect(() => {
    if (!auction || auction.status !== 'active') return;
    const endMs = new Date(auction.end_date).getTime();
    const remaining = endMs - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => {
      refetchRef.current();
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
    }, remaining + 2000);
    return () => clearTimeout(timer);
  }, [auction?.status, auction?.end_date, queryClient]);

  // Show skeleton until all relevant data is loaded (including WS snapshot for active OPEN)
  const isLoading = isAuctionLoading
    || (participantsEnabled && isParticipantsLoading)
    || (canViewClosedData && isSealedBidsLoading)
    || (isActiveOpen && !ws.auction);

  const cancelAuction = useCancelAuction();
  const shortlist = useShortlist();
  const confirmResult = useConfirmResult();
  const rejectResult = useRejectResult();

  // Document requests: visible to owner/admin (all) or broker (their own).
  const documentRequestsEnabled = auction != null && (isOwnerOrAdmin || isBroker);
  const { data: documentRequests } = useAuctionDocumentRequests(auctionId, {
    enabled: documentRequestsEnabled,
  });
  const myIncomingRequests = React.useMemo(() => {
    if (!documentRequests || !user?.id) return [];
    return documentRequests.filter((r) => r.broker === user.id);
  }, [documentRequests, user?.id]);
  const pendingRequestsCount = React.useMemo(() => {
    if (!documentRequests) return 0;
    return documentRequests.filter((r) => r.status === 'pending').length;
  }, [documentRequests]);

  const [optimisticBid, setOptimisticBid] = React.useState<Bid | null>(null);
  const [pendingOpenBid, setPendingOpenBid] = React.useState<Bid | null>(null);
  const [bidModalOpen, setBidModalOpen] = React.useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = React.useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false);
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [shortlistIds, setShortlistIds] = React.useState<Set<number>>(
    new Set(),
  );

  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (!auction) return;
    const update = () => setProgress(getTimeProgress(auction.start_date, auction.end_date));
    update();
    if (auction.status !== 'active') return;
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [auction?.status, auction?.start_date, auction?.end_date]);

  // Countdown for scheduled auctions — auto-refetch when start_date is reached
  const [scheduledRemaining, setScheduledRemaining] = React.useState<number>(0);
  React.useEffect(() => {
    if (!auction || auction.status !== 'scheduled') return;
    const startMs = new Date(auction.start_date).getTime();
    const update = () => {
      const remaining = startMs - Date.now();
      setScheduledRemaining(Math.max(0, remaining));
      if (remaining <= 0) {
        refetchRef.current();
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [auction?.status, auction?.start_date]);

  // Show WS errors as toast (except bid-related ones shown inline)
  React.useEffect(() => {
    if (ws.error && !ws.error.includes('лидер') && !ws.error.includes('lowest') && !ws.error.includes('leading')) {
      toast.error(ws.error);
    }
  }, [ws.error]);

  // Clear pending open bid once WS confirms it
  React.useEffect(() => {
    if (!pendingOpenBid) return;
    if (ws.bids.some((b) => b.broker_id === user?.id)) {
      setPendingOpenBid(null);
    }
  }, [ws.bids, pendingOpenBid, user?.id]);

  // Clear optimistic bid once real data is available (must be before early returns for hooks consistency)
  const hasRealBid = React.useMemo(() => {
    if (!auction) return false;
    const isOpen = auction.mode === 'open';
    const bids = Array.isArray(auction.bids) ? auction.bids : [];
    if (isOpen) {
      return ws.bids.some((b) => b.broker_id === user?.id) || bids.some((b) => b.broker_id === user?.id);
    }
    const sealed = Array.isArray(sealedBids) ? sealedBids : [];
    return sealed.some((b) => b.broker_id === user?.id);
  }, [auction, ws.bids, sealedBids, user?.id]);

  React.useEffect(() => {
    if (hasRealBid) setOptimisticBid(null);
  }, [hasRealBid]);

  if (isLoading) {
    return <AuctionDetailSkeleton />;
  }

  if (!auction) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20'>
        <div className='text-sm font-medium text-gray-500'>
          Аукцион не найден
        </div>
        <Link href='/auctions'>
          <FancyButton.Root variant='basic' size='small'>
            Назад к аукционам
          </FancyButton.Root>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[auction.status];
  const isActive = auction.status === 'active';
  const isFinished = auction.status === 'finished';
  const isOwner = auction.owner_id === user?.id;

  // Merge WS data with REST data for live updates
  const liveAuction = isActiveOpen && ws.auction ? ws.auction : auction;
  const liveBidsCount = isActiveOpen && ws.auction
    ? ws.auction.bids_count
    : sealedWs.auction
      ? sealedWs.auction.bids_count
      : auction.bids_count;
  const liveCurrentPrice = isActiveOpen && ws.auction
    ? ws.auction.current_price
    : sealedWs.auction
      ? sealedWs.auction.current_price
      : auction.current_price;
  const liveHighestBidId = isActiveOpen && ws.auction
    ? ws.auction.highest_bid_id
    : sealedWs.auction
      ? sealedWs.auction.highest_bid_id
      : auction.highest_bid_id;
  // For open auctions: check bids from auction detail REST response (broker_id)
  const auctionBids = Array.isArray(auction.bids) ? auction.bids : [];
  const isHighestBidder = liveHighestBidId != null && (
    ws.bids.some((b) => b.id === liveHighestBidId && b.broker_id === user?.id)
    || auctionBids.some((b) => b.id === liveHighestBidId && b.broker_id === user?.id)
  );

  const restParticipantIds: number[] = participants?.participants ?? [];
  const participantIds: number[] = isActiveOpen
    ? Array.from(new Set([...restParticipantIds, ...ws.participants]))
    : restParticipantIds;
  const participantDetails: { id: number; name: string }[] = participants?.participants_detail ?? [];
  const isParticipant = participantIds.includes(user?.id ?? 0)
    || !!auction.myBid;
  // For closed auctions, prefer WS sealed bids over REST when available
  const restBidsList = Array.isArray(sealedBids) ? sealedBids : [];
  const wsSealedBidsList: typeof restBidsList = sealedWs.bids.map((b) => ({
    id: b.id,
    auction_id: b.auction_id,
    broker_id: b.broker_id,
    amount: b.amount,
    first_name: '',
    last_name: '',
    created_at: b.created_at,
    updated_at: b.created_at,
  }));
  const bidsList = sealedWs.bids.length > 0 ? wsSealedBidsList : restBidsList;
  const mySealedBid = bidsList.find((b) => b.broker_id === user?.id);
  const myRestBid = auctionBids.find((b) => b.broker_id === user?.id);
  // Also check WS bids (broker) — first match is the latest bid
  const myWsBid = ws.bids.find((b) => b.broker_id === user?.id);

  // For open auctions: WS bid → optimistic (pending send) → REST bid
  // For closed auctions: use auction.myBid from API, fallback to sealed bids lookup
  const myRestBidObj: Bid | undefined = myRestBid
    ? { id: myRestBid.id, auction_id: auctionId, broker_id: user?.id ?? 0, amount: myRestBid.amount, first_name: '', last_name: '', created_at: myRestBid.created_at, updated_at: myRestBid.created_at }
    : undefined;
  const apiMyBid: Bid | undefined = auction.myBid
    ? { id: auction.myBid.id, auction_id: auctionId, broker_id: auction.myBid.broker_id, amount: auction.myBid.amount, first_name: '', last_name: '', created_at: auction.myBid.created_at, updated_at: auction.myBid.created_at }
    : undefined;
  const realMyBid: Bid | undefined = isOpenAuction
    ? (myWsBid ? { id: myWsBid.id, auction_id: auctionId, broker_id: user?.id ?? 0, amount: myWsBid.amount, first_name: '', last_name: '', created_at: myWsBid.created_at, updated_at: myWsBid.created_at } : undefined)
    ?? pendingOpenBid
    ?? myRestBidObj
    : apiMyBid ?? mySealedBid ?? myRestBidObj;
  // Use optimistic bid until real data arrives (for closed auctions)
  const myBid: Bid | undefined = realMyBid ?? optimisticBid ?? undefined;

  const handleSendBid = (amount: string) => {
    const now = new Date().toISOString();
    setPendingOpenBid({
      id: -1,
      auction_id: auctionId,
      broker_id: user?.id ?? 0,
      amount,
      first_name: '',
      last_name: '',
      created_at: now,
      updated_at: now,
    });
    ws.sendBid(amount);
  };

  const handleCancel = () => {
    cancelAuction.mutate(auctionId, {
      onSuccess: () => {
        toast.success('Аукцион отменён');
        setCancelConfirmOpen(false);
      },
      onError: (error) => {
        toast.error(getApiError(error));
      },
    });
  };

  const toggleShortlist = (participantId: number) => {
    setShortlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(participantId)) {
        next.delete(participantId);
      } else {
        next.add(participantId);
      }
      return next;
    });
  };

  const handleShortlist = () => {
    if (shortlistIds.size === 0) return;
    shortlist.mutate(
      {
        auctionId,
        data: { bid_ids: Array.from(shortlistIds) },
      },
      {
        onSuccess: () => {
          toast.success('Шорт-лист сформирован');
          setShortlistIds(new Set());
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  };

  return (
    <div className='w-full px-8 py-8 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/auctions' className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors'>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color='currentColor' strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-gray-900'>Аукцион #{auction.id}</h1>
            <span className='text-[13px] text-gray-400'>
              {auction.properties?.length > 0
                ? auction.properties[0].address + (auction.properties.length > 1 ? ` (+${auction.properties.length - 1})` : '')
                : auction.real_property?.address}
            </span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {!isDeveloper && !isAdmin && isActive && !isOpenAuction && (
            <div className='relative group'>
              <FancyButton.Root
                variant='primary'
                size='small'
                onClick={() => setBidModalOpen(true)}
                disabled={!isBrokerVerified}
              >
                <HugeiconsIcon icon={Coins01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                {myBid ? 'Изменить ставку' : 'Сделать ставку'}
              </FancyButton.Root>
              {!isBrokerVerified && (
                <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                  Для участия необходимо пройти верификацию
                </div>
              )}
            </div>
          )}
          {isOwner && isFinished && !auction.winner_bid && bidsList.length > 0 && (
            <FancyButton.Root variant='primary' size='small' onClick={() => setWinnerModalOpen(true)}>
              <HugeiconsIcon icon={ChampionIcon} size={16} color='currentColor' strokeWidth={1.5} />
              Выбрать победителя
            </FancyButton.Root>
          )}
          {isOwnerOrAdmin && auction.status === 'scheduled' && (
            <FancyButton.Root variant='destructive' size='small' onClick={() => setCancelConfirmOpen(true)} disabled={cancelAuction.isPending}>
              <HugeiconsIcon icon={Cancel01Icon} size={16} color='currentColor' strokeWidth={1.5} />
              {cancelAuction.isPending ? 'Отмена...' : 'Отменить'}
            </FancyButton.Root>
          )}
        </div>
      </div>

      {/* Main: single col < xl · 2/5 + 3/5 at xl · 50/50 at 2xl */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-5 2xl:grid-cols-2'>
        {/* Left — object info + carousel (moves to bottom on single-col layout). Renders one card per property in the lot. */}
        <div className='space-y-4 order-last xl:order-first xl:col-span-2 2xl:col-span-1'>
          {auction.properties?.map((prop, idx) => (
            <LotPropertyCard
              key={prop.id}
              prop={prop}
              index={idx}
              total={auction.properties.length}
            />
          ))}
        </div>

        {/* Right — all auction functions */}
        <div className='space-y-4 xl:col-span-3 2xl:col-span-1'>
          {/* KPI Row — cards render only when data is available (brokers don't see min/current/bids in CLOSED auctions) */}
          {(() => {
            const showCurrentPrice = liveCurrentPrice != null;
            const showMinPrice = auction.min_price != null;
            // For OPEN auctions bids_count == number of unique participants (1 bid per broker).
            // Brokers don't see the participants count on OPEN auctions.
            const showBidsCount = liveBidsCount != null && !(isOpenAuction && isBroker);
            const showLotTotal = auction.lot_total_price != null;
            const showIncrement = isOpenAuction && auction.min_bid_increment != null;
            const visibleCount = [
              showCurrentPrice,
              showMinPrice,
              showBidsCount,
              showLotTotal,
              showIncrement,
            ].filter(Boolean).length;
            if (visibleCount === 0) return null;
            return (
              <div className='grid grid-cols-2 gap-3'>
                {showCurrentPrice && (
                  <div className='rounded-xl border border-blue-200 bg-blue-50/50 p-4'>
                    <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Лидирующая ставка</span>
                    <span className='mt-1 block text-[17px] font-bold text-blue-700'>{formatPrice(liveCurrentPrice)} ₽</span>
                  </div>
                )}
                {showMinPrice && (
                  <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
                    <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Стартовая цена</span>
                    <span className='mt-1 block text-[17px] font-bold text-gray-900'>{formatPrice(auction.min_price)} ₽</span>
                  </div>
                )}
                {showBidsCount && (
                  <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
                    <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                      {isOpenAuction ? 'Участников' : 'Ставок'}
                    </span>
                    <span className='mt-1 block text-[17px] font-bold text-gray-900'>{liveBidsCount}</span>
                  </div>
                )}
                {showLotTotal && (
                  <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
                    <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Сумма лота</span>
                    <span className='mt-1 block text-[17px] font-bold text-gray-900'>{formatPrice(auction.lot_total_price)} ₽</span>
                  </div>
                )}
                {showIncrement && (
                  <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
                    <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Шаг ставки</span>
                    <span className='mt-1 block text-[17px] font-bold text-gray-900'>{formatPrice(auction.min_bid_increment)} ₽</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Info + Progress */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-[14px] font-semibold text-gray-900'>Аукцион #{auction.id}</h3>
              <div className='flex items-center gap-2'>
                <span className={`${statusCfg.cls} text-xs font-medium px-2.5 py-0.5 rounded-full`}>{statusCfg.label}</span>
                <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600'>{MODE_LABELS[auction.mode]}</span>
              </div>
            </div>

            {isActive && (
              <div className='mt-4'>
                <div className='h-1.5 rounded-full bg-gray-100'><div className='h-full rounded-full bg-blue-500' style={{ width: `${progress}%` }} /></div>
                <div className='mt-1.5 flex justify-between text-[11px] text-gray-400'>
                  <span>{formatDateTime(auction.start_date)}</span>
                  <span>{progress}%</span>
                  <span>{formatDateTime(auction.end_date)}</span>
                </div>
              </div>
            )}

            {!isActive && (
              <div className='mt-4 space-y-3'>
                {auction.status === 'scheduled' && scheduledRemaining > 0 && (
                  <div className='flex items-center gap-3 rounded-lg bg-blue-50 p-3'>
                    <HugeiconsIcon icon={Clock01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-blue-500' />
                    <div>
                      <div className='text-sm font-medium text-gray-900'>До начала аукциона</div>
                      <div className='text-lg font-bold text-blue-700'>{formatCountdown(scheduledRemaining)}</div>
                    </div>
                  </div>
                )}
                {auction.status === 'scheduled' && scheduledRemaining <= 0 && (
                  <div className='flex items-center gap-3 rounded-lg bg-emerald-50 p-3'>
                    <HugeiconsIcon icon={Clock01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-emerald-500' />
                    <span className='text-sm font-medium text-emerald-700'>Аукцион начинается...</span>
                  </div>
                )}
                <div className='grid grid-cols-2 gap-4'>
                  <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Начало</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(auction.start_date)}</span></div>
                  <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Окончание</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(auction.end_date)}</span></div>
                </div>
              </div>
            )}

            {auction.winner_bid && (
              <div className='mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-4'>
                <HugeiconsIcon icon={ChampionIcon} size={20} color='currentColor' strokeWidth={1.5} className='text-emerald-500' />
                <div>
                  <div className='text-sm font-medium text-gray-900'>
                    {isOpenAuction ? 'Победитель определён' : 'Победитель определён автоматически'}
                  </div>
                  <div className='text-xs text-gray-500'>{auction.winner_bid.broker.fullname} — {formatPrice(auction.winner_bid.amount)} ₽</div>
                </div>
              </div>
            )}

            {/* Deal failed — documents not uploaded in time */}
            {auction.has_failed_deal && (
              <div className='mt-4 rounded-lg bg-red-50 p-4'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-red-500' />
                  <p className='text-sm font-medium text-red-700'>Сделка несостоявшаяся</p>
                </div>
                <p className='text-xs text-gray-600 mt-1.5'>
                  Победитель не предоставил документы в установленный срок (5 дней). Сделка автоматически помечена как несостоявшаяся.
                </p>
              </div>
            )}

            {/* Owner decision panel */}
            {isFinished && isOwnerOrAdmin && auction.owner_decision === 'pending' && auction.winner_bid && !auction.has_failed_deal && (
              <div className='mt-4 rounded-lg border border-gray-200 bg-white p-4 space-y-3'>
                <div>
                  <p className='text-sm font-semibold text-gray-900'>Требуется ваше решение</p>
                  <p className='text-xs text-gray-500 mt-1'>Подтвердите результат для создания сделки или отклоните с указанием причины.</p>
                </div>
                <PendingRequestsWarning pendingCount={pendingRequestsCount} />
                <div className='flex flex-wrap items-center gap-2'>
                  <FancyButton.Root
                    variant='primary'
                    size='small'
                    onClick={() => {
                      confirmResult.mutate(auctionId, {
                        onSuccess: () => {
                          toast.success('Результат подтверждён. Сделка создана.');
                          queryClient.invalidateQueries({ queryKey: dealKeys.all });
                        },
                        onError: (error) => toast.error(getApiError(error)),
                      });
                    }}
                    disabled={confirmResult.isPending}
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color='currentColor' strokeWidth={1.5} />
                    {confirmResult.isPending ? 'Подтверждение...' : 'Подтвердить результат'}
                  </FancyButton.Root>
                  <FancyButton.Root
                    variant='destructive'
                    size='small'
                    onClick={() => setRejectModalOpen(true)}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                    Отклонить результат
                  </FancyButton.Root>
                </div>
              </div>
            )}

            {/* Decision: confirmed */}
            {auction.owner_decision === 'confirmed' && (
              <div className='mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-4'>
                <div className='size-2 rounded-full bg-emerald-500' />
                <div>
                  <p className='text-sm font-medium text-emerald-700'>Результат подтверждён</p>
                  {auction.owner_decided_at && (
                    <p className='text-xs text-gray-500'>{formatDateTime(auction.owner_decided_at)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Decision: rejected / failed */}
            {(auction.owner_decision === 'rejected' || auction.status === 'failed') && (
              <div className='mt-4 rounded-lg bg-red-50 p-4'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-red-500' />
                  <p className='text-sm font-medium text-red-700'>Результат отклонён — аукцион несостоявшийся</p>
                </div>
                {auction.owner_rejection_reason && (
                  <p className='text-xs text-gray-600 mt-1.5'>Причина: {auction.owner_rejection_reason}</p>
                )}
                {auction.owner_decided_at && (
                  <p className='text-xs text-gray-400 mt-1'>{formatDateTime(auction.owner_decided_at)}</p>
                )}
              </div>
            )}
          </div>


          {/* Sealed Bids — owner */}
          {isOwner && bidsList.length > 0 && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-4'>
                <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />Ставки
              </h3>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b border-gray-100'>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Участник</th>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Сумма</th>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Дата</th>
                    <th className='pb-2 w-20' />
                  </tr>
                </thead>
                <tbody className='text-[13px]'>
                  {bidsList.map((bid) => (
                    <tr key={bid.id} className='border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors'>
                      <td className='py-3 font-medium text-gray-900'>
                        {bid.first_name || bid.last_name
                          ? `${bid.first_name ?? ''} ${bid.last_name ?? ''}`.trim()
                          : `Брокер #${bid.broker_id}`}
                      </td>
                      <td className='py-3 font-semibold text-gray-900'>{formatPrice(bid.amount)} ₽</td>
                      <td className='py-3 text-gray-400'>{formatDateTime(bid.created_at)}</td>
                      <td className='py-3'>{auction.winner_bid?.id === bid.id && <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>Победитель</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Live bids feed — OPEN auction. Owner/admin see full history; brokers see anonymized history. */}
          {isActiveOpen && ws.bids.length > 0 && (() => {
            // Show full history, newest first. Anonymize broker IDs for non-owners.
            const sortedBids = [...ws.bids].sort(
              (a, b) =>
                new Date(b.updated_at ?? b.created_at).getTime() -
                new Date(a.updated_at ?? a.created_at).getTime(),
            );
            const anonymize = !isOwnerOrAdmin;
            const brokerAlias = new Map<number, number>();
            for (const b of [...ws.bids].sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            )) {
              if (!brokerAlias.has(b.broker_id)) brokerAlias.set(b.broker_id, brokerAlias.size + 1);
            }
            return (
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
                    <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
                    Ставки ({sortedBids.length})
                  </h3>
                  {ws.connected && (
                    <span className='inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600'>
                      <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
                      Online
                    </span>
                  )}
                </div>
                <div className='space-y-2 max-h-80 overflow-y-auto'>
                  {sortedBids.map((bid, idx) => {
                    const isLeader = idx === 0;
                    const ts = bid.updated_at ?? bid.created_at;
                    const display = anonymize
                      ? `Брокер #${brokerAlias.get(bid.broker_id) ?? '?'}`
                      : `#${bid.broker_id}`;
                    return (
                      <div key={bid.id} className='flex items-center justify-between rounded-lg px-3 py-2 hover:bg-blue-50/20 transition-colors'>
                        <div className='flex items-center gap-2.5'>
                          <div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>
                            {anonymize ? brokerAlias.get(bid.broker_id) ?? '?' : `#${bid.broker_id}`}
                          </div>
                          {!anonymize && <span className='text-[12px] text-gray-500'>{display}</span>}
                          <span className='text-[13px] font-semibold text-gray-900'>{formatPrice(bid.amount)} ₽</span>
                          {isLeader && (
                            <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>Лидер</span>
                          )}
                        </div>
                        <span className='text-[11px] text-gray-400'>
                          {new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Document requests — broker's incoming */}
          {isBroker && myIncomingRequests.length > 0 && (
            <BrokerIncomingRequests requests={myIncomingRequests} />
          )}

          {/* Document requests — owner/admin full list */}
          {isOwnerOrAdmin && documentRequests && documentRequests.length > 0 && (
            <DocumentRequestsList requests={documentRequests} />
          )}

          {/* My bid — participant */}
          {!isDeveloper && isParticipant && myBid && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-4'>
                <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />Моя ставка
              </h3>
              <div className='grid grid-cols-3 gap-4'>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Сумма</span><span className='mt-1 block text-base font-semibold text-gray-900'>{formatPrice(myBid.amount)} ₽</span></div>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Дата</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(myBid.created_at)}</span></div>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Обновлена</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(myBid.updated_at)}</span></div>
              </div>
            </div>
          )}


          {/* Live bid input — OPEN auction, broker (participation auto-registered on first bid) */}
          {isActiveOpen && isBroker && (
            <LiveBidInput
              sendBid={handleSendBid}
              connected={ws.connected}
              currentPrice={liveCurrentPrice ?? null}
              minPrice={auction.min_price ?? null}
              minBidIncrement={auction.min_bid_increment ?? '0'}
              bidsCount={liveBidsCount ?? 0}
              hasMyBid={!!myBid}
              myBidAmount={myBid?.amount ?? null}
              isHighestBidder={isHighestBidder}
              wsError={ws.error}
            />
          )}

          {/* Participants — owner/admin only (hidden for brokers in both open and closed auctions) */}
          {isOwnerOrAdmin && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
              <h3 className='text-[14px] font-semibold text-gray-900'>
                Участники ({participantIds.length})
              </h3>
              {participantIds.length === 0 ? (
                <div className='py-6 text-center text-[13px] text-gray-400'>Пока нет участников</div>
              ) : (
                <div className='mt-3 space-y-1.5'>
                  {(() => {
                    const winnerId = auction.winner_bid?.broker.id ?? null;
                    const orderedIds = winnerId != null && participantIds.includes(winnerId)
                      ? [winnerId, ...participantIds.filter((pid) => pid !== winnerId)]
                      : participantIds;
                    return orderedIds.map((pid) => {
                      const detail = participantDetails.find((d) => d.id === pid);
                      const name = detail?.name ?? `Участник #${pid}`;
                      const initials = name.startsWith('#') ? `#${pid}` : name.slice(0, 2).toUpperCase();
                      const lockStatus = getRequestLockStatusForBroker(documentRequests, pid);
                      const isWinner = winnerId === pid;
                      return (
                        <div key={pid} className='flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-blue-50/20 transition-colors'>
                          <div className='flex items-center gap-2.5 min-w-0'>
                            <div className='size-7 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>
                              {initials}
                            </div>
                            <span className='text-[13px] font-medium text-gray-900 truncate'>{name}</span>
                            {isWinner && (
                              <span className='shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>Победитель</span>
                            )}
                          </div>
                          {isWinner && (
                            <RequestDocumentsButton
                              auctionId={auctionId}
                              brokerId={pid}
                              brokerName={name}
                              lockStatus={lockStatus}
                            />
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Broker status */}
          {!isDeveloper && !isAdmin && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
              <h3 className='text-[14px] font-semibold text-gray-900 mb-3'>Ваш статус</h3>
              <div className='space-y-2.5 text-[13px]'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Участие</span>
                  {isParticipant
                    ? <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'>Участвуете</span>
                    : <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600'>Не участвуете</span>
                  }
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Ваша ставка</span>
                  {myBid ? <span className='font-semibold text-gray-900'>{formatPrice(myBid.amount)} ₽</span> : <span className='text-gray-400'>—</span>}
                </div>
                {auction.winner_bid && myBid && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Результат</span>
                    {auction.winner_bid.broker.id === (myBid.broker_id ?? user?.id)
                      ? <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'>Победа</span>
                      : <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600'>Не выиграли</span>
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PlaceBidModal
        auctionId={auctionId}
        open={bidModalOpen}
        onOpenChange={setBidModalOpen}
        existingBid={myBid}
        onBidPlaced={(amount) => {
          const now = new Date().toISOString();
          setOptimisticBid({
            id: -1,
            auction_id: auctionId,
            broker_id: user?.id ?? 0,
            amount,
            first_name: '',
            last_name: '',
            created_at: now,
            updated_at: now,
          });
        }}
      />
      {isOwner && <SelectWinnerModal auctionId={auctionId} bids={bidsList} open={winnerModalOpen} onOpenChange={setWinnerModalOpen} />}

      {/* Cancel confirmation */}
      <Modal.Root open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <Modal.Content className='max-w-[400px]'>
          <Modal.Header
            title='Отменить аукцион?'
            description='Это действие необратимо. Аукцион будет отменён для всех участников.'
          />
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='basic' size='small'>Нет, оставить</FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root variant='destructive' size='small' onClick={handleCancel} disabled={cancelAuction.isPending}>
              {cancelAuction.isPending ? 'Отмена...' : 'Да, отменить'}
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Reject result modal */}
      <Modal.Root open={rejectModalOpen} onOpenChange={(open) => { setRejectModalOpen(open); if (!open) setRejectReason(''); }}>
        <Modal.Content className='max-w-[480px]'>
          <Modal.Header
            title='Отклонить результат аукциона'
            description='Аукцион станет несостоявшимся. Это действие необратимо. Укажите причину отклонения.'
          />
          <Modal.Body className='space-y-3'>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder='Причина отклонения (обязательно)'
              rows={3}
              className='w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors resize-none'
            />
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='basic' size='small'>Отмена</FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              variant='destructive'
              size='small'
              disabled={!rejectReason.trim() || rejectResult.isPending}
              onClick={() => {
                rejectResult.mutate(
                  { auctionId, data: { reason: rejectReason.trim() } },
                  {
                    onSuccess: () => {
                      toast.success('Результат отклонён. Аукцион несостоявшийся.');
                      setRejectModalOpen(false);
                      setRejectReason('');
                    },
                    onError: (error) => toast.error(getApiError(error)),
                  },
                );
              }}
            >
              {rejectResult.isPending ? 'Отклонение...' : 'Отклонить'}
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
