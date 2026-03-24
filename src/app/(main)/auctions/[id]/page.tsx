'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Award01Icon,
  Clock01Icon,
  UserIcon,
  ArrowLeft01Icon,
  ChampionIcon,
  Coins01Icon,
  CheckListIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';

import { DetailPageSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Modal from '@/shared/ui/modal';
import { useSessionStore } from '@/entities/auth/model/store';
import {
  useAuctionDetail,
  useParticipants,
  useJoinAuction,
  useSealedBids,
  usePlaceBid,
  useUpdateBid,
  useShortlist,
  useSelectWinner,
} from '@/features/auctions';
import { useAuctionSocket } from '@/shared/hooks/use-auction-socket';
import { formatPriceInput, stripPriceFormat } from '@/shared/lib/formatters';
import type { AuctionStatus, AuctionMode, Bid } from '@/shared/types/auctions';

// --- Helpers ---

const STATUS_CONFIG: Record<AuctionStatus, { label: string; cls: string }> = {
  active: { label: 'Активный', cls: 'bg-emerald-50 text-emerald-700' },
  draft: { label: 'Черновик', cls: 'bg-gray-100 text-gray-600' },
  finished: { label: 'Завершён', cls: 'bg-blue-50 text-blue-700' },
  cancelled: { label: 'Отменён', cls: 'bg-red-50 text-red-700' },
  scheduled: { 'label': 'Запланирован', cls: 'bg-gray-100 text-gray-600' }
};

const MODE_LABELS: Record<AuctionMode, string> = {
  open: 'Открытый',
  closed: 'Закрытый',
};

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽', TRY: '₺' };

function formatPrice(value: string, currency?: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? currency) : '';
  return new Intl.NumberFormat('ru-RU').format(num) + (symbol ? ` ${symbol}` : '');
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

function getProgressColor(progress: number): 'blue' | 'orange' | 'red' {
  if (progress >= 80) return 'red';
  if (progress >= 50) return 'orange';
  return 'blue';
}

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { error?: string; detail?: string } } };
  return err.response?.data?.error ?? err.response?.data?.detail ?? 'Произошла ошибка';
}

// --- Place Bid Modal ---

function PlaceBidModal({
  auctionId,
  open,
  onOpenChange,
  existingBid,
  minPrice,
}: {
  auctionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBid?: Bid | null;
  minPrice: string;
}) {
  const [amount, setAmount] = React.useState(existingBid?.amount ?? '');
  const placeBid = usePlaceBid();
  const updateBid = useUpdateBid();

  const isUpdate = !!existingBid;
  const mutation = isUpdate ? updateBid : placeBid;

  React.useEffect(() => {
    if (open && existingBid) {
      setAmount(existingBid.amount);
    } else if (open) {
      setAmount('');
    }
  }, [open, existingBid]);

  const numericAmount = parseFloat(stripPriceFormat(amount)) || 0;
  const minPriceNum = parseFloat(minPrice) || 0;
  const isEmpty = !amount.trim();
  const isInvalid = !isEmpty && (numericAmount <= 0 || isNaN(numericAmount));
  const isBelowMin = !isEmpty && !isInvalid && numericAmount < minPriceNum;
  const isDisabled = mutation.isPending || isEmpty || isInvalid || isBelowMin;

  const getError = (): string | null => {
    if (isEmpty) return null;
    if (isInvalid) return 'Введите корректную сумму';
    if (isBelowMin) return `Ставка должна быть не менее ${formatPrice(minPrice)}`;
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
          description={`Минимальная сумма: ${formatPrice(minPrice)}`}
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
                    placeholder={formatPriceInput(minPrice)}
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

// --- Select Winner Modal ---

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
  const [selectedBidId, setSelectedBidId] = React.useState<number | null>(null);
  const selectWinner = useSelectWinner();

  const handleSubmit = () => {
    if (!selectedBidId) return;
    selectWinner.mutate(
      { auctionId, data: { bid_id: selectedBidId } },
      {
        onSuccess: () => {
          toast.success('Победитель выбран');
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
          description='Выберите ставку-победителя аукциона'
        />
        <Modal.Body className='max-h-[320px] space-y-2 overflow-y-auto'>
          {bids.length === 0 ? (
            <div className='py-4 text-center text-sm text-gray-400'>
              Нет ставок
            </div>
          ) : (
            bids.map((bid) => (
              <button
                key={bid.id}
                type='button'
                onClick={() => setSelectedBidId(bid.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${selectedBidId === bid.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <div>
                  <div className='text-sm font-medium text-gray-900'>
                    {bid.first_name} {bid.last_name}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {formatDateTime(bid.created_at)}
                  </div>
                </div>
                <div className='text-base font-semibold text-gray-900'>
                  {formatPrice(bid.amount)}
                </div>
              </button>
            ))
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
            disabled={!selectedBidId || selectWinner.isPending}
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
  bidsCount,
  isHighestBidder,
}: {
  sendBid: (amount: string) => void;
  connected: boolean;
  currentPrice: string;
  minPrice: string;
  bidsCount: number;
  isHighestBidder: boolean;
}) {
  const [amount, setAmount] = React.useState('');
  const MIN_INCREMENT = 150000;

  const minBid = bidsCount === 0 || parseFloat(currentPrice) <= 0
    ? parseFloat(minPrice)
    : parseFloat(currentPrice) + MIN_INCREMENT;

  const numericAmount = parseFloat(amount) || 0;
  const isEmpty = !amount.trim();
  const isBelowMin = !isEmpty && numericAmount < minBid;
  const isInvalid = !isEmpty && (numericAmount <= 0 || isNaN(numericAmount));
  const isDisabled = !connected || isEmpty || isBelowMin || isInvalid;

  const getError = (): string | null => {
    if (isEmpty) return null;
    if (isInvalid) return 'Введите корректную сумму';
    if (isBelowMin) return `Минимальная ставка: ${formatPrice(String(Math.ceil(minBid)))}`;
    return null;
  };
  const error = getError();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    sendBid(amount);
    setAmount('');
  };

  return (
    <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
      <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3'>
        <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
        Сделать ставку
      </h3>
      {isHighestBidder ? (
        <div className='rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-700 font-medium'>
          Вы лидер торгов. Ожидайте новых ставок.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='space-y-3'>
          <div className='space-y-1.5'>
            <Label.Root htmlFor='live-bid-amount'>Сумма ставки</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='live-bid-amount'
                  type='text'
                  inputMode='decimal'
                  placeholder={formatPriceInput(String(Math.ceil(minBid)))}
                  value={formatPriceInput(amount)}
                  onChange={(e) => setAmount(stripPriceFormat(e.target.value))}
                />
              </Input.Wrapper>
            </Input.Root>
            {error ? (
              <p className='text-[11px] text-red-500'>{error}</p>
            ) : (
              <p className='text-[11px] text-gray-400'>
                {bidsCount === 0
                  ? `Первая ставка автоматически = мин. цена (${formatPrice(minPrice)})`
                  : `Минимум: ${formatPrice(String(Math.ceil(minBid)))}`}
              </p>
            )}
          </div>
          <FancyButton.Root variant='primary' size='small' type='submit' className='w-full' disabled={isDisabled}>
            <HugeiconsIcon icon={Coins01Icon} size={16} />
            {connected ? 'Поставить' : 'Подключение...'}
          </FancyButton.Root>
        </form>
      )}
    </div>
  );
}

// --- Main Page ---

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = Number(params.id);
  const user = useSessionStore((s) => s.user);
  const isDeveloper = user?.role === 'developer' || user?.is_developer === true;
  const isBroker = user?.role === 'broker' || user?.is_broker === true;

  const isAdmin = user?.role === 'admin' || user?.is_admin === true;
  const { data: auction, isLoading: isAuctionLoading } = useAuctionDetail(auctionId);
  const isOpenAuction = auction?.mode === 'open';
  const isOwnerOrAdmin = auction != null && (auction.owner_id === user?.id || isAdmin);
  // For CLOSED auctions, participants and sealed-bids are owner/admin only
  const canViewClosedData = auction != null && !isOpenAuction && isOwnerOrAdmin;
  const participantsEnabled = isOpenAuction || isOwnerOrAdmin;
  const { data: participants, isLoading: isParticipantsLoading } = useParticipants(auctionId, { enabled: participantsEnabled });
  const { data: sealedBids, isLoading: isSealedBidsLoading } = useSealedBids(auctionId, { enabled: canViewClosedData });

  const isActiveOpen = isOpenAuction && auction?.status === 'active';

  // WebSocket for OPEN auctions
  const ws = useAuctionSocket(auctionId, isActiveOpen === true);

  // Show skeleton until all relevant data is loaded (including WS snapshot for active OPEN)
  const isLoading = isAuctionLoading
    || (participantsEnabled && isParticipantsLoading)
    || (canViewClosedData && isSealedBidsLoading)
    || (isActiveOpen && !ws.auction);

  const joinAuction = useJoinAuction();
  const shortlist = useShortlist();

  const [joined, setJoined] = React.useState(false);
  const [bidModalOpen, setBidModalOpen] = React.useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = React.useState(false);
  const [shortlistIds, setShortlistIds] = React.useState<Set<number>>(
    new Set(),
  );

  // Show WS errors as toast
  React.useEffect(() => {
    if (ws.error) toast.error(ws.error);
  }, [ws.error]);



  if (isLoading) {
    return <DetailPageSkeleton />;
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
  const progress = getTimeProgress(auction.start_date, auction.end_date);

  // For OPEN active auctions, merge WS data with REST data
  const liveAuction = isActiveOpen && ws.auction ? ws.auction : auction;
  const liveBidsCount = isActiveOpen && ws.auction ? ws.auction.bids_count : auction.bids_count;
  const liveCurrentPrice = isActiveOpen && ws.auction ? ws.auction.current_price : auction.current_price;
  const liveHighestBidId = isActiveOpen && ws.auction ? ws.auction.highest_bid_id : auction.highest_bid_id;
  const isHighestBidder = liveHighestBidId != null && ws.bids.length > 0 && ws.bids[0]?.broker === user?.id;

  const restParticipantIds: number[] = participants?.participants ?? [];
  const participantIds: number[] = isActiveOpen
    ? Array.from(new Set([...restParticipantIds, ...ws.participants]))
    : restParticipantIds;
  const isParticipant = joined
    || participantIds.includes(user?.id ?? 0);
  const bidsList = Array.isArray(sealedBids) ? sealedBids : [];
  const mySealedBid = bidsList.find((b) => b.user_id === user?.id);
  // For open auctions: check bids from auction detail REST response (broker_id)
  const auctionBids = Array.isArray(auction.bids) ? auction.bids : [];
  const myRestBid = auctionBids.find((b) => b.broker_id === user?.id);
  // Also check WS bids (broker)
  const myWsBid = ws.bids.find((b) => b.broker === user?.id);
  const myBid: Bid | undefined = mySealedBid
    ?? (myRestBid ? { id: myRestBid.id, auction_id: auctionId, user_id: user?.id ?? 0, amount: myRestBid.amount, first_name: '', last_name: '', created_at: myRestBid.created_at, updated_at: myRestBid.created_at } : undefined)
    ?? (myWsBid ? { id: myWsBid.id, auction_id: auctionId, user_id: user?.id ?? 0, amount: myWsBid.amount, first_name: '', last_name: '', created_at: myWsBid.created_at, updated_at: myWsBid.created_at } : undefined);

  const handleJoin = () => {
    joinAuction.mutate(auctionId, {
      onSuccess: () => {
        setJoined(true);
        toast.success('Вы присоединились к аукциону');
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
        data: { participant_ids: Array.from(shortlistIds) },
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
            <span className='text-[13px] text-gray-400'>Объект #{auction.property_id}</span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {!isDeveloper && isActive && !isParticipant && (
            <FancyButton.Root variant='primary' size='small' onClick={handleJoin} disabled={joinAuction.isPending}>
              <HugeiconsIcon icon={UserIcon} size={16} color='currentColor' strokeWidth={1.5} />
              {joinAuction.isPending ? 'Присоединение...' : 'Участвовать'}
            </FancyButton.Root>
          )}
          {!isDeveloper && isActive && isParticipant && !isOpenAuction && (
            <FancyButton.Root variant='primary' size='small' onClick={() => setBidModalOpen(true)}>
              <HugeiconsIcon icon={Coins01Icon} size={16} color='currentColor' strokeWidth={1.5} />
              {myBid ? 'Обновить ставку' : 'Сделать ставку'}
            </FancyButton.Root>
          )}
          {isOwner && isActive && bidsList.length > 0 && (
            <FancyButton.Root variant='primary' size='small' onClick={() => setWinnerModalOpen(true)}>
              <HugeiconsIcon icon={ChampionIcon} size={16} color='currentColor' strokeWidth={1.5} />
              Выбрать победителя
            </FancyButton.Root>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className={`grid grid-cols-2 gap-3 ${isOpenAuction ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <div className='rounded-xl border border-blue-200 bg-blue-50/50 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Лидирующая ставка</span>
          <span className='mt-1 block text-[17px] font-bold text-blue-700'>{formatPrice(liveCurrentPrice)} ₽</span>
        </div>
        <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Мин. цена</span>
          <span className='mt-1 block text-[17px] font-bold text-gray-900'>{formatPrice(auction.min_price)} ₽</span>
        </div>
        <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Ставок</span>
          <span className='mt-1 block text-[17px] font-bold text-gray-900'>{liveBidsCount} ₽</span>
        </div>
        {isOpenAuction && (
        <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Участников</span>
          <span className='mt-1 block text-[17px] font-bold text-gray-900'>{participantIds.length}</span>
        </div>
        )}
      </div>

      {/* Main 2/3 + 1/3 */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
        {/* Left 2/3 */}
        <div className='xl:col-span-2 space-y-4'>
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
              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Начало</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(auction.start_date)}</span></div>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Окончание</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(auction.end_date)}</span></div>
              </div>
            )}

            {auction.winner_bid_id && (
              <div className='mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-4'>
                <HugeiconsIcon icon={ChampionIcon} size={20} color='currentColor' strokeWidth={1.5} className='text-emerald-500' />
                <div>
                  <div className='text-sm font-medium text-gray-900'>Победитель определён</div>
                  <div className='text-xs text-gray-500'>Ставка #{auction.winner_bid_id}</div>
                </div>
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
                      <td className='py-3 font-medium text-gray-900'>{bid.first_name} {bid.last_name}</td>
                      <td className='py-3 font-semibold text-gray-900'>{formatPrice(bid.amount)}</td>
                      <td className='py-3 text-gray-400'>{formatDateTime(bid.created_at)}</td>
                      <td className='py-3'>{auction.winner_bid_id === bid.id && <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>Победитель</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Live bids feed — OPEN auction */}
          {isActiveOpen && ws.bids.length > 0 && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
                  <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
                  Ставки (live)
                </h3>
                {ws.connected && (
                  <span className='inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600'>
                    <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
                    Online
                  </span>
                )}
              </div>
              <div className='space-y-2 max-h-80 overflow-y-auto'>
                {ws.bids.map((bid) => (
                  <div key={bid.id} className='flex items-center justify-between rounded-lg px-3 py-2 hover:bg-blue-50/20 transition-colors'>
                    <div className='flex items-center gap-2.5'>
                      <div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>
                        #{bid.broker}
                      </div>
                      <span className='text-[13px] font-semibold text-gray-900'>{formatPrice(bid.amount)}</span>
                    </div>
                    <span className='text-[11px] text-gray-400'>
                      {new Date(bid.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My bid — participant */}
          {!isDeveloper && isParticipant && myBid && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-4'>
                <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />Моя ставка
              </h3>
              <div className='grid grid-cols-3 gap-4'>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Сумма</span><span className='mt-1 block text-base font-semibold text-gray-900'>{formatPrice(myBid.amount)}</span></div>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Дата</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(myBid.created_at)}</span></div>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Обновлена</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(myBid.updated_at)}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1/3 */}
        <div className='space-y-4'>
          {/* Live bid input — OPEN auction, broker participant */}
          {isActiveOpen && isBroker && isParticipant && (
            <LiveBidInput
              sendBid={ws.sendBid}
              connected={ws.connected}
              currentPrice={liveCurrentPrice}
              minPrice={auction.min_price}
              bidsCount={liveBidsCount}
              isHighestBidder={isHighestBidder}
            />
          )}

          {/* Participants — only for open auctions */}
          {isOpenAuction && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
              <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
                <HugeiconsIcon icon={UserIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />Участники ({participantIds.length})
              </h3>
              {participantIds.length === 0 ? (
                <div className='py-6 text-center text-[13px] text-gray-400'>Пока нет участников</div>
              ) : (
                <div className='mt-3 space-y-1.5'>
                  {participantIds.map((pid) => (
                    <div key={pid} className='flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-blue-50/20 transition-colors'>
                      <div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>
                        #{pid}
                      </div>
                      <span className='text-[13px] font-medium text-gray-900'>Участник #{pid}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Broker status */}
          {!isDeveloper && (
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
                  {myBid ? <span className='font-semibold text-gray-900'>{formatPrice(myBid.amount)}</span> : <span className='text-gray-400'>—</span>}
                </div>
                {auction.winner_bid_id && myBid && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Результат</span>
                    {auction.winner_bid_id === myBid.id
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
      <PlaceBidModal auctionId={auctionId} open={bidModalOpen} onOpenChange={setBidModalOpen} existingBid={myBid} minPrice={auction.min_price} />
      {isOwner && <SelectWinnerModal auctionId={auctionId} bids={bidsList} open={winnerModalOpen} onOpenChange={setWinnerModalOpen} />}
    </div>
  );
}
