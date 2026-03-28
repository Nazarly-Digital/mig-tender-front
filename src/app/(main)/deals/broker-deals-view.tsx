'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, Upload04Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { PageHeader } from '@/shared/components/page-header';
import { DealProgressBar } from './deal-progress-bar';
import type { BrokerDeal, DealStatus, ObligationStatus, DealDocument } from '@/shared/types/deals';

// --- Mock data (will be replaced with API) ---
const MOCK_BROKER_DEALS: BrokerDeal[] = [
  {
    id: 1,
    property_name: 'ЖК «Солнечный», корп. 2, кв. 48',
    developer_company: 'ООО «СтройИнвест»',
    auction_id: 1103,
    auction_mode: 'open',
    bid_amount: '4200000',
    obligation_status: 'active',
    status: 'awaiting_documents',
    deadline: '2026-04-15',
    uploaded_at: null,
    closed_at: null,
    documents: [],
    comment: null,
  },
  {
    id: 2,
    property_name: 'ЖК «Парковый», секция А, кв. 112',
    developer_company: 'ГК «Базис»',
    auction_id: 1089,
    auction_mode: 'closed',
    bid_amount: '7800000',
    obligation_status: 'active',
    status: 'admin_review',
    deadline: null,
    uploaded_at: '2026-03-12',
    closed_at: null,
    documents: [
      { id: 1, filename: 'ДДУ_112.pdf', url: '#', size: 1258291, uploaded_at: '2026-03-12' },
      { id: 2, filename: 'Оплата_подтверждение.pdf', url: '#', size: 839680, uploaded_at: '2026-03-12' },
    ],
    comment: null,
  },
  {
    id: 3,
    property_name: 'ЖК «Невский», корп. 1, кв. 25',
    developer_company: 'ООО «ПетроСтрой»',
    auction_id: 1076,
    auction_mode: 'closed',
    bid_amount: '6100000',
    obligation_status: 'active',
    status: 'developer_review',
    deadline: null,
    uploaded_at: '2026-03-20',
    closed_at: null,
    documents: [
      { id: 3, filename: 'ДДУ_25.pdf', url: '#', size: 1048576, uploaded_at: '2026-03-15' },
      { id: 4, filename: 'Чек_оплата.pdf', url: '#', size: 524288, uploaded_at: '2026-03-15' },
    ],
    comment: null,
  },
  {
    id: 4,
    property_name: 'ЖК «Ривьера», блок В, кв. 7',
    developer_company: 'АО «МегаСтрой»',
    auction_id: 1042,
    auction_mode: 'closed',
    bid_amount: '5500000',
    obligation_status: 'fulfilled',
    status: 'confirmed',
    deadline: null,
    uploaded_at: null,
    closed_at: '2026-03-03',
    documents: [
      { id: 5, filename: 'ДДУ_7.pdf', url: '#', size: 1048576, uploaded_at: '2026-02-20' },
      { id: 6, filename: 'Оплата_чек.pdf', url: '#', size: 524288, uploaded_at: '2026-02-20' },
    ],
    comment: null,
  },
  {
    id: 5,
    property_name: 'ЖК «Центральный», кв. 34',
    developer_company: 'ООО «ГрадСтрой»',
    auction_id: 1021,
    auction_mode: 'open',
    bid_amount: '3100000',
    obligation_status: 'overdue',
    status: 'overdue',
    deadline: '2026-02-01',
    uploaded_at: null,
    closed_at: null,
    documents: [],
    comment: null,
  },
];

type TabFilter = 'all' | DealStatus;

const BROKER_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает документов', value: 'awaiting_documents' },
  { label: 'На проверке', value: 'admin_review' },
  { label: 'Подтверждена', value: 'confirmed' },
  { label: 'Просрочено', value: 'overdue' },
];

function getStatusBadge(status: DealStatus) {
  const map: Record<DealStatus, { label: string; className: string }> = {
    awaiting_documents: { label: 'Ожидает документов', className: 'bg-amber-50 text-amber-700' },
    admin_review: { label: 'На проверке', className: 'bg-gray-100 text-gray-600' },
    developer_review: { label: 'Ожидает девелопера', className: 'bg-blue-50 text-blue-700' },
    confirmed: { label: 'Подтверждена', className: 'bg-emerald-50 text-emerald-700' },
    overdue: { label: 'Просрочено', className: 'bg-red-50 text-red-700' },
  };
  return map[status];
}

function getObligationLabel(status: ObligationStatus) {
  const map: Record<ObligationStatus, { label: string; className: string }> = {
    active: { label: 'Активно', className: 'text-amber-600' },
    fulfilled: { label: 'Выполнено', className: 'text-emerald-600' },
    overdue: { label: 'Просрочено', className: 'text-red-600' },
  };
  return map[status];
}

function getInfoMessage(deal: BrokerDeal): { text: string; color: string } | null {
  switch (deal.status) {
    case 'admin_review':
      return { text: 'Документы на проверке у администратора. Ожидаем подтверждения.', color: 'text-blue-600' };
    case 'developer_review':
      return { text: 'Админ проверил документы. Ожидаем подтверждения от девелопера.', color: 'text-blue-600' };
    case 'confirmed':
      return { text: 'Сделка закрыта. Выплата комиссии оформляется на странице «Мои выплаты».', color: 'text-emerald-600' };
    case 'overdue':
      return { text: `Дедлайн загрузки документов был ${formatDateShort(deal.deadline)}. Обязательство просрочено.`, color: 'text-red-600' };
    default:
      return null;
  }
}

function BrokerDealCard({ deal }: { deal: BrokerDeal }) {
  const badge = getStatusBadge(deal.status);
  const obligation = getObligationLabel(deal.obligation_status);
  const info = getInfoMessage(deal);
  const isOverdue = deal.status === 'overdue';

  const thirdColumnLabel = deal.status === 'awaiting_documents'
    ? 'Дедлайн загрузки'
    : deal.status === 'admin_review'
      ? 'Загружено'
      : deal.status === 'confirmed'
        ? 'Закрыта'
        : deal.status === 'developer_review'
          ? 'Проверено'
          : 'Дедлайн был';

  const thirdColumnValue = deal.status === 'confirmed'
    ? formatDateShort(deal.closed_at)
    : deal.status === 'admin_review' || deal.status === 'developer_review'
      ? formatDateShort(deal.uploaded_at)
      : formatDateShort(deal.deadline);

  return (
    <div className={cn(
      'bg-white rounded-xl border p-5',
      isOverdue ? 'border-red-200' : 'border-gray-200'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{deal.property_name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.developer_company} · {deal.auction_mode === 'open' ? 'Открытый' : 'Закрытый'} аукцион #{deal.auction_id}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Ставка</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(deal.bid_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Обязательство</p>
          <p className={cn('text-sm font-semibold mt-0.5', obligation.className)}>{obligation.label}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{thirdColumnLabel}</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{thirdColumnValue}</p>
        </div>
      </div>

      {/* Progress */}
      <DealProgressBar currentStep={deal.status} isOverdue={isOverdue} />

      {/* Documents section */}
      {deal.status === 'awaiting_documents' && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <HugeiconsIcon icon={Upload04Icon} size={16} color="currentColor" strokeWidth={1.5} />
              Загрузить ДДУ
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <HugeiconsIcon icon={Upload04Icon} size={16} color="currentColor" strokeWidth={1.5} />
              Загрузить подтверждение оплаты
            </button>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Комментарий (если документы переданы вне платформы)</p>
            <input
              type="text"
              placeholder="Ссылка или описание, где находятся документы"
              className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Uploaded documents */}
      {deal.documents.length > 0 && deal.status !== 'awaiting_documents' && (
        <div className="flex gap-2 mt-4">
          {deal.documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <HugeiconsIcon icon={File01Icon} size={14} color="currentColor" strokeWidth={1.5} />
              {doc.filename}
            </a>
          ))}
        </div>
      )}

      {/* Info message */}
      {info && (
        <div className="flex items-start gap-2 mt-4">
          <span className={cn(
            'mt-1 size-2 shrink-0 rounded-full',
            info.color === 'text-blue-600' ? 'bg-blue-500'
              : info.color === 'text-emerald-600' ? 'bg-emerald-500'
                : info.color === 'text-red-600' ? 'bg-red-500'
                  : 'bg-amber-500'
          )} />
          <p className={cn('text-xs', info.color)}>{info.text}</p>
        </div>
      )}
    </div>
  );
}

export function BrokerDealsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  // TODO: Replace with useMyDeals(params) when API is ready
  const deals = MOCK_BROKER_DEALS;
  const filtered = activeTab === 'all' ? deals : deals.filter((d) => d.status === activeTab);

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Мои сделки</h1>
            <p className="text-sm text-gray-500 mt-0.5">Обязательства и документы по выигранным аукционам</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {BROKER_TABS.map((tab) => {
            const count = tab.value === 'all' ? deals.length : deals.filter((d) => d.status === tab.value).length;
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
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-900">Нет сделок</p>
              <p className="text-xs text-gray-400 mt-1">Сделки появятся после победы в аукционах</p>
            </div>
          ) : (
            filtered.map((deal) => <BrokerDealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </div>
    </div>
  );
}
