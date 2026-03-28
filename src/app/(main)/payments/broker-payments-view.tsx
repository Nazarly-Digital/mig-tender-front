'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/formatters';
import { PaymentProgressBar } from './payment-progress-bar';
import { usePayments, usePaymentSummary } from '@/features/payments';
import type { Payment, PaymentStatus, BrokerPaymentSummary } from '@/shared/types/payments';

type TabFilter = 'all' | PaymentStatus;

const BROKER_TABS: { label: string; value: TabFilter }[] = [
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

function BrokerPaymentCard({ payment }: { payment: Payment }) {
  const badge = getStatusBadge(payment.status);
  const typeLabel = payment.type === 'developer_commission'
    ? 'Комиссия от девелопера'
    : 'Комиссия от платформы';
  const typeColor = payment.type === 'developer_commission'
    ? 'text-amber-700'
    : 'text-blue-700';

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

      <div className="grid grid-cols-4 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Тип</p>
          <p className={cn('text-sm font-semibold mt-0.5', typeColor)}>{typeLabel}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ставка</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{payment.rate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Сумма</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(payment.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Чек</p>
          {payment.receipt_document ? (
            <a
              href={payment.receipt_document}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-0.5"
            >
              <HugeiconsIcon icon={File01Icon} size={14} color="currentColor" strokeWidth={1.5} />
              Чек.pdf
            </a>
          ) : (
            <p className="text-sm text-gray-400 mt-0.5">—</p>
          )}
        </div>
      </div>

      <PaymentProgressBar currentStep={payment.status} />
    </div>
  );
}

export function BrokerPaymentsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const { data: summaryData } = usePaymentSummary();
  const summary = summaryData as BrokerPaymentSummary | undefined;

  const { data, isLoading } = usePayments(
    activeTab === 'all' ? undefined : { status: activeTab as PaymentStatus }
  );
  const payments = data?.results ?? [];

  const summaryCards = summary ? [
    { label: 'Всего начислено', value: summary.total, color: 'text-gray-900' },
    { label: 'От девелоперов', value: summary.from_developers, color: 'text-amber-600' },
    { label: 'От платформы', value: summary.from_platform, color: 'text-blue-600' },
    { label: 'В ожидании', value: summary.pending, color: 'text-red-600' },
  ] : [];

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Мои выплаты</h1>
          <p className="text-sm text-gray-500 mt-0.5">Комиссия от девелопера + комиссия платформы (0.8%) после закрытия сделки</p>
        </div>

        {/* Summary KPI */}
        {summaryCards.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-5">
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
          {isLoading ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-gray-400">Загрузка...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-900">Нет выплат</p>
              <p className="text-xs text-gray-400 mt-1">Выплаты появятся после закрытия сделок</p>
            </div>
          ) : (
            payments.map((payment) => <BrokerPaymentCard key={payment.id} payment={payment} />)
          )}
        </div>
      </div>
    </div>
  );
}
