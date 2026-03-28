'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { DealProgressBar } from './deal-progress-bar';
import type { DeveloperDeal, DealStatus } from '@/shared/types/deals';

// --- Mock data ---
const MOCK_DEVELOPER_DEALS: DeveloperDeal[] = [
  {
    id: 1,
    property_name: 'ЖК «Невский», корп. 1, кв. 25',
    auction_id: 1076,
    auction_mode: 'closed',
    finished_at: '2026-03-15',
    property_price: '6100000',
    broker_bid: '6100000',
    commission_rate: '1.5',
    admin_reviewed: true,
    admin_reviewed_at: '2026-03-20',
    status: 'developer_review',
    closed_at: null,
    broker: {
      id: 1,
      first_name: 'Иванов',
      last_name: 'Пётр Сергеевич',
      company_name: 'ИП Иванов',
      is_verified: true,
      initials: 'ИП',
    },
    documents: [
      { id: 1, filename: 'ДДУ', url: '#', size: 1048576, uploaded_at: '2026-03-10' },
      { id: 2, filename: 'Оплата', url: '#', size: 524288, uploaded_at: '2026-03-10' },
    ],
  },
  {
    id: 2,
    property_name: 'ЖК «Парковый», секция А, кв. 112',
    auction_id: 1089,
    auction_mode: 'closed',
    finished_at: '2026-03-10',
    property_price: '7800000',
    broker_bid: '7800000',
    commission_rate: '1.7',
    admin_reviewed: false,
    admin_reviewed_at: null,
    status: 'admin_review',
    closed_at: null,
    broker: {
      id: 2,
      first_name: 'Смирнова',
      last_name: 'Анна Викторовна',
      company_name: 'ООО «Брокер-Сервис»',
      is_verified: true,
      initials: 'СА',
    },
    documents: [
      { id: 3, filename: 'ДДУ', url: '#', size: 1258291, uploaded_at: '2026-03-12' },
      { id: 4, filename: 'Оплата', url: '#', size: 839680, uploaded_at: '2026-03-12' },
    ],
  },
  {
    id: 3,
    property_name: 'ЖК «Солнечный», корп. 2, кв. 48',
    auction_id: 1103,
    auction_mode: 'open',
    finished_at: '2026-03-25',
    property_price: '4200000',
    broker_bid: '4200000',
    commission_rate: '3.0',
    admin_reviewed: false,
    admin_reviewed_at: null,
    status: 'awaiting_documents',
    closed_at: null,
    broker: {
      id: 3,
      first_name: 'Козлов',
      last_name: 'Дмитрий Андреевич',
      company_name: 'ИП Козлов',
      is_verified: true,
      initials: 'КД',
    },
    documents: [],
  },
  {
    id: 4,
    property_name: 'ЖК «Ривьера», блок В, кв. 7',
    auction_id: 1042,
    auction_mode: 'closed',
    finished_at: '2026-02-20',
    property_price: '5500000',
    broker_bid: '5500000',
    commission_rate: '2.5',
    admin_reviewed: true,
    admin_reviewed_at: '2026-02-25',
    status: 'confirmed',
    closed_at: '2026-03-03',
    broker: {
      id: 1,
      first_name: 'Иванов',
      last_name: 'Пётр Сергеевич',
      company_name: 'ИП Иванов',
      is_verified: true,
      initials: 'ИП',
    },
    documents: [
      { id: 5, filename: 'ДДУ', url: '#', size: 1048576, uploaded_at: '2026-02-15' },
      { id: 6, filename: 'Оплата', url: '#', size: 524288, uploaded_at: '2026-02-15' },
    ],
  },
];

type TabFilter = 'all' | 'developer_review' | 'awaiting_documents' | 'confirmed';

const DEV_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает моего ОК', value: 'developer_review' },
  { label: 'Документы у брокера', value: 'awaiting_documents' },
  { label: 'Подтверждена', value: 'confirmed' },
];

function getStatusBadge(status: DealStatus) {
  const map: Record<DealStatus, { label: string; className: string }> = {
    awaiting_documents: { label: 'Ожидает документов', className: 'bg-amber-50 text-amber-700' },
    admin_review: { label: 'На проверке админа', className: 'bg-gray-100 text-gray-600' },
    developer_review: { label: 'Ожидает моего ОК', className: 'bg-blue-50 text-blue-700' },
    confirmed: { label: 'Подтверждена', className: 'bg-emerald-50 text-emerald-700' },
    overdue: { label: 'Просрочено', className: 'bg-red-50 text-red-700' },
  };
  return map[status];
}

function getInfoMessage(deal: DeveloperDeal): { text: string; color: string } | null {
  switch (deal.status) {
    case 'awaiting_documents':
      return { text: 'Брокер ещё не загрузил документы по сделке.', color: 'text-amber-600' };
    case 'admin_review':
      return { text: 'Брокер загрузил документы. Ожидаем проверки админом, после чего вам нужно будет подтвердить сделку.', color: 'text-blue-600' };
    case 'confirmed':
      return null;
    default:
      return null;
  }
}

function DeveloperDealCard({ deal }: { deal: DeveloperDeal }) {
  const badge = getStatusBadge(deal.status);
  const info = getInfoMessage(deal);

  const fourthColumnLabel = deal.status === 'confirmed'
    ? 'Закрыта'
    : deal.status === 'awaiting_documents'
      ? 'Дедлайн'
      : deal.admin_reviewed
        ? 'Админ проверил'
        : 'Админ проверил';

  const fourthColumnValue = deal.status === 'confirmed'
    ? formatDateShort(deal.closed_at)
    : deal.admin_reviewed
      ? <span className="text-emerald-600">Да, {formatDateShort(deal.admin_reviewed_at).replace(/\.\d{4}$/, '').replace(/^0/, '')}</span>
      : <span className="text-red-600">Нет</span>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{deal.property_name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.auction_mode === 'open' ? 'Открытый' : 'Закрытый'} аукцион #{deal.auction_id} · Завершён {formatDateShort(deal.finished_at)}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Стоимость объекта</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(deal.property_price)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ставка брокера</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(deal.broker_bid)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Моя комиссия</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{deal.commission_rate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{typeof fourthColumnValue === 'string' ? fourthColumnLabel : fourthColumnLabel}</p>
          <p className="text-sm font-semibold mt-0.5">{fourthColumnValue}</p>
        </div>
      </div>

      {/* Broker info */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-900 mb-2">Брокер-победитель</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
              {deal.broker.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{deal.broker.first_name} {deal.broker.last_name}</p>
              <p className="text-xs text-gray-500">{deal.broker.company_name} · {deal.broker.is_verified ? 'Верифицирован' : 'Не верифицирован'}</p>
            </div>
          </div>
          {deal.documents.length > 0 && (
            <div className="flex gap-2">
              {deal.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <HugeiconsIcon icon={File01Icon} size={14} color="currentColor" strokeWidth={1.5} />
                  {doc.filename}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <DealProgressBar
        currentStep={deal.status}
        stepLabels={{ developer_review: 'Мой ОК' }}
      />

      {/* Action buttons for developer_review */}
      {deal.status === 'developer_review' && (
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Подтвердить сделку
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Отклонить
          </button>
        </div>
      )}

      {/* Info message */}
      {info && (
        <div className="flex items-start gap-2 mt-4">
          <span className={cn(
            'mt-1 size-2 shrink-0 rounded-full',
            info.color === 'text-blue-600' ? 'bg-blue-500' : 'bg-amber-500'
          )} />
          <p className={cn('text-xs', info.color)}>{info.text}</p>
        </div>
      )}
    </div>
  );
}

export function DeveloperDealsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const deals = MOCK_DEVELOPER_DEALS;

  const filtered = activeTab === 'all'
    ? deals
    : activeTab === 'awaiting_documents'
      ? deals.filter((d) => d.status === 'awaiting_documents')
      : activeTab === 'developer_review'
        ? deals.filter((d) => d.status === 'developer_review')
        : deals.filter((d) => d.status === 'confirmed');

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
            const count = tab.value === 'all' ? deals.length
              : tab.value === 'awaiting_documents' ? deals.filter((d) => d.status === 'awaiting_documents').length
                : tab.value === 'developer_review' ? deals.filter((d) => d.status === 'developer_review').length
                  : deals.filter((d) => d.status === 'confirmed').length;
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
              <p className="text-xs text-gray-400 mt-1">Сделки появятся после завершения аукционов по вашим объектам</p>
            </div>
          ) : (
            filtered.map((deal) => <DeveloperDealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </div>
    </div>
  );
}
