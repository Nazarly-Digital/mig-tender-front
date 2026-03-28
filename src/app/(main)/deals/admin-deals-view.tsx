'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { DealProgressBar } from './deal-progress-bar';
import type { AdminDeal, DealStatus, ObligationStatus } from '@/shared/types/deals';

// --- Mock data ---
const MOCK_ADMIN_DEALS: AdminDeal[] = [
  {
    id: 1,
    property_name: 'ЖК «Парковый», секция А, кв. 112',
    auction_id: 1089,
    auction_mode: 'closed',
    property_price: '7800000',
    broker_bid: '7800000',
    developer_commission: '1.7',
    platform_commission: '0.8',
    obligation_status: 'active',
    status: 'admin_review',
    closed_at: null,
    reviewed_at: null,
    broker: { id: 2, first_name: 'Смирнова', last_name: 'А. В.', company_name: 'ООО «Брокер-Сервис»', initials: 'Б' },
    developer: { id: 10, company_name: 'ГК «Базис»', initials: 'Д' },
    documents: [
      { id: 1, filename: 'ДДУ_112.pdf', url: '#', size: 1258291, uploaded_at: '2026-03-12' },
      { id: 2, filename: 'Оплата_подтверждение.pdf', url: '#', size: 839680, uploaded_at: '2026-03-12' },
    ],
    broker_comment: null,
  },
  {
    id: 2,
    property_name: 'ЖК «Лесной», корп. 3, кв. 91',
    auction_id: 1112,
    auction_mode: 'open',
    property_price: '3900000',
    broker_bid: '3900000',
    developer_commission: '2.0',
    platform_commission: '0.8',
    obligation_status: 'active',
    status: 'admin_review',
    closed_at: null,
    reviewed_at: null,
    broker: { id: 3, first_name: 'Козлов', last_name: 'Д. А.', company_name: 'ИП Козлов', initials: 'Б' },
    developer: { id: 11, company_name: 'ООО «ЛесПром»', initials: 'Д' },
    documents: [
      { id: 3, filename: 'ДДУ_91.pdf', url: '#', size: 2202009, uploaded_at: '2026-03-20' },
      { id: 4, filename: 'Чек_оплата.jpg', url: '#', size: 524288, uploaded_at: '2026-03-20' },
    ],
    broker_comment: 'Оригиналы ДДУ переданы лично в офис девелопера 20 марта',
  },
  {
    id: 3,
    property_name: 'ЖК «Невский», корп. 1, кв. 25',
    auction_id: 1076,
    auction_mode: 'closed',
    property_price: '6100000',
    broker_bid: '6100000',
    developer_commission: '1.5',
    platform_commission: '0.8',
    obligation_status: 'active',
    status: 'developer_review',
    closed_at: null,
    reviewed_at: '2026-03-20',
    broker: { id: 1, first_name: 'Иванов', last_name: 'П. С.', company_name: 'ИП Иванов', initials: 'Б' },
    developer: { id: 12, company_name: 'ООО «ПетроСтрой»', initials: 'Д' },
    documents: [],
    broker_comment: null,
  },
  {
    id: 4,
    property_name: 'ЖК «Ривьера», блок В, кв. 7',
    auction_id: 1042,
    auction_mode: 'closed',
    property_price: '5500000',
    broker_bid: '5500000',
    developer_commission: '2.5',
    platform_commission: '0.8',
    obligation_status: 'fulfilled',
    status: 'confirmed',
    closed_at: '2026-03-03',
    reviewed_at: '2026-02-25',
    broker: { id: 1, first_name: 'Иванов', last_name: 'П. С.', company_name: 'ИП Иванов', initials: 'Б' },
    developer: { id: 13, company_name: 'АО «МегаСтрой»', initials: 'Д' },
    documents: [],
    broker_comment: null,
  },
  {
    id: 5,
    property_name: 'ЖК «Солнечный», корп. 2, кв. 48',
    auction_id: 1103,
    auction_mode: 'open',
    property_price: '4200000',
    broker_bid: '4200000',
    developer_commission: '3.0',
    platform_commission: '0.8',
    obligation_status: 'active',
    status: 'awaiting_documents',
    closed_at: null,
    reviewed_at: null,
    broker: { id: 3, first_name: 'Козлов', last_name: 'Д. А.', company_name: 'ИП Козлов', initials: 'Б' },
    developer: { id: 10, company_name: 'ООО «СтройИнвест»', initials: 'Д' },
    documents: [],
    broker_comment: null,
  },
  {
    id: 6,
    property_name: 'ЖК «Центральный», кв. 34',
    auction_id: 1021,
    auction_mode: 'open',
    property_price: '3100000',
    broker_bid: '3100000',
    developer_commission: '2.0',
    platform_commission: '0.8',
    obligation_status: 'overdue',
    status: 'overdue',
    closed_at: null,
    reviewed_at: null,
    broker: { id: 4, first_name: 'Петров', last_name: 'А. М.', company_name: 'ИП Петров', initials: 'Б' },
    developer: { id: 14, company_name: 'ООО «ГрадСтрой»', initials: 'Д' },
    documents: [],
    broker_comment: null,
  },
];

type TabFilter = 'all' | DealStatus;

const ADMIN_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'На проверке', value: 'admin_review' },
  { label: 'Ожидает девелопера', value: 'developer_review' },
  { label: 'Подтверждена', value: 'confirmed' },
  { label: 'Ожидает документов', value: 'awaiting_documents' },
  { label: 'Просрочено', value: 'overdue' },
];

function getStatusBadge(status: DealStatus) {
  const map: Record<DealStatus, { label: string; className: string }> = {
    awaiting_documents: { label: 'Ожидает документов', className: 'bg-amber-50 text-amber-700' },
    admin_review: { label: 'На проверке', className: 'bg-blue-50 text-blue-700' },
    developer_review: { label: 'Ожидает девелопера', className: 'bg-purple-50 text-purple-700' },
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

function getInfoMessage(deal: AdminDeal): { text: string; color: string } | null {
  switch (deal.status) {
    case 'developer_review':
      return { text: `Вы одобрили документы. Ожидаем подтверждения от ${deal.developer.company_name}.`, color: 'text-blue-600' };
    case 'confirmed':
      return null;
    default:
      return null;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function AdminDealCard({ deal }: { deal: AdminDeal }) {
  const badge = getStatusBadge(deal.status);
  const obligation = getObligationLabel(deal.obligation_status);
  const info = getInfoMessage(deal);
  const isReviewable = deal.status === 'admin_review';

  const lastColumnLabel = deal.status === 'confirmed'
    ? 'Закрыта'
    : deal.reviewed_at
      ? 'Проверил'
      : 'Обязательство';
  const lastColumnValue = deal.status === 'confirmed'
    ? formatDateShort(deal.closed_at)
    : deal.reviewed_at
      ? <span className="text-gray-900">Вы, {formatDateShort(deal.reviewed_at).replace(/\.\d{4}$/, '').replace(/^0/, '')}</span>
      : <span className={obligation.className}>{obligation.label}</span>;

  return (
    <div className={cn(
      'bg-white rounded-xl border p-5',
      isReviewable ? 'border-blue-200' : 'border-gray-200',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{deal.property_name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.auction_mode === 'open' ? 'Открытый' : 'Закрытый'} аукцион #{deal.auction_id}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Объект</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(deal.property_price)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ставка</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(deal.broker_bid)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Комиссия дев.</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{deal.developer_commission}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Комиссия платф.</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{deal.platform_commission}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{lastColumnLabel}</p>
          <p className="text-sm font-semibold mt-0.5">{lastColumnValue}</p>
        </div>
      </div>

      {/* Participants */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-900 mb-2">Участники</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-semibold text-amber-700">
                Б
              </div>
              <span className="text-sm text-gray-900">{deal.broker.first_name} {deal.broker.last_name} · {deal.broker.company_name}</span>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Брокер</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                Д
              </div>
              <span className="text-sm text-gray-900">{deal.developer.company_name}</span>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Девелопер</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      {deal.documents.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-900 mb-2">Документы от брокера</p>
          <div className="flex gap-2">
            {deal.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <HugeiconsIcon icon={File01Icon} size={14} color="currentColor" strokeWidth={1.5} />
                {doc.filename} · {formatFileSize(doc.size)}
              </a>
            ))}
          </div>
          {deal.documents[0]?.uploaded_at && (
            <p className="text-[11px] text-gray-400 mt-1.5">Загружено: {formatDateShort(deal.documents[0].uploaded_at)}</p>
          )}
        </div>
      )}

      {/* Broker comment */}
      {deal.broker_comment && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Комментарий брокера: «{deal.broker_comment}»</p>
        </div>
      )}

      {/* Progress */}
      <DealProgressBar
        currentStep={deal.status}
        isOverdue={deal.status === 'overdue'}
        stepLabels={{
          admin_review: isReviewable ? 'Проверка (вы)' : 'Проверено вами',
        }}
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-3">
          {isReviewable && (
            <>
              <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Одобрить документы
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Отклонить
              </button>
            </>
          )}
        </div>
        {deal.status !== 'awaiting_documents' && (
          <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            История сделки
          </button>
        )}
      </div>

      {/* Info message */}
      {info && (
        <div className="flex items-start gap-2 mt-4">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
          <p className={cn('text-xs', info.color)}>{info.text}</p>
        </div>
      )}
    </div>
  );
}

export function AdminDealsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const deals = MOCK_ADMIN_DEALS;
  const filtered = activeTab === 'all' ? deals : deals.filter((d) => d.status === activeTab);

  // KPI counts
  const kpis = [
    { label: 'На проверке', value: deals.filter((d) => d.status === 'admin_review').length, color: 'text-blue-600' },
    { label: 'Ожидают девелопера', value: deals.filter((d) => d.status === 'developer_review').length, color: 'text-purple-600' },
    { label: 'Подтверждены', value: deals.filter((d) => d.status === 'confirmed').length, color: 'text-emerald-600' },
    { label: 'Просрочены', value: deals.filter((d) => d.status === 'overdue').length, color: 'text-red-600' },
  ];

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Админ-панель · Сделки</h1>
          <p className="text-sm text-gray-500 mt-0.5">Проверка документов, подтверждение сделок, контроль обязательств</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4 mt-5">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className={cn('text-2xl font-bold tracking-tight mt-1', kpi.color)}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {ADMIN_TABS.map((tab) => {
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
              <p className="text-xs text-gray-400 mt-1">Сделки с таким статусом отсутствуют</p>
            </div>
          ) : (
            filtered.map((deal) => <AdminDealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </div>
    </div>
  );
}
