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
    <div className='bg-white rounded-xl border border-gray-200 p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900'>{s.property_name}</h3>
          <p className='text-xs text-gray-500 mt-0.5'>Аукцион #{s.auction_id} · Сделка #{s.deal_id}</p>
        </div>
        {isPaid ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color='currentColor' strokeWidth={2} />
            Выплачено
          </span>
        ) : isOverdue ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'>
            <HugeiconsIcon icon={AlertCircleIcon} size={12} color='currentColor' strokeWidth={2} />
            Просрочено
          </span>
        ) : (
          <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'>
            <HugeiconsIcon icon={Clock01Icon} size={12} color='currentColor' strokeWidth={2} />
            Ожидание
          </span>
        )}
      </div>

      <div className='grid grid-cols-4 gap-4 mt-4'>
        <div>
          <p className='text-xs text-gray-500'>Сумма сделки</p>
          <p className='text-sm font-semibold text-gray-900 mt-0.5'>{formatPrice(s.deal_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>К выплате ({s.broker_rate}%)</p>
          <p className='text-sm font-bold text-emerald-700 mt-0.5'>{formatPrice(s.broker_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Дедлайн платформы</p>
          <p className='text-sm font-medium text-gray-900 mt-0.5'>{formatDate(s.broker_payout_deadline)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Дата выплаты</p>
          <p className='text-sm font-medium text-gray-900 mt-0.5'>{formatDate(s.paid_to_broker_at)}</p>
        </div>
      </div>

      {s.broker_payout_receipt && (
        <div className='mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2'>
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
    { label: 'Всего заработано', value: String(total), color: 'text-gray-900' },
    { label: 'Выплачено', value: String(paid), color: 'text-emerald-600' },
    { label: 'В ожидании', value: String(pending), color: 'text-amber-600' },
    { label: 'Сделок', value: String(settlements.length), color: 'text-blue-600' },
  ];

  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-lg font-semibold text-gray-900'>Мои выплаты</h1>
        <p className='text-sm text-gray-500 mt-0.5'>Платформа выплачивает вам комиссию в течение 3 дней после подтверждения сделки</p>
      </div>

      <div className='grid grid-cols-4 gap-4 mt-5'>
        {cards.map((c) => (
          <div key={c.label} className='bg-gray-50 rounded-xl border border-gray-200 p-4'>
            <p className='text-xs text-gray-500'>{c.label}</p>
            <p className={cn('text-2xl font-bold tracking-tight mt-1', c.color)}>
              {c.label === 'Сделок' ? c.value : `${formatPrice(c.value)}`}
            </p>
          </div>
        ))}
      </div>

      <div className='space-y-4 mt-6'>
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
          settlements.map((s) => <BrokerSettlementCard key={s.id} s={s} />)
        )}
      </div>
    </div>
  );
}
