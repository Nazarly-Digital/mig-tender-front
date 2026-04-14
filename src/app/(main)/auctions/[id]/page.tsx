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
  Cancel01Icon,
  ArrowMoveDownRightIcon,
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
  useSealedBids,
  usePlaceBid,
  useUpdateBid,
  useShortlist,
  useSelectWinner,
  useAssign,
  useCancelAuction,
} from '@/features/auctions';
import { useQueryClient } from '@tanstack/react-query';
import { dealKeys } from '@/features/deals';
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
  scheduled: { 'label': 'Запланирован', cls: 'bg-gray-100 text-gray-600' }
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

  React.useEffect(() => {
    if (open && existingBid) {
      setAmount(existingBid.amount);
    } else if (open) {
      setAmount('');
    }
  }, [open, existingBid]);

  const numericAmount = parseFloat(stripPriceFormat(amount)) || 0;
  const isEmpty = !amount.trim();
  const isInvalid = !isEmpty && (numericAmount <= 0 || isNaN(numericAmount));
  const isDisabled = mutation.isPending || isEmpty || isInvalid;

  const getError = (): string | null => {
    if (isEmpty) return null;
    if (isInvalid) return 'Введите корректную сумму';
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
  const [selectedBrokerIds, setSelectedBrokerIds] = React.useState<Set<number>>(new Set());
  const selectWinner = useSelectWinner();

  const toggleBroker = (brokerId: number) => {
    setSelectedBrokerIds((prev) => {
      const next = new Set(prev);
      if (next.has(brokerId)) next.delete(brokerId);
      else next.add(brokerId);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedBrokerIds.size === 0) return;
    selectWinner.mutate(
      { auctionId, data: { brokerIds: Array.from(selectedBrokerIds) } },
      {
        onSuccess: () => {
          toast.success(selectedBrokerIds.size > 1 ? 'Победители выбраны' : 'Победитель выбран');
          setSelectedBrokerIds(new Set());
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
          title='Выбор победителей'
          description='Выберите брокеров-победителей аукциона'
        />
        <Modal.Body className='max-h-[320px] space-y-2 overflow-y-auto'>
          {bids.length === 0 ? (
            <div className='py-4 text-center text-sm text-gray-400'>
              Нет ставок
            </div>
          ) : (
            bids.map((bid) => {
              const isSelected = selectedBrokerIds.has(bid.broker_id);
              return (
                <button
                  key={bid.id}
                  type='button'
                  onClick={() => toggleBroker(bid.broker_id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className='flex items-center gap-2.5'>
                    <div className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                      {isSelected && <HugeiconsIcon icon={Tick01Icon} size={12} color='currentColor' strokeWidth={2} />}
                    </div>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {bid.first_name} {bid.last_name}
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
            disabled={selectedBrokerIds.size === 0 || selectWinner.isPending}
            onClick={handleSubmit}
          >
            {selectWinner.isPending ? 'Выбор...' : `Подтвердить (${selectedBrokerIds.size})`}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Assign Modal (distribute properties among winners) ---

function AssignModal({
  auctionId,
  properties,
  winnerBrokerIds,
  open,
  onOpenChange,
}: {
  auctionId: number;
  properties: AuctionLotProperty[];
  winnerBrokerIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const assign = useAssign();
  // Map: brokerId -> Set<propertyId>
  const [assignments, setAssignments] = React.useState<Map<number, Set<number>>>(new Map());

  React.useEffect(() => {
    if (open) setAssignments(new Map());
  }, [open]);

  const toggleAssignment = (brokerId: number, propertyId: number) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      const current = new Set(next.get(brokerId) ?? []);
      if (current.has(propertyId)) {
        current.delete(propertyId);
      } else {
        // Remove from other brokers first
        next.forEach((pids, bid) => {
          if (bid !== brokerId && pids.has(propertyId)) {
            const copy = new Set(pids);
            copy.delete(propertyId);
            next.set(bid, copy);
          }
        });
        current.add(propertyId);
      }
      next.set(brokerId, current);
      return next;
    });
  };

  const totalAssigned = Array.from(assignments.values()).reduce((sum, s) => sum + s.size, 0);
  const allAssigned = totalAssigned === properties.length;

  const handleSubmit = () => {
    const data = Array.from(assignments.entries())
      .filter(([, pids]) => pids.size > 0)
      .map(([brokerId, pids]) => ({
        brokerId,
        propertyIds: Array.from(pids),
      }));
    if (data.length === 0) return;
    assign.mutate(
      { auctionId, data: { assignments: data } },
      {
        onSuccess: (res) => {
          toast.success(`Создано ${res.dealsCount} ${res.dealsCount === 1 ? 'сделка' : res.dealsCount < 5 ? 'сделки' : 'сделок'}`);
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
      <Modal.Content className='max-w-[600px]'>
        <Modal.Header
          title='Распределение объектов'
          description='Назначьте объекты лота победителям аукциона'
        />
        <Modal.Body className='space-y-4 max-h-[400px] overflow-y-auto'>
          {winnerBrokerIds.map((brokerId) => (
            <div key={brokerId} className='space-y-2'>
              <div className='text-sm font-semibold text-gray-900'>Брокер #{brokerId}</div>
              <div className='space-y-1'>
                {properties.map((prop) => {
                  const isSelected = assignments.get(brokerId)?.has(prop.id) ?? false;
                  const assignedTo = Array.from(assignments.entries()).find(
                    ([bid, pids]) => bid !== brokerId && pids.has(prop.id),
                  );
                  const isDisabled = !!assignedTo;
                  return (
                    <button
                      key={prop.id}
                      type='button'
                      disabled={isDisabled}
                      onClick={() => toggleAssignment(brokerId, prop.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : isDisabled
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                        }`}
                    >
                      <div className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                        }`}>
                        {isSelected && <HugeiconsIcon icon={Tick01Icon} size={12} color='currentColor' strokeWidth={2} />}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm text-gray-900 truncate'>{prop.address}</div>
                        <div className='text-xs text-gray-500'>{prop.area} м² · {prop.price == null ? 'Цена скрыта' : `${formatPrice(prop.price)} ₽`}</div>
                      </div>
                      {isDisabled && (
                        <span className='text-[10px] text-gray-400'>Назначен #{assignedTo![0]}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <div className='flex items-center gap-2 mr-auto text-xs text-gray-400'>
            {totalAssigned}/{properties.length} объектов назначено
          </div>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>Отмена</FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant='primary'
            size='small'
            disabled={!allAssigned || assign.isPending}
            onClick={handleSubmit}
          >
            {assign.isPending ? 'Назначение...' : 'Подтвердить'}
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
  isHighestBidder,
  wsError,
}: {
  sendBid: (amount: string) => void;
  connected: boolean;
  currentPrice: string;
  minPrice: string;
  minBidIncrement: string;
  bidsCount: number;
  isHighestBidder: boolean;
  wsError: string | null;
}) {
  const isFirstBid = bidsCount === 0 || parseFloat(currentPrice) <= 0;
  const [amount, setAmount] = React.useState('');

  const minBid = isFirstBid
    ? parseFloat(minPrice)
    : parseFloat(currentPrice) + (parseFloat(minBidIncrement) || 0);

  const numericAmount = parseFloat(amount) || 0;
  const isEmpty = !amount.trim();
  const isBelowMin = !isEmpty && numericAmount < minBid;
  const isInvalid = !isEmpty && (numericAmount <= 0 || isNaN(numericAmount));
  const isDisabled = isFirstBid ? !connected : (!connected || isEmpty || isBelowMin || isInvalid);

  const getError = (): string | null => {
    if (isFirstBid || isEmpty) return null;
    if (isInvalid) return 'Введите корректную сумму';
    if (isBelowMin) return `Минимальная ставка: ${formatPrice(String(Math.ceil(minBid)))} ₽`;
    return null;
  };
  const error = getError();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFirstBid) {
      sendBid(minPrice);
    } else {
      if (isDisabled) return;
      sendBid(amount);
    }
    setAmount('');
  };

  return (
    <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
      <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3'>
        <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
        Сделать ставку
      </h3>
      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='live-bid-amount'>Сумма ставки</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                id='live-bid-amount'
                type='text'
                inputMode='decimal'
                placeholder={formatPriceInput(String(Math.ceil(minBid))) + ' ₽'}
                value={isFirstBid ? formatPriceInput(minPrice) : formatPriceInput(amount)}
                onChange={(e) => setAmount(stripPriceFormat(e.target.value))}
                disabled={isHighestBidder || isFirstBid}
              />
            </Input.Wrapper>
          </Input.Root>
          {isHighestBidder || wsError ? (
            <p className='text-[11px] text-emerald-600 font-medium'>
              {wsError || 'Вы лидер торгов. Ожидайте новых ставок.'}
            </p>
          ) : error ? (
            <p className='text-[11px] text-red-500'>{error}</p>
          ) : (
            <p className='text-[11px] text-gray-400'>
              {bidsCount === 0
                ? `Первая ставка автоматически = мин. цена (${formatPrice(minPrice)} ₽)`
                : `Минимум: ${formatPrice(String(Math.ceil(minBid)))} ₽`}
            </p>
          )}
        </div>
        <FancyButton.Root variant='primary' size='small' type='submit' className='w-full' disabled={isDisabled || isHighestBidder || !!wsError}>
          <HugeiconsIcon icon={Coins01Icon} size={16} />
          {connected ? 'Поставить' : 'Подключение...'}
        </FancyButton.Root>
      </form>
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

  const [optimisticBid, setOptimisticBid] = React.useState<Bid | null>(null);
  const [pendingOpenBid, setPendingOpenBid] = React.useState<Bid | null>(null);
  const [bidModalOpen, setBidModalOpen] = React.useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = React.useState(false);
  const [assignModalOpen, setAssignModalOpen] = React.useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false);
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
    if (ws.bids.some((b) => b.broker === user?.id)) {
      setPendingOpenBid(null);
    }
  }, [ws.bids, pendingOpenBid, user?.id]);

  // Clear optimistic bid once real data is available (must be before early returns for hooks consistency)
  const hasRealBid = React.useMemo(() => {
    if (!auction) return false;
    const isOpen = auction.mode === 'open';
    const bids = Array.isArray(auction.bids) ? auction.bids : [];
    if (isOpen) {
      return ws.bids.some((b) => b.broker === user?.id) || bids.some((b) => b.broker_id === user?.id);
    }
    const sealed = Array.isArray(sealedBids) ? sealedBids : [];
    return sealed.some((b) => b.broker_id === user?.id);
  }, [auction, ws.bids, sealedBids, user?.id]);

  React.useEffect(() => {
    if (hasRealBid) setOptimisticBid(null);
  }, [hasRealBid]);

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
    ws.bids.some((b) => b.id === liveHighestBidId && b.broker === user?.id)
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
  const myWsBid = ws.bids.find((b) => b.broker === user?.id);

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
          {!isDeveloper && !isAdmin && isActive && !isOpenAuction && !myBid && (
            <div className='relative group'>
              <FancyButton.Root
                variant='primary'
                size='small'
                onClick={() => setBidModalOpen(true)}
                disabled={!isBrokerVerified}
              >
                <HugeiconsIcon icon={Coins01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                Сделать ставку
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
          {isOwnerOrAdmin && isFinished && auction.winner_bid && !isOpenAuction && auction.properties?.length > 1 && !auction.deals_created && (
            <FancyButton.Root variant='primary' size='small' onClick={() => setAssignModalOpen(true)}>
              <HugeiconsIcon icon={ArrowMoveDownRightIcon} size={16} color='currentColor' strokeWidth={1.5} />
              Распределить объекты
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

      {/* KPI Row — cards render only when data is available (brokers don't see min/current/bids in CLOSED auctions) */}
      {(() => {
        const showCurrentPrice = liveCurrentPrice != null;
        const showMinPrice = auction.min_price != null;
        const showBidsCount = liveBidsCount != null;
        const showLotTotal = auction.lot_total_price != null;
        const showIncrement = isOpenAuction && auction.min_bid_increment != null;
        const showParticipants = isOpenAuction && isOwnerOrAdmin;
        const visibleCount = [
          showCurrentPrice,
          showMinPrice,
          showBidsCount,
          showLotTotal,
          showIncrement,
          showParticipants,
        ].filter(Boolean).length;
        if (visibleCount === 0) return null;
        const cols = Math.min(visibleCount, 5);
        const colsClass =
          cols >= 5 ? 'sm:grid-cols-5'
          : cols === 4 ? 'sm:grid-cols-4'
          : cols === 3 ? 'sm:grid-cols-3'
          : cols === 2 ? 'sm:grid-cols-2'
          : 'sm:grid-cols-1';
        return (
          <div className={`grid grid-cols-2 gap-3 ${colsClass}`}>
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
                <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Ставок</span>
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
            {showParticipants && (
              <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-4'>
                <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Участников</span>
                <span className='mt-1 block text-[17px] font-bold text-gray-900'>{participantIds.length}</span>
              </div>
            )}
          </div>
        );
      })()}

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
                  <div className='text-sm font-medium text-gray-900'>Победитель определён</div>
                  <div className='text-xs text-gray-500'>{auction.winner_bid.broker.fullname} — {formatPrice(auction.winner_bid.amount)} ₽</div>
                </div>
              </div>
            )}
          </div>

          {/* Lot Properties — for multi-property CLOSED auctions */}
          {auction.properties?.length > 1 && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-4'>
                <HugeiconsIcon icon={CheckListIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
                Объекты лота ({auction.properties.length})
              </h3>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b border-gray-100'>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>ID</th>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Адрес</th>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Тип</th>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Площадь</th>
                    <th className='pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Прайсовая цена</th>
                  </tr>
                </thead>
                <tbody className='text-[13px]'>
                  {auction.properties.map((prop) => (
                    <tr key={prop.id} className='border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors cursor-pointer' onClick={() => router.push(`/objects/${prop.id}`)}>
                      <td className='py-3 text-gray-500 font-mono text-xs'>{prop.reference_id}</td>
                      <td className='py-3 font-medium text-blue-600 hover:text-blue-800'>{prop.address}</td>
                      <td className='py-3 text-gray-600'>{PROPERTY_TYPE_LABELS[prop.type] || prop.type}</td>
                      <td className='py-3 text-gray-600'>{prop.area} м²</td>
                      <td className='py-3 font-semibold text-gray-900'>{prop.price == null ? 'Скрыта' : `${formatPrice(prop.price)} ₽`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                        {bid.first_name} {bid.last_name}
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

          {/* Live bids feed — OPEN auction */}
          {isActiveOpen && isOwnerOrAdmin && ws.bids.length > 0 && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
                  <HugeiconsIcon icon={Coins01Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
                  Ставки
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
                      <span className='text-[13px] font-semibold text-gray-900'>{formatPrice(bid.amount)} ₽</span>
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
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Сумма</span><span className='mt-1 block text-base font-semibold text-gray-900'>{formatPrice(myBid.amount)} ₽</span></div>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Дата</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(myBid.created_at)}</span></div>
                <div><span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Обновлена</span><span className='mt-1 block text-[13px] font-medium text-gray-900'>{formatDateTime(myBid.updated_at)}</span></div>
              </div>
              {!isOpenAuction && (
                <p className='mt-3 text-[12px] text-amber-600 font-medium'>В закрытом аукционе можно сделать только 1 ставку.</p>
              )}
            </div>
          )}
        </div>

        {/* Right 1/3 */}
        <div className='space-y-4'>
          {/* Live bid input — OPEN auction, broker (participation auto-registered on first bid) */}
          {isActiveOpen && isBroker && (
            <LiveBidInput
              sendBid={handleSendBid}
              connected={ws.connected}
              currentPrice={liveCurrentPrice ?? '0'}
              minPrice={auction.min_price ?? '0'}
              minBidIncrement={auction.min_bid_increment ?? '0'}
              bidsCount={liveBidsCount ?? 0}
              isHighestBidder={isHighestBidder}
              wsError={ws.error}
            />
          )}

          {/* Participants — owner/admin only (hidden for brokers in both open and closed auctions) */}
          {isOwnerOrAdmin && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
              <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
                <HugeiconsIcon icon={UserIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />Участники ({participantIds.length})
              </h3>
              {participantIds.length === 0 ? (
                <div className='py-6 text-center text-[13px] text-gray-400'>Пока нет участников</div>
              ) : (
                <div className='mt-3 space-y-1.5'>
                  {participantIds.map((pid) => {
                    const detail = participantDetails.find((d) => d.id === pid);
                    const name = detail?.name ?? `Участник #${pid}`;
                    const initials = name.startsWith('#') ? `#${pid}` : name.slice(0, 2).toUpperCase();
                    return (
                      <div key={pid} className='flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-blue-50/20 transition-colors'>
                        <div className='size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600'>
                          {initials}
                        </div>
                        <span className='text-[13px] font-medium text-gray-900'>{name}</span>
                      </div>
                    );
                  })}
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
      {isOwnerOrAdmin && auction.properties?.length > 1 && (
        <AssignModal
          auctionId={auctionId}
          properties={auction.properties}
          winnerBrokerIds={auction.winner_bid ? [auction.winner_bid.broker.id] : []}
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
        />
      )}

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
    </div>
  );
}
