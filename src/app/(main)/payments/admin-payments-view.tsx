'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, Upload04Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/formatters';
import { PaymentProgressBar } from './payment-progress-bar';
import { usePayments, usePaymentSummary, useUploadReceipt } from '@/features/payments';
import type { Payment, PaymentStatus, BrokerPaymentSummary } from '@/shared/types/payments';

type TabFilter = 'all' | PaymentStatus;

const ADMIN_TABS: { label: string; value: TabFilter }[] = [
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

function AdminPaymentCard({ payment }: { payment: Payment }) {
  const badge = getStatusBadge(payment.status);
  const uploadReceipt = useUploadReceipt();
  const typeLabel = payment.type === 'developer_commission'
    ? 'Комиссия от девелопера'
    : 'Комиссия от платформы';
  const typeColor = payment.type === 'developer_commission'
    ? 'text-amber-700'
    : 'text-blue-700';

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadReceipt.mutate({ paymentId: payment.id, file });
  };

  return (
    <div className={cn(
      'bg-white rounded-xl border p-5',
      payment.status === 'pending' ? 'border-amber-200' : 'border-gray-200',
    )}>
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

      {/* Upload receipt — only for pending platform commission payments */}
      {payment.status === 'pending' && payment.type === 'platform_commission' && (
        <div className="mt-4">
          <label className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
            uploadReceipt.isPending
              ? "text-gray-400 bg-gray-50 border border-gray-200"
              : "text-white bg-primary-base",
          )}>
            <HugeiconsIcon icon={Upload04Icon} size={16} color="currentColor" strokeWidth={1.5} />
            {uploadReceipt.isPending ? 'Загрузка...' : 'Загрузить чек и подтвердить выплату'}
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" disabled={uploadReceipt.isPending} />
          </label>
        </div>
      )}
    </div>
  );
}

export function AdminPaymentsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const { data: summaryData } = usePaymentSummary();
  const summary = summaryData as BrokerPaymentSummary | undefined;

  const { data, isLoading } = usePayments(
    activeTab === 'all' ? undefined : { status: activeTab as PaymentStatus }
  );
  const payments = data ?? [];

  const allPayments = data ?? [];
  const pendingCount = allPayments.filter((p) => p.status === 'pending').length;
  const paidCount = allPayments.filter((p) => p.status === 'paid').length;

  const kpis = summary ? [
    { label: 'Всего выплат', value: formatPrice(summary.total), color: 'text-gray-900' },
    { label: 'К выплате', value: formatPrice(summary.pending), color: 'text-amber-600' },
    { label: 'Выплачено', value: formatPrice(summary.paid), color: 'text-emerald-600' },
    { label: 'Ожидают чека', value: String(pendingCount), color: 'text-red-600', raw: true },
  ] : [];

  return (
    <div className="w-full px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Админ-панель · Выплаты</h1>
          <p className="text-sm text-gray-500 mt-0.5">Загрузка чеков, подтверждение выплат брокерам</p>
        </div>

        {/* KPI */}
        {kpis.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-5">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className={cn('text-2xl font-bold tracking-tight mt-1', kpi.color)}>
                  {'raw' in kpi ? kpi.value : kpi.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors',
                activeTab === tab.value
                  ? 'bg-primary-base text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 cursor-pointer',
              )}
            >
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
              {tab.value === 'paid' && paidCount > 0 ? ` (${paidCount})` : ''}
            </button>
          ))}
        </div>

        {/* Cards grouped by auction */}
        <div className="space-y-6 mt-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-gray-400">Загрузка...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-900">Нет выплат</p>
              <p className="text-xs text-gray-400 mt-1">Выплаты появятся после подтверждения сделок</p>
            </div>
          ) : (() => {
            // Group by auction_id
            const grouped = new Map<number, Payment[]>();
            for (const p of payments) {
              const arr = grouped.get(p.auction_id) ?? [];
              arr.push(p);
              grouped.set(p.auction_id, arr);
            }
            return Array.from(grouped.entries()).map(([auctionId, group]) => {
              const brokerTotal = group
                .filter((p) => p.type === 'developer_commission')
                .reduce((sum, p) => sum + Number(p.amount), 0);
              const platformTotal = group
                .filter((p) => p.type === 'platform_commission')
                .reduce((sum, p) => sum + Number(p.amount), 0);
              return (
                <div key={auctionId}>
                  {/* Auction group header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Аукцион #{auctionId}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Брокерам: <span className="font-semibold text-gray-700">{formatPrice(String(brokerTotal.toFixed(2)))}</span></span>
                      <span>Платформе: <span className="font-semibold text-gray-700">{formatPrice(String(platformTotal.toFixed(2)))}</span></span>
                      <span>Итого: <span className="font-semibold text-gray-900">{formatPrice(String((brokerTotal + platformTotal).toFixed(2)))}</span></span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {group.map((payment) => <AdminPaymentCard key={payment.id} payment={payment} />)}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
