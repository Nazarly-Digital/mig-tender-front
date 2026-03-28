'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { usePayments, usePaymentSummary } from '@/features/payments';
import type { Payment, PaymentStatus, DeveloperPaymentSummary } from '@/shared/types/payments';

type TabFilter = 'all' | PaymentStatus;

const DEV_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидание', value: 'pending' },
  { label: 'Выплачена', value: 'paid' },
];

function getStatusBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    pending: { label: 'Ожидание', className: 'bg-amber-50 text-amber-700' },
    paid: { label: 'Выплачена', className: 'bg-emerald-50 text-emerald-700' },
  };
  return map[status];
}

function DeveloperPaymentCard({ payment }: { payment: Payment }) {
  const badge = getStatusBadge(payment.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{payment.property_name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Аукцион #{payment.auction_id}</p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Ставка комиссии</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.rate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Сумма выплаты</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(payment.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Дата</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {payment.status === 'paid' ? formatDateShort(payment.updated_at) : '—'}
          </p>
        </div>
      </div>

      {payment.status === 'pending' && (
        <div className="flex items-start gap-2 mt-4">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-xs text-amber-600">Выплата ожидает обработки администратором платформы.</p>
        </div>
      )}
    </div>
  );
}

export function DeveloperPaymentsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const { data: summaryData } = usePaymentSummary();
  const summary = summaryData as DeveloperPaymentSummary | undefined;

  const { data, isLoading } = usePayments(
    activeTab === 'all' ? undefined : { status: activeTab as PaymentStatus }
  );
  const payments = data?.results ?? [];

  const summaryCards = summary ? [
    { label: 'Всего к выплате', value: summary.total_to_pay, color: 'text-gray-900' },
    { label: 'Выплачено', value: summary.paid, color: 'text-emerald-600' },
    { label: 'Ожидает выплаты', value: summary.pending, color: 'text-red-600' },
  ] : [];

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Мои выплаты брокерам</h1>
          <p className="text-sm text-gray-500 mt-0.5">Комиссии по подтверждённым сделкам (ставка задаётся при создании объекта)</p>
        </div>

        {/* Summary KPI */}
        {summaryCards.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-5">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={cn('text-2xl font-bold tracking-tight mt-1', card.color)}>{formatPrice(card.value)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {DEV_TABS.map((tab) => (
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
          {isLoading ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-gray-400">Загрузка...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-900">Нет выплат</p>
              <p className="text-xs text-gray-400 mt-1">Выплаты появятся после подтверждения сделок</p>
            </div>
          ) : (
            payments.map((payment) => <DeveloperPaymentCard key={payment.id} payment={payment} />)
          )}
        </div>
      </div>
    </div>
  );
}
