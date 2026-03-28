'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import type { DeveloperPayment, DeveloperPaymentSummary, PaymentStatus } from '@/shared/types/payments';

// --- Mock data ---
const MOCK_SUMMARY: DeveloperPaymentSummary = {
  total_to_pay: '229000',
  paid: '137500',
  pending: '91500',
};

const MOCK_PAYMENTS: DeveloperPayment[] = [
  {
    id: 1,
    property_name: 'ЖК «Ривьера», блок В, кв. 7',
    auction_id: 1042,
    deal_confirmed_at: '2026-03-03',
    status: 'paid',
    broker: {
      id: 1,
      first_name: 'Иванов',
      last_name: 'Пётр Сергеевич',
      company_name: 'ИП Иванов',
      initials: 'ИП',
    },
    property_price: '5500000',
    commission_rate: '2.5',
    payment_amount: '137500',
    paid_at: '2026-03-10',
  },
  {
    id: 2,
    property_name: 'ЖК «Невский», корп. 1, кв. 25',
    auction_id: 1076,
    deal_confirmed_at: '2026-03-25',
    status: 'pending',
    broker: {
      id: 1,
      first_name: 'Иванов',
      last_name: 'Пётр Сергеевич',
      company_name: 'ИП Иванов',
      initials: 'ИП',
    },
    property_price: '6100000',
    commission_rate: '1.5',
    payment_amount: '91500',
    paid_at: null,
  },
];

type TabFilter = 'all' | PaymentStatus;

const DEV_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидание', value: 'pending' },
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

function getInfoMessage(payment: DeveloperPayment): { text: string; color: string } | null {
  if (payment.status === 'pending') {
    return { text: 'Выплата ожидает обработки администратором платформы.', color: 'text-amber-600' };
  }
  return null;
}

function DeveloperPaymentCard({ payment }: { payment: DeveloperPayment }) {
  const badge = getStatusBadge(payment.status);
  const info = getInfoMessage(payment);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{payment.property_name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Аукцион #{payment.auction_id} · Сделка подтверждена {formatDateShort(payment.deal_confirmed_at)}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Broker info */}
      <div className="flex items-center gap-3 mt-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
          {payment.broker.initials}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{payment.broker.first_name} {payment.broker.last_name}</p>
          <p className="text-xs text-gray-500">{payment.broker.company_name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Стоимость объекта</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(payment.property_price)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Моя ставка комиссии</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.commission_rate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{payment.status === 'paid' ? 'Сумма выплаты' : 'Сумма к выплате'}</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(payment.payment_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Дата выплаты</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.paid_at ? formatDateShort(payment.paid_at) : '—'}</p>
        </div>
      </div>

      {/* Info message */}
      {info && (
        <div className="flex items-start gap-2 mt-4">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-500" />
          <p className={cn('text-xs', info.color)}>{info.text}</p>
        </div>
      )}
    </div>
  );
}

export function DeveloperPaymentsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const summary = MOCK_SUMMARY;
  const payments = MOCK_PAYMENTS;
  const filtered = activeTab === 'all' ? payments : payments.filter((p) => p.status === activeTab);

  const summaryCards = [
    { label: 'Всего к выплате', value: summary.total_to_pay, color: 'text-gray-900' },
    { label: 'Выплачено', value: summary.paid, color: 'text-emerald-600' },
    { label: 'Ожидает выплаты', value: summary.pending, color: 'text-red-600' },
  ];

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Мои выплаты брокерам</h1>
          <p className="text-sm text-gray-500 mt-0.5">Комиссии по подтверждённым сделкам (ставка задаётся при создании объекта)</p>
        </div>

        {/* Summary KPI */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={cn('text-2xl font-bold tracking-tight mt-1', card.color)}>{formatPrice(card.value)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {DEV_TABS.map((tab) => {
            const count = tab.value === 'all' ? payments.length : payments.filter((p) => p.status === tab.value).length;
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
              <p className="text-sm font-medium text-gray-900">Нет выплат</p>
              <p className="text-xs text-gray-400 mt-1">Выплаты появятся после подтверждения сделок</p>
            </div>
          ) : (
            filtered.map((payment) => <DeveloperPaymentCard key={payment.id} payment={payment} />)
          )}
        </div>
      </div>
    </div>
  );
}
