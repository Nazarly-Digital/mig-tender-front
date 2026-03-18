'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  RiAuctionLine,
  RiTimeLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiTrophyLine,
  RiListCheck2,
  RiArrowLeftLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Button from '@/shared/ui/button';
import * as CompactButton from '@/shared/ui/compact-button';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Modal from '@/shared/ui/modal';
import * as ProgressBar from '@/shared/ui/progress-bar';
import * as StatusBadge from '@/shared/ui/status-badge';
import * as Table from '@/shared/ui/table';
import * as WidgetBox from '@/shared/components/widget-box';
import { PageHeader } from '@/shared/components/page-header';
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
import type { AuctionStatus, AuctionMode, Bid } from '@/shared/types/auctions';

// --- Helpers ---

const STATUS_CONFIG: Record<
  AuctionStatus,
  { label: string; status: 'completed' | 'pending' | 'failed' | 'disabled' }
> = {
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
  return new Intl.NumberFormat('ru-RU').format(num) + ' ₸';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
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
}: {
  auctionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBid?: Bid | null;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim()) return;

    mutation.mutate(
      { auctionId, data: { amount } },
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
          icon={RiMoneyDollarCircleLine}
          title={isUpdate ? 'Обновить ставку' : 'Сделать ставку'}
          description='Укажите сумму вашей ставки'
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
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='10 000 000'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root variant='neutral' mode='stroke' type='button'>
                Отмена
              </Button.Root>
            </Modal.Close>
            <FancyButton.Root
              type='submit'
              variant='primary'
              size='small'
              disabled={mutation.isPending || !amount.trim()}
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
          icon={RiTrophyLine}
          title='Выбор победителя'
          description='Выберите ставку-победителя аукциона'
        />
        <Modal.Body className='max-h-[320px] space-y-2 overflow-y-auto'>
          {bids.length === 0 ? (
            <div className='py-4 text-center text-paragraph-sm text-text-soft-400'>
              Нет ставок
            </div>
          ) : (
            bids.map((bid) => (
              <button
                key={bid.id}
                type='button'
                onClick={() => setSelectedBidId(bid.id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ring-1 ring-inset ${
                  selectedBidId === bid.id
                    ? 'bg-primary-alpha-10 ring-primary-base'
                    : 'ring-stroke-soft-200 hover:bg-bg-weak-50'
                }`}
              >
                <div>
                  <div className='text-label-sm text-text-strong-950'>
                    {bid.first_name} {bid.last_name}
                  </div>
                  <div className='text-paragraph-xs text-text-sub-600'>
                    {formatDateTime(bid.created_at)}
                  </div>
                </div>
                <div className='text-label-md text-text-strong-950'>
                  {formatPrice(bid.amount)}
                </div>
              </button>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root variant='neutral' mode='stroke' type='button'>
              Отмена
            </Button.Root>
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

// --- Main Page ---

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = Number(params.id);
  const user = useSessionStore((s) => s.user);
  const isDeveloper = user?.role === 'developer';

  const { data: auction, isLoading } = useAuctionDetail(auctionId);
  const { data: participants } = useParticipants(auctionId);
  const { data: sealedBids } = useSealedBids(auctionId);

  const joinAuction = useJoinAuction();
  const shortlist = useShortlist();

  const [bidModalOpen, setBidModalOpen] = React.useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = React.useState(false);
  const [shortlistIds, setShortlistIds] = React.useState<Set<number>>(
    new Set(),
  );

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <div className='text-paragraph-sm text-text-soft-400'>Загрузка...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20'>
        <div className='text-label-sm text-text-sub-600'>
          Аукцион не найден
        </div>
        <Link href='/auctions'>
          <Button.Root variant='neutral' mode='stroke'>
            Назад к аукционам
          </Button.Root>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[auction.status];
  const isActive = auction.status === 'active';
  const isFinished = auction.status === 'finished';
  const isOwner = auction.owner_id === user?.id;
  const progress = getTimeProgress(auction.start_date, auction.end_date);

  const participantList = Array.isArray(participants) ? participants : [];
  const isParticipant = participantList.some((p) => p.user_id === user?.id);
  const bidsList = Array.isArray(sealedBids) ? sealedBids : [];
  const myBid = bidsList.find((b) => b.user_id === user?.id);

  const handleJoin = () => {
    joinAuction.mutate(auctionId, {
      onSuccess: () => {
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
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Link href='/auctions'>
            <CompactButton.Root variant='stroke' size='medium'>
              <CompactButton.Icon as={RiArrowLeftLine} />
            </CompactButton.Root>
          </Link>
          <div>
            <div className='text-label-xl font-semibold text-text-strong-950'>
              Аукцион #{auction.id}
            </div>
            <div className='mt-1 text-paragraph-sm text-text-sub-600'>
              Объект #{auction.property_id}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          {/* Broker: join */}
          {!isDeveloper && isActive && !isParticipant && (
            <FancyButton.Root
              variant='primary'
              size='xsmall'
              onClick={handleJoin}
              disabled={joinAuction.isPending}
            >
              <FancyButton.Icon as={RiUserLine} />
              {joinAuction.isPending ? 'Присоединение...' : 'Участвовать'}
            </FancyButton.Root>
          )}

          {/* Broker: place/update bid */}
          {!isDeveloper && isActive && isParticipant && (
            <FancyButton.Root
              variant='primary'
              size='xsmall'
              onClick={() => setBidModalOpen(true)}
            >
              <FancyButton.Icon as={RiMoneyDollarCircleLine} />
              {myBid ? 'Обновить ставку' : 'Сделать ставку'}
            </FancyButton.Root>
          )}

          {/* Owner: select winner */}
          {isOwner && isActive && bidsList.length > 0 && (
            <FancyButton.Root
              variant='primary'
              size='xsmall'
              onClick={() => setWinnerModalOpen(true)}
            >
              <FancyButton.Icon as={RiTrophyLine} />
              Выбрать победителя
            </FancyButton.Root>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className='grid grid-cols-1 gap-5 xl:grid-cols-3'>
        {/* Left: Info */}
        <div className='flex flex-col gap-5 xl:col-span-2'>
          {/* Auction Info Card */}
          <WidgetBox.Root>
            <WidgetBox.Header>
              <WidgetBox.HeaderIcon as={RiAuctionLine} />
              Информация об аукционе
            </WidgetBox.Header>

            {/* Progress bar for active */}
            {isActive && (
              <div className='mb-4'>
                <div className='mb-1 flex items-center justify-between text-paragraph-xs text-text-sub-600'>
                  <span>Прогресс</span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar.Root
                  value={progress}
                  color={getProgressColor(progress)}
                />
              </div>
            )}

            <div className='grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3'>
              <div>
                <div className='text-subheading-2xs uppercase text-text-soft-400'>
                  Статус
                </div>
                <div className='mt-1'>
                  <StatusBadge.Root variant='light' status={statusCfg.status}>
                    <StatusBadge.Dot />
                    {statusCfg.label}
                  </StatusBadge.Root>
                </div>
              </div>
              <div>
                <div className='text-subheading-2xs uppercase text-text-soft-400'>
                  Тип
                </div>
                <div className='mt-1'>
                  <Badge.Root variant='lighter' color='gray' size='small'>
                    {MODE_LABELS[auction.mode]}
                  </Badge.Root>
                </div>
              </div>
              <div>
                <div className='text-subheading-2xs uppercase text-text-soft-400'>
                  Ставок
                </div>
                <div className='mt-1 text-label-sm text-text-strong-950'>
                  {auction.bids_count}
                </div>
              </div>
              <div>
                <div className='text-subheading-2xs uppercase text-text-soft-400'>
                  Мин. цена
                </div>
                <div className='mt-1 text-label-sm text-text-strong-950'>
                  {formatPrice(auction.min_price)}
                </div>
              </div>
              <div>
                <div className='text-subheading-2xs uppercase text-text-soft-400'>
                  Текущая макс.
                </div>
                <div className='mt-1 text-label-sm text-text-strong-950'>
                  {formatPrice(auction.current_price)}
                </div>
              </div>
              <div>
                <div className='text-subheading-2xs uppercase text-text-soft-400'>
                  Участников
                </div>
                <div className='mt-1 text-label-sm text-text-strong-950'>
                  {participantList.length}
                </div>
              </div>
            </div>

            <Divider.Root variant='line-spacing' className='my-0 py-4' />

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center gap-2'>
                <RiTimeLine className='size-4 text-text-soft-400' />
                <div>
                  <div className='text-subheading-2xs uppercase text-text-soft-400'>
                    Начало
                  </div>
                  <div className='text-label-sm text-text-strong-950'>
                    {formatDateTime(auction.start_date)}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <RiTimeLine className='size-4 text-text-soft-400' />
                <div>
                  <div className='text-subheading-2xs uppercase text-text-soft-400'>
                    Окончание
                  </div>
                  <div className='text-label-sm text-text-strong-950'>
                    {formatDateTime(auction.end_date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Winner info */}
            {auction.winner_bid_id && (
              <>
                <Divider.Root variant='line-spacing' className='my-0 py-4' />
                <div className='flex items-center gap-3 rounded-xl bg-success-lighter p-4'>
                  <RiTrophyLine className='size-5 text-success-base' />
                  <div>
                    <div className='text-label-sm text-text-strong-950'>
                      Победитель определён
                    </div>
                    <div className='text-paragraph-xs text-text-sub-600'>
                      Ставка #{auction.winner_bid_id}
                    </div>
                  </div>
                </div>
              </>
            )}
          </WidgetBox.Root>

          {/* Sealed Bids — visible to owner */}
          {isOwner && bidsList.length > 0 && (
            <WidgetBox.Root>
              <WidgetBox.Header>
                <WidgetBox.HeaderIcon as={RiMoneyDollarCircleLine} />
                Закрытые ставки
              </WidgetBox.Header>

              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Участник</Table.Head>
                    <Table.Head>Сумма</Table.Head>
                    <Table.Head>Дата</Table.Head>
                    <Table.Head className='w-12' />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {bidsList.map((bid) => (
                    <Table.Row key={bid.id}>
                      <Table.Cell>
                        <div className='text-label-sm text-text-strong-950'>
                          {bid.first_name} {bid.last_name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className='text-label-sm text-text-strong-950'>
                          {formatPrice(bid.amount)}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className='text-paragraph-sm text-text-sub-600'>
                          {formatDateTime(bid.created_at)}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {auction.winner_bid_id === bid.id && (
                          <Badge.Root
                            variant='light'
                            color='green'
                            size='small'
                          >
                            Победитель
                          </Badge.Root>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </WidgetBox.Root>
          )}

          {/* My bid — visible to participant */}
          {!isDeveloper && isParticipant && myBid && (
            <WidgetBox.Root>
              <WidgetBox.Header>
                <WidgetBox.HeaderIcon as={RiMoneyDollarCircleLine} />
                Моя ставка
              </WidgetBox.Header>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
                <div>
                  <div className='text-subheading-2xs uppercase text-text-soft-400'>
                    Сумма
                  </div>
                  <div className='mt-1 text-label-md text-text-strong-950'>
                    {formatPrice(myBid.amount)}
                  </div>
                </div>
                <div>
                  <div className='text-subheading-2xs uppercase text-text-soft-400'>
                    Дата
                  </div>
                  <div className='mt-1 text-label-sm text-text-strong-950'>
                    {formatDateTime(myBid.created_at)}
                  </div>
                </div>
                <div>
                  <div className='text-subheading-2xs uppercase text-text-soft-400'>
                    Обновлена
                  </div>
                  <div className='mt-1 text-label-sm text-text-strong-950'>
                    {formatDateTime(myBid.updated_at)}
                  </div>
                </div>
              </div>
            </WidgetBox.Root>
          )}
        </div>

        {/* Right: Participants */}
        <div className='flex flex-col gap-5'>
          <WidgetBox.Root>
            <WidgetBox.Header>
              <WidgetBox.HeaderIcon as={RiUserLine} />
              Участники ({participantList.length})
            </WidgetBox.Header>

            {participantList.length === 0 ? (
              <div className='py-6 text-center text-paragraph-sm text-text-soft-400'>
                Пока нет участников
              </div>
            ) : (
              <div className='space-y-2'>
                {participantList.map((p) => (
                  <div
                    key={p.id}
                    className='flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 ring-inset ring-stroke-soft-200'
                  >
                    <div className='flex items-center gap-3'>
                      {/* Shortlist checkbox for owner */}
                      {isOwner && isActive && (
                        <button
                          type='button'
                          onClick={() => toggleShortlist(p.id)}
                          className={`flex size-5 shrink-0 items-center justify-center rounded border transition ${
                            shortlistIds.has(p.id)
                              ? 'border-primary-base bg-primary-base text-white'
                              : 'border-stroke-soft-200'
                          }`}
                        >
                          {shortlistIds.has(p.id) && (
                            <RiCheckLine className='size-3.5' />
                          )}
                        </button>
                      )}
                      <div>
                        <div className='text-label-sm text-text-strong-950'>
                          {p.first_name} {p.last_name}
                        </div>
                        <div className='text-paragraph-xs text-text-sub-600'>
                          {formatDate(p.joined_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shortlist action */}
            {isOwner && isActive && shortlistIds.size > 0 && (
              <>
                <Divider.Root variant='line-spacing' className='my-0 py-3' />
                <FancyButton.Root
                  variant='primary'
                  size='xsmall'
                  className='w-full'
                  onClick={handleShortlist}
                  disabled={shortlist.isPending}
                >
                  <FancyButton.Icon as={RiListCheck2} />
                  {shortlist.isPending
                    ? 'Формирование...'
                    : `В шорт-лист (${shortlistIds.size})`}
                </FancyButton.Root>
              </>
            )}
          </WidgetBox.Root>

          {/* Broker status card */}
          {!isDeveloper && (
            <WidgetBox.Root>
              <WidgetBox.Header>Ваш статус</WidgetBox.Header>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-paragraph-sm text-text-sub-600'>
                    Участие
                  </span>
                  {isParticipant ? (
                    <StatusBadge.Root variant='light' status='completed'>
                      <StatusBadge.Dot />
                      Участвуете
                    </StatusBadge.Root>
                  ) : (
                    <StatusBadge.Root variant='light' status='disabled'>
                      <StatusBadge.Dot />
                      Не участвуете
                    </StatusBadge.Root>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-paragraph-sm text-text-sub-600'>
                    Ставка
                  </span>
                  {myBid ? (
                    <span className='text-label-sm text-text-strong-950'>
                      {formatPrice(myBid.amount)}
                    </span>
                  ) : (
                    <span className='text-paragraph-sm text-text-soft-400'>
                      —
                    </span>
                  )}
                </div>
                {auction.winner_bid_id && myBid && (
                  <div className='flex items-center justify-between'>
                    <span className='text-paragraph-sm text-text-sub-600'>
                      Результат
                    </span>
                    {auction.winner_bid_id === myBid.id ? (
                      <Badge.Root variant='light' color='green' size='small'>
                        Победа
                      </Badge.Root>
                    ) : (
                      <Badge.Root variant='lighter' color='gray' size='small'>
                        Не выиграли
                      </Badge.Root>
                    )}
                  </div>
                )}
              </div>
            </WidgetBox.Root>
          )}
        </div>
      </div>

      {/* Modals */}
      <PlaceBidModal
        auctionId={auctionId}
        open={bidModalOpen}
        onOpenChange={setBidModalOpen}
        existingBid={myBid}
      />

      {isOwner && (
        <SelectWinnerModal
          auctionId={auctionId}
          bids={bidsList}
          open={winnerModalOpen}
          onOpenChange={setWinnerModalOpen}
        />
      )}
    </div>
  );
}
