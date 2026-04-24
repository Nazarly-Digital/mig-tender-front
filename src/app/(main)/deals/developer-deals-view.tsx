'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  File01Icon,
  ArrowMoveDownRightIcon,
  AlertCircleIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { useDeals, useDeveloperConfirmDeal, useDeveloperRejectDeal } from '@/features/deals';
import { useMyAuctions } from '@/features/auctions';
import type { Deal, DealStatus } from '@/shared/types/deals';
import type { Auction } from '@/shared/types/auctions';

type TabFilter = 'all' | 'developer_confirm' | 'pending_documents' | 'admin_review' | 'confirmed' | 'failed' | 'declined';

const DEV_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает моего подтверждения', value: 'developer_confirm' },
  { label: 'На проверке', value: 'admin_review' },
  { label: 'Ожидает документов', value: 'pending_documents' },
  { label: 'Сделка подтверждена', value: 'confirmed' },
  { label: 'Несостоявшиеся', value: 'failed' },
  { label: 'Отклонённые', value: 'declined' },
];

type BadgeTone = 'amber' | 'blue' | 'violet' | 'emerald' | 'red';

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  amber: 'bg-amber-50 text-amber-700 border border-amber-100',
  blue: 'bg-blue-50 text-blue-700 border border-blue-100',
  violet: 'bg-violet-50 text-violet-700 border border-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  red: 'bg-red-50 text-red-700 border border-red-100',
};

function getStatusBadge(status: DealStatus): { label: string; tone: BadgeTone; withIcon?: boolean } {
  const map: Record<DealStatus, { label: string; tone: BadgeTone; withIcon?: boolean }> = {
    pending_documents: { label: 'Ожидает документов', tone: 'amber' },
    admin_review: { label: 'На проверке', tone: 'blue' },
    developer_confirm: { label: 'Требуется подтверждение', tone: 'violet', withIcon: true },
    confirmed: { label: 'Подтверждена', tone: 'emerald' },
    failed: { label: 'Несостоявшаяся', tone: 'red' },
    declined: { label: 'Отклонена мной', tone: 'red' },
  };
  return map[status];
}

const DEV_STEPS: { key: DealStatus | 'confirmed'; label: string }[] = [
  { key: 'pending_documents', label: 'Документы' },
  { key: 'admin_review', label: 'Проверка' },
  { key: 'developer_confirm', label: 'Моё решение' },
  { key: 'confirmed', label: 'Готово' },
];

function getStepIndex(status: DealStatus): number {
  if (status === 'confirmed') return DEV_STEPS.length - 1;
  const idx = DEV_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
}

function formatDeadlineRelative(deadline: string, isOverdue: boolean): string {
  const shortDate = formatDateShort(deadline);
  if (isOverdue) return `Просрочено · ${shortDate}`;
  const now = new Date();
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return shortDate;
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return `${shortDate} · сегодня`;
  if (diffDays === 1) return `${shortDate} · завтра`;
  return `${shortDate} · ${diffDays} ${pluralDays(diffDays)}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return '';
}

type RightColumn = { label: string; value: string; valueClass?: string };

function getRightColumn(deal: Deal): RightColumn {
  const isOverdue = deal.obligation_status === 'overdue';
  if (deal.status === 'confirmed') {
    return { label: 'Завершено', value: formatDateShort(deal.updated_at) };
  }
  if (deal.status === 'failed' || deal.status === 'declined') {
    return { label: 'Закрыто', value: formatDateShort(deal.updated_at), valueClass: 'text-red-600' };
  }
  if (deal.status === 'admin_review' || deal.status === 'developer_confirm') {
    return { label: 'Загружено', value: formatDateShort(deal.updated_at) };
  }
  return {
    label: 'Дедлайн',
    value: formatDeadlineRelative(deal.document_deadline, isOverdue),
    valueClass: isOverdue ? 'text-red-600 font-semibold' : undefined,
  };
}

type InfoBar = { text: string; tone: 'amber' | 'blue' | 'emerald' | 'red'; icon: typeof AlertCircleIcon };

function getInfoBar(deal: Deal): InfoBar | null {
  if (deal.status === 'declined') {
    return { text: 'Вы отказались от результата аукциона. Сделка закрыта без завершения.', tone: 'red', icon: AlertCircleIcon };
  }
  if (deal.status === 'failed') {
    return { text: 'Сделка автоматически признана несостоявшейся: брокер не загрузил документы в течение 5 дней. Объект снова доступен для размещения в аукционе.', tone: 'red', icon: AlertCircleIcon };
  }
  if (deal.obligation_status === 'overdue') {
    return { text: 'Брокер просрочил загрузку документов.', tone: 'red', icon: AlertCircleIcon };
  }
  switch (deal.status) {
    case 'pending_documents':
      return { text: 'Брокер ещё не загрузил документы', tone: 'amber', icon: Clock01Icon };
    case 'admin_review':
      return { text: 'Администратор проверяет документы · обычно до 2 рабочих дней', tone: 'blue', icon: Clock01Icon };
    case 'confirmed':
      return { text: 'Сделка закрыта · выплата создана', tone: 'emerald', icon: CheckmarkCircle02Icon };
    default:
      return null;
  }
}

const INFO_BAR_TONE: Record<InfoBar['tone'], string> = {
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
};

function extractFileName(url: string): string {
  try {
    const withoutQuery = url.split('?')[0];
    const name = withoutQuery.split('/').pop() || url;
    return decodeURIComponent(name);
  } catch {
    return url;
  }
}

function DeveloperDealCard({ deal }: { deal: Deal }) {
  const badge = getStatusBadge(deal.status);
  const info = getInfoBar(deal);
  const right = getRightColumn(deal);
  const isFailed = deal.status === 'failed';
  const isDeclined = deal.status === 'declined';
  const isTerminal = isFailed || isDeclined;
  const isOverdue = deal.obligation_status === 'overdue';
  const needsAction = deal.status === 'developer_confirm';
  const activeIndex = getStepIndex(deal.status);

  const confirmDeal = useDeveloperConfirmDeal();
  const rejectDeal = useDeveloperRejectDeal();
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectInput, setShowRejectInput] = React.useState(false);

  // Top accent stripe signals what needs attention at a glance.
  const stripeClass = needsAction
    ? 'bg-orange-400'
    : isTerminal
      ? 'bg-red-300'
      : deal.status === 'confirmed'
        ? 'bg-emerald-400'
        : null;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border overflow-hidden',
        isTerminal ? 'border-red-200' : 'border-gray-200',
      )}
    >
      {stripeClass && <div className={cn('h-1 w-full', stripeClass)} />}

      <div className='p-5'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-xs text-gray-500'>
              <Link
                href={`/auctions/${deal.auction_id}`}
                className='font-medium text-gray-600 underline-offset-2 hover:text-blue-600 hover:underline'
              >
                Аукцион #{deal.auction_id}
              </Link>
              <span className='mx-1.5 text-gray-300'>•</span>
              <span>{deal.auction_mode === 'open' ? 'Открытый' : 'Закрытый'}</span>
            </p>
            <h3 className='mt-1 text-base font-semibold text-gray-900 truncate'>
              {deal.property_address}
            </h3>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0',
              BADGE_TONE_CLASS[badge.tone],
            )}
          >
            {badge.withIcon && (
              <HugeiconsIcon icon={AlertCircleIcon} size={12} color='currentColor' strokeWidth={2} />
            )}
            {badge.label}
          </span>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100'>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>Сумма сделки</p>
            <p className='mt-1 text-sm font-semibold text-gray-900 truncate'>{formatPrice(deal.amount)}</p>
          </div>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>Брокер</p>
            <div className='mt-1 flex items-center gap-2'>
              <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700'>
                {getInitials(deal.broker_name)}
              </span>
              <span className='text-sm font-semibold text-gray-900 truncate'>{deal.broker_name}</span>
            </div>
          </div>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>{right.label}</p>
            <p className={cn('mt-1 text-sm font-semibold text-gray-900 truncate', right.valueClass)}>{right.value}</p>
          </div>
        </div>

        {/* Documents */}
        {(deal.ddu_document || deal.payment_proof_document) && (
          <div className='flex flex-wrap gap-2 mt-4'>
            {deal.ddu_document && (
              <a
                href={deal.ddu_document}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors max-w-full'
              >
                <HugeiconsIcon icon={File01Icon} size={14} color='currentColor' strokeWidth={1.5} className='shrink-0' />
                <span className='truncate'>{extractFileName(deal.ddu_document)}</span>
              </a>
            )}
            {deal.payment_proof_document && (
              <a
                href={deal.payment_proof_document}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors max-w-full'
              >
                <HugeiconsIcon icon={File01Icon} size={14} color='currentColor' strokeWidth={1.5} className='shrink-0' />
                <span className='truncate'>{extractFileName(deal.payment_proof_document)}</span>
              </a>
            )}
          </div>
        )}

        {/* Step dots */}
        {!isTerminal && (
          <div className='mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
            {DEV_STEPS.map((step, i) => {
              const isActive = i === activeIndex;
              const isDone = i < activeIndex;
              const dotClass = isOverdue && (isActive || isDone)
                ? 'bg-red-500'
                : isActive
                  ? 'bg-blue-600'
                  : isDone
                    ? 'bg-blue-400'
                    : 'bg-gray-300';
              const textClass = isOverdue && (isActive || isDone)
                ? 'text-red-600 font-medium'
                : isActive
                  ? 'text-blue-600 font-medium'
                  : isDone
                    ? 'text-gray-600'
                    : 'text-gray-400';
              return (
                <React.Fragment key={step.key}>
                  <span className='inline-flex items-center gap-1.5'>
                    <span className={cn('size-1.5 rounded-full', dotClass)} />
                    <span className={textClass}>{step.label}</span>
                  </span>
                  {i < DEV_STEPS.length - 1 && <span className='text-gray-300'>›</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Action buttons (developer_confirm only) */}
        {needsAction && (
          <div className='mt-4'>
            {showRejectInput ? (
              <div className='space-y-2'>
                <input
                  type='text'
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder='Причина отклонения'
                  className='w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors'
                />
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) rejectDeal.mutate({ deal_id: deal.id, reason: rejectReason.trim() });
                    }}
                    disabled={!rejectReason.trim() || rejectDeal.isPending}
                    className='px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer'
                  >
                    Подтвердить отклонение
                  </button>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className='px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex gap-2'>
                <button
                  onClick={() => confirmDeal.mutate(deal.id)}
                  disabled={confirmDeal.isPending}
                  className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer'
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color='currentColor' strokeWidth={2} />
                  Подтвердить сделку
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className='flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer'
                >
                  Отклонить
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info bar */}
        {info && (
          <div className={cn('flex items-start gap-2 rounded-lg px-3 py-2 mt-4', INFO_BAR_TONE[info.tone])}>
            <HugeiconsIcon
              icon={info.icon}
              size={14}
              color='currentColor'
              strokeWidth={2}
              className='mt-0.5 shrink-0'
            />
            <p className='text-xs leading-relaxed'>{info.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PendingAssignmentBanner({ auction }: { auction: Auction }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">
          Аукцион #{auction.id} — требуется распределение объектов
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {auction.properties.length} объектов в лоте. Назначьте объекты победителям для создания сделок.
        </p>
      </div>
      <Link href={`/auctions/${auction.id}`}>
        <button className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
          <HugeiconsIcon icon={ArrowMoveDownRightIcon} size={16} color="currentColor" strokeWidth={1.5} />
          Распределить
        </button>
      </Link>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className='flex items-center gap-2 mb-3'>
      <span className='text-[11px] font-semibold uppercase tracking-wider text-gray-500'>{title}</span>
      <span className='inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500'>
        {count}
      </span>
    </div>
  );
}

function GroupedDeals({ deals }: { deals: Deal[] }) {
  const needsAction = deals.filter((d) => d.status === 'developer_confirm');
  const inProgress = deals.filter(
    (d) => d.status === 'pending_documents' || d.status === 'admin_review',
  );
  const completed = deals.filter((d) => d.status === 'confirmed');
  const closed = deals.filter((d) => d.status === 'failed' || d.status === 'declined');

  return (
    <div className='space-y-8'>
      {needsAction.length > 0 && (
        <section>
          <SectionHeader title='Требует решения' count={needsAction.length} />
          <div className='grid grid-cols-1 gap-4'>
            {needsAction.map((deal) => <DeveloperDealCard key={deal.id} deal={deal} />)}
          </div>
        </section>
      )}
      {inProgress.length > 0 && (
        <section>
          <SectionHeader title='В работе' count={inProgress.length} />
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
            {inProgress.map((deal) => <DeveloperDealCard key={deal.id} deal={deal} />)}
          </div>
        </section>
      )}
      {completed.length > 0 && (
        <section>
          <SectionHeader title='Завершённые' count={completed.length} />
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
            {completed.map((deal) => <DeveloperDealCard key={deal.id} deal={deal} />)}
          </div>
        </section>
      )}
      {closed.length > 0 && (
        <section>
          <SectionHeader title='Закрытые' count={closed.length} />
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
            {closed.map((deal) => <DeveloperDealCard key={deal.id} deal={deal} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export function DeveloperDealsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const { data, isLoading } = useDeals(
    activeTab === 'all' ? undefined : { status: activeTab as DealStatus }
  );
  const deals = data?.results ?? [];

  const { data: allData } = useDeals();
  const allDeals = allData?.results ?? [];

  // Auctions that need property distribution (finished, winner selected, deals not created, multi-property)
  const { data: myAuctionsData } = useMyAuctions({ status: 'finished' });
  const pendingAssignAuctions = (myAuctionsData?.results ?? []).filter(
    (a) => a.mode === 'closed' && a.winner_bid && !a.deals_created && a.properties?.length > 1
  );

  return (
    <div className="w-full px-8 py-8">
      <div className="">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Сделки по моим объектам</h1>
          <p className="text-sm text-gray-500 mt-0.5">Результаты аукционов, подтверждение сделок, статусы</p>
        </div>

        {/* Pending assignment banners */}
        {pendingAssignAuctions.length > 0 && (
          <div className="space-y-3 mt-5">
            {pendingAssignAuctions.map((auction) => (
              <PendingAssignmentBanner key={auction.id} auction={auction} />
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-200 mt-5">
          {DEV_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? allDeals.length
              : allDeals.filter((d) => d.status === tab.value).length;
            return (
              <button
                key={tab.value}
                type='button'
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.value
                    ? 'border-blue-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                {tab.label}{tab.value === 'all' && count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-gray-400">Загрузка...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-900">Нет сделок</p>
              <p className="text-xs text-gray-400 mt-1">Сделки появятся после завершения аукционов по вашим объектам</p>
            </div>
          ) : (
            <GroupedDeals deals={deals} />
          )}
        </div>
      </div>
    </div>
  );
}
