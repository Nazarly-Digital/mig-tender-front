'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, ArrowMoveDownRightIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { DealProgressBar } from './deal-progress-bar';
import { useDeals, useDeveloperConfirmDeal, useDeveloperRejectDeal } from '@/features/deals';
import { useMyAuctions } from '@/features/auctions';
import type { Deal, DealStatus } from '@/shared/types/deals';
import type { Auction } from '@/shared/types/auctions';

type TabFilter = 'all' | 'developer_confirm' | 'pending_documents' | 'admin_review' | 'confirmed';

const DEV_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает моего подтверждения', value: 'developer_confirm' },
  { label: 'На проверке', value: 'admin_review' },
  { label: 'Ожидает документов', value: 'pending_documents' },
  { label: 'Сделка подтверждена', value: 'confirmed' },
];

function getStatusBadge(status: DealStatus) {
  const map: Record<DealStatus, { label: string; className: string }> = {
    pending_documents: { label: 'Ожидает документов', className: 'bg-amber-50 text-amber-700' },
    admin_review: { label: 'На проверке админа', className: 'bg-gray-100 text-gray-600' },
    developer_confirm: { label: 'Ожидает моего ОК', className: 'bg-blue-50 text-blue-700' },
    confirmed: { label: 'Подтверждена', className: 'bg-emerald-50 text-emerald-700' },
  };
  return map[status];
}

function getInfoMessage(deal: Deal): { text: string; color: string } | null {
  if (deal.obligation_status === 'overdue') {
    return { text: 'Брокер просрочил загрузку документов.', color: 'text-red-600' };
  }
  switch (deal.status) {
    case 'pending_documents':
      return { text: 'Брокер ещё не загрузил документы по сделке.', color: 'text-amber-600' };
    case 'admin_review':
      return { text: 'Брокер загрузил документы. Ожидаем проверки админом, после чего вам нужно будет подтвердить сделку.', color: 'text-blue-600' };
    default:
      return null;
  }
}

function DeveloperDealCard({ deal }: { deal: Deal }) {
  const badge = getStatusBadge(deal.status);
  const info = getInfoMessage(deal);
  const confirmDeal = useDeveloperConfirmDeal();
  const rejectDeal = useDeveloperRejectDeal();
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectInput, setShowRejectInput] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{deal.property_address}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.auction_mode === 'open' ? 'Открытый' : 'Закрытый'} аукцион #{deal.auction_id}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Сумма ставки</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(deal.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Брокер</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{deal.broker_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Дедлайн</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateShort(deal.document_deadline)}</p>
        </div>
      </div>

      {/* Progress */}
      <DealProgressBar
        currentStep={deal.status}
        isOverdue={deal.obligation_status === 'overdue'}
        stepLabels={{ developer_confirm: 'Мое подтверждение' }}
      />

      {/* Documents */}
      {(deal.has_ddu || deal.has_payment_proof) && (
        <div className="flex gap-3 mt-4">
          {deal.ddu_document && (
            <a href={deal.ddu_document} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <HugeiconsIcon icon={File01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              ДДУ
            </a>
          )}
          {deal.payment_proof_document && (
            <a href={deal.payment_proof_document} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <HugeiconsIcon icon={File01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              Подтверждение оплаты
            </a>
          )}
        </div>
      )}

      {/* Action buttons */}
      {deal.status === 'developer_confirm' && (
        <div className="mt-4">
          {showRejectInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Причина отклонения"
                className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (rejectReason.trim()) rejectDeal.mutate({ deal_id: deal.id, reason: rejectReason.trim() });
                  }}
                  disabled={!rejectReason.trim() || rejectDeal.isPending}
                  className="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Подтвердить отклонение
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => confirmDeal.mutate(deal.id)}
                disabled={confirmDeal.isPending}
                className="px-4 py-2.5 text-sm font-medium text-white bg-primary-base rounded-lg transition-colors disabled:opacity-50"
              >
                Подтвердить сделку
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Отклонить
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info message */}
      {info && (
        <div className="flex items-start gap-2 mt-4">
          <span className={cn(
            'mt-1 size-2 shrink-0 rounded-full',
            info.color === 'text-blue-600' ? 'bg-blue-500'
              : info.color === 'text-amber-600' ? 'bg-amber-500'
                : 'bg-red-500'
          )} />
          <p className={cn('text-xs', info.color)}>{info.text}</p>
        </div>
      )}
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
        <div className="space-y-4 mt-6">
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
            deals.map((deal) => <DeveloperDealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </div>
    </div>
  );
}
