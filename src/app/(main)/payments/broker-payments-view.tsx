'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/formatters';
import { PaymentProgressBar } from './payment-progress-bar';
import type { BrokerPayment, BrokerPaymentSummary, PaymentStatus } from '@/shared/types/payments';

// --- Mock data ---
const MOCK_SUMMARY: BrokerPaymentSummary = {
  total_accrued: '354400',
  from_developers: '270000',
  from_platform: '84400',
  pending: '212400',
};

const MOCK_PAYMENTS: BrokerPayment[] = [
  {
    id: 1,
    property_name: 'ЖК «Ривьера», блок В, кв. 7',
    auction_id: 1042,
    property_price: '5500000',
    status: 'paid',
    developer_commission: { rate: '2.5', amount: '137500', status: 'paid', receipt_url: null },
    platform_commission: { rate: '0.8', amount: '44000', status: 'paid', receipt_url: '#' },
    total: '181500',
  },
  {
    id: 2,
    property_name: 'ЖК «Парковый», секция А, кв. 112',
    auction_id: 1089,
    property_price: '7800000',
    status: 'pending',
    developer_commission: { rate: '1.7', amount: '132600', status: 'pending', receipt_url: null },
    platform_commission: { rate: '0.8', amount: '62400', status: 'pending', receipt_url: null },
    total: '195000',
  },
  {
    id: 3,
    property_name: 'ЖК «Солнечный», корп. 2, кв. 48',
    auction_id: 1103,
    property_price: '4200000',
    status: 'confirmed',
    developer_commission: { rate: '3.0', amount: '126000', status: 'confirmed', receipt_url: null },
    platform_commission: { rate: '0.8', amount: '33600', status: 'confirmed', receipt_url: null },
    total: '159600',
  },
];

type TabFilter = 'all' | PaymentStatus;

const BROKER_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидание', value: 'pending' },
  { label: 'Подтверждена', value: 'confirmed' },
  { label: 'Выплачена', value: 'paid' },
];

function getStatusBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    pending: { label: 'Ожидание', className: 'bg-amber-50 text-amber-700' },
    confirmed: { label: 'Подтверждена', className: 'bg-blue-50 text-blue-700' },
    paid: { label: 'Выплачена', className: 'bg-emerald-50 text-emerald-700' },
  };
  return map[status];
}

function getStatusLabel(status: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    pending: { label: 'Ожидание', className: 'text-amber-600' },
    confirmed: { label: 'Подтверждена', className: 'text-blue-600' },
    paid: { label: 'Выплачена', className: 'text-gray-900' },
  };
  return map[status];
}

function getInfoMessage(payment: BrokerPayment): { text: string; color: string } | null {
  switch (payment.status) {
    case 'pending':
      return { text: 'Выплата будет оформлена после подтверждения сделки админом и девелопером', color: 'text-amber-600' };
    case 'confirmed':
      return { text: 'Выплата подтверждена админом. Ожидаем перевод.', color: 'text-blue-600' };
    default:
      return null;
  }
}

function BrokerPaymentCard({ payment }: { payment: BrokerPayment }) {
  const badge = getStatusBadge(payment.status);
  const devStatus = getStatusLabel(payment.developer_commission.status);
  const info = getInfoMessage(payment);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{payment.property_name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Аукцион #{payment.auction_id} · Стоимость объекта: {formatPrice(payment.property_price)}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Commission blocks */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Developer commission */}
        <div className="border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-700 mb-3">Комиссия от девелопера</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] text-gray-500">Ставка</p>
              <p className="text-sm font-semibold text-gray-900">{payment.developer_commission.rate}%</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Сумма</p>
              <p className="text-sm font-semibold text-gray-900">{formatPrice(payment.developer_commission.amount)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Статус</p>
              <p className={cn('text-sm font-semibold', devStatus.className)}>{devStatus.label}</p>
            </div>
          </div>
        </div>

        {/* Platform commission */}
        <div className="border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-700 mb-3">Комиссия от платформы</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] text-gray-500">Ставка</p>
              <p className="text-sm font-semibold text-gray-900">{payment.platform_commission.rate}%</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Сумма</p>
              <p className="text-sm font-semibold text-gray-900">{formatPrice(payment.platform_commission.amount)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Чек</p>
              {payment.platform_commission.receipt_url ? (
                <a
                  href={payment.platform_commission.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <HugeiconsIcon icon={File01Icon} size={14} color="currentColor" strokeWidth={1.5} />
                  Чек.pdf
                </a>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mt-3">
        <p className="text-sm text-gray-500">
          Итого: <span className="font-bold text-gray-900">{formatPrice(payment.total)}</span>
        </p>
      </div>

      {/* Progress */}
      <PaymentProgressBar currentStep={payment.status} />

      {/* Info message */}
      {info && (
        <div className="flex items-start gap-2 mt-4">
          <span className={cn(
            'mt-1 size-2 shrink-0 rounded-full',
            info.color === 'text-blue-600' ? 'bg-blue-500' : 'bg-amber-500',
          )} />
          <p className={cn('text-xs', info.color)}>{info.text}</p>
        </div>
      )}
    </div>
  );
}

export function BrokerPaymentsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const summary = MOCK_SUMMARY;
  const payments = MOCK_PAYMENTS;
  const filtered = activeTab === 'all' ? payments : payments.filter((p) => p.status === activeTab);

  const summaryCards = [
    { label: 'Всего начислено', value: summary.total_accrued, color: 'text-gray-900' },
    { label: 'От девелоперов', value: summary.from_developers, color: 'text-amber-600' },
    { label: 'От платформы', value: summary.from_platform, color: 'text-blue-600' },
    { label: 'В ожидании', value: summary.pending, color: 'text-red-600' },
  ];

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Мои выплаты</h1>
          <p className="text-sm text-gray-500 mt-0.5">Комиссия от девелопера + комиссия платформы (0.8%) после закрытия сделки</p>
        </div>

        {/* Summary KPI */}
        <div className="grid grid-cols-4 gap-4 mt-5">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={cn('text-2xl font-bold tracking-tight mt-1', card.color)}>{formatPrice(card.value)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {BROKER_TABS.map((tab) => (
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
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-4 mt-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-900">Нет выплат</p>
              <p className="text-xs text-gray-400 mt-1">Выплаты появятся после закрытия сделок</p>
            </div>
          ) : (
            filtered.map((payment) => <BrokerPaymentCard key={payment.id} payment={payment} />)
          )}
        </div>
      </div>
    </div>
  );
}
