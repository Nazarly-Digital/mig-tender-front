'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { DealProgressBar } from './deal-progress-bar';
import { useDeals, useDeveloperConfirmDeal, useDeveloperRejectDeal } from '@/features/deals';
import type { Deal, DealStatus } from '@/shared/types/deals';

type TabFilter = 'all' | 'developer_confirm' | 'pending_documents' | 'confirmed';

const DEV_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает моего ОК', value: 'developer_confirm' },
  { label: 'Документы у брокера', value: 'pending_documents' },
  { label: 'Подтверждена', value: 'confirmed' },
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
        stepLabels={{ developer_confirm: 'Мой ОК' }}
      />

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
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Подтвердить сделку
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

export function DeveloperDealsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const { data, isLoading } = useDeals(
    activeTab === 'all' ? undefined : { status: activeTab as DealStatus }
  );
  const deals = data?.results ?? [];

  const { data: allData } = useDeals();
  const allDeals = allData?.results ?? [];

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Сделки по моим объектам</h1>
          <p className="text-sm text-gray-500 mt-0.5">Результаты аукционов, подтверждение сделок, статусы</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {DEV_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? allDeals.length
              : allDeals.filter((d) => d.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors',
                  activeTab === tab.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50',
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
