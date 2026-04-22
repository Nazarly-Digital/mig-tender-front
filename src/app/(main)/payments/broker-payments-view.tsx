'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, CheckmarkCircle02Icon, Clock01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/formatters';
import { useSettlements } from '@/features/payments';
import type { Settlement } from '@/shared/types/payments';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function BrokerSettlementCard({ s }: { s: Settlement }) {
  const isPaid = s.paid_to_broker;
  const isOverdue = s.broker_payout_overdue && !isPaid;

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 px-5'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4 py-4'>
        <div className='min-w-0'>
          <p className='text-xs text-gray-500'>Аукцион #{s.auction_id} · Сделка #{s.deal_id}</p>
          <h3 className='text-sm font-semibold text-gray-900 mt-0.5 truncate'>{s.property_name}</h3>
        </div>
        {isPaid ? (
          <span className='shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color='currentColor' strokeWidth={2} />
            Выплачено
          </span>
        ) : isOverdue ? (
          <span className='shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'>
            <HugeiconsIcon icon={AlertCircleIcon} size={12} color='currentColor' strokeWidth={2} />
            Просрочено
          </span>
        ) : (
          <span className='shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'>
            <HugeiconsIcon icon={Clock01Icon} size={12} color='currentColor' strokeWidth={2} />
            Ожидает выплаты
          </span>
        )}
      </div>

      {/* Rows */}
      <div>
        <div className='flex items-center justify-between py-3'>
          <p className='text-xs text-gray-500'>Сумма сделки</p>
          <p className='text-sm font-semibold text-gray-900'>{formatPrice(s.deal_amount)}</p>
        </div>
        <div className='flex items-center justify-between py-3'>
          <p className='text-xs text-gray-500'>Ваша комиссия ({s.broker_rate}%)</p>
          <p className='text-sm font-bold text-emerald-700'>{formatPrice(s.broker_amount)}</p>
        </div>
        <div className='flex items-center justify-between py-3'>
          <p className='text-xs text-gray-500'>Дедлайн выплаты</p>
          <p className={cn('text-sm font-medium', isOverdue ? 'text-red-600' : 'text-gray-900')}>
            {formatDate(s.broker_payout_deadline)}
          </p>
        </div>
        {isPaid && (
          <div className='flex items-center justify-between py-3'>
            <p className='text-xs text-gray-500'>Дата выплаты</p>
            <p className='text-sm font-medium text-gray-900'>{formatDate(s.paid_to_broker_at)}</p>
          </div>
        )}
      </div>

      {s.broker_payout_receipt && (
        <div className='py-4'>
          <div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2'>
            <HugeiconsIcon icon={File01Icon} size={14} color='currentColor' strokeWidth={1.5} className='text-gray-500' />
            <span className='text-xs text-gray-600'>Чек платформы</span>
            <a
              href={s.broker_payout_receipt}
              target='_blank'
              rel='noopener noreferrer'
              className='ml-auto text-xs font-medium text-blue-600 hover:text-blue-700'
            >
              Скачать
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function BrokerPaymentsView() {
  const { data, isLoading } = useSettlements();
  const settlements = data ?? [];

  const total = settlements.reduce((acc, s) => acc + parseFloat(s.broker_amount || '0'), 0);
  const paid = settlements.filter((s) => s.paid_to_broker).reduce((acc, s) => acc + parseFloat(s.broker_amount || '0'), 0);
  const pending = total - paid;

  const cards = [
    {
      label: 'Ожидает выплаты',
      value: String(pending),
      valueColor: 'text-amber-600',
    },
    {
      label: 'Выплачено',
      value: String(paid),
      valueColor: 'text-emerald-600',
    },
  ];

  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-lg font-semibold text-gray-900'>Мои выплаты</h1>
        <p className='text-sm text-gray-500 mt-0.5'>Платформа выплачивает вам комиссию в течение 3 дней после подтверждения сделки</p>
      </div>

      {/* Summary */}
      <div className='mt-6 flex flex-wrap gap-4'>
        {cards.map((c) => (
          <div
            key={c.label}
            className='bg-white rounded-xl border border-gray-200 p-4 w-full max-w-full lg:w-auto md:flex-1 lg:min-w-[225px] lg:max-w-[300px]'
          >
            <p className='text-xs text-gray-500'>{c.label}</p>
            <p className={cn('text-xl font-bold tracking-tight mt-1', c.valueColor)}>
              {formatPrice(c.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Settlements list — 2-column grid */}
      <div className='mt-6'>
        {isLoading ? (
          <div className='flex justify-center py-16'>
            <p className='text-sm text-gray-400'>Загрузка...</p>
          </div>
        ) : settlements.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <p className='text-sm font-medium text-gray-900'>Нет выплат</p>
            <p className='text-xs text-gray-400 mt-1'>Выплаты появятся после подтверждения сделок</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4'>
            {settlements.map((s) => <BrokerSettlementCard key={s.id} s={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
