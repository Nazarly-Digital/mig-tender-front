'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  File01Icon,
  CheckmarkCircle02Icon,
  Tick01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/formatters';
import {
  useSettlements,
  useSettlementSummary,
  useMarkPaidToBroker,
  useConfirmDeveloperReceipt,
} from '@/features/payments';
import type { Settlement } from '@/shared/types/payments';

type StatusFilter = 'all' | 'awaiting_broker_payout' | 'awaiting_developer_payment' | 'closed';

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Нужно выплатить брокеру', value: 'awaiting_broker_payout' },
  { label: 'Ждём девелопера', value: 'awaiting_developer_payment' },
  { label: 'Закрыто', value: 'closed' },
];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function StepIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <span className='inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 shrink-0 mt-0.5'>
        <HugeiconsIcon icon={Tick01Icon} size={12} color='currentColor' strokeWidth={2.5} className='text-emerald-600' />
      </span>
    );
  }
  return (
    <span className='inline-flex size-5 items-center justify-center rounded-full bg-red-100 shrink-0 mt-0.5'>
      <HugeiconsIcon icon={Cancel01Icon} size={12} color='currentColor' strokeWidth={2.5} className='text-red-500' />
    </span>
  );
}

function AdminSettlementCard({ s }: { s: Settlement }) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const markPaid = useMarkPaidToBroker();
  const confirmRecv = useConfirmDeveloperReceipt();

  const handlePickFile = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Максимальный размер файла — 10 МБ');
      return;
    }
    markPaid.mutate({ settlementId: s.id, file });
  };

  const handleConfirm = () => {
    if (!s.developer_receipt) {
      toast.error('Девелопер ещё не загрузил чек');
      return;
    }
    confirmRecv.mutate(s.id);
  };

  const totalRate = (parseFloat(s.broker_rate || '0') + parseFloat(s.platform_rate || '0')).toFixed(2);

  const statusBadge = s.is_financially_closed ? (
    <span className='shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'>
      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color='currentColor' strokeWidth={2} />
      Закрыта
    </span>
  ) : !s.paid_to_broker ? (
    <span className='shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'>
      Ожидает выплаты
    </span>
  ) : !s.received_from_developer ? (
    <span className='shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700'>
      {s.developer_receipt ? 'Ожидает подтверждения' : 'Ожидает от девелопера'}
    </span>
  ) : null;

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='px-5 py-4 flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h3 className='text-sm font-semibold text-gray-900'>
            Аукцион #{s.auction_id} · Сделка #{s.deal_id}
          </h3>
          <p className='text-xs text-gray-500 mt-0.5 truncate'>{s.property_name}</p>
          <p className='text-[11px] text-gray-400 mt-0.5 truncate'>
            {s.broker_name} → {s.developer_name}
          </p>
        </div>
        {statusBadge}
      </div>

      <div className='border-t border-gray-100' />

      {/* Сумма сделки */}
      <div className='px-5 py-3 flex items-center justify-between'>
        <p className='text-sm text-gray-500'>Сумма сделки</p>
        <p className='text-sm font-medium text-gray-900'>{formatPrice(s.deal_amount)}</p>
      </div>

      <div className='border-t border-gray-100' />

      {/* Steps */}
      <div className='px-5 py-4 space-y-3'>
        {/* Step 1 — Выплата брокеру */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-2 min-w-0 flex-1'>
            <StepIcon done={s.paid_to_broker} />
            <div className='min-w-0'>
              <p className='text-sm font-medium text-gray-900'>Выплата брокеру</p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {formatPrice(s.broker_amount)} ({s.broker_rate}%)
              </p>
              {s.paid_to_broker ? (
                <p className='text-[11px] text-gray-400 mt-0.5'>
                  Выплачено {formatDate(s.paid_to_broker_at)}
                </p>
              ) : (
                <p className={cn('text-[11px] mt-0.5', s.broker_payout_overdue ? 'text-red-600' : 'text-gray-400')}>
                  Дедлайн: {formatDate(s.broker_payout_deadline)}
                  {s.broker_payout_overdue && ' · просрочено'}
                </p>
              )}
            </div>
          </div>
          <div className='shrink-0'>
            {!s.paid_to_broker ? (
              <>
                <input ref={fileRef} type='file' accept='image/*,.pdf' className='hidden' onChange={handleFile} />
                <button
                  type='button'
                  onClick={handlePickFile}
                  disabled={markPaid.isPending}
                  className='bg-blue-600 text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {markPaid.isPending ? 'Загрузка...' : 'Загрузить чек'}
                </button>
              </>
            ) : s.broker_payout_receipt ? (
              <a
                href={s.broker_payout_receipt}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700'
              >
                <HugeiconsIcon icon={File01Icon} size={12} color='currentColor' strokeWidth={1.5} />
                Чек
              </a>
            ) : null}
          </div>
        </div>

        {/* Step 2 — Получено от девелопера */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-2 min-w-0 flex-1'>
            <StepIcon done={s.received_from_developer} />
            <div className='min-w-0'>
              <p className='text-sm font-medium text-gray-900'>Получено от девелопера</p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {formatPrice(s.total_from_developer)} ({totalRate}%)
              </p>
              {s.received_from_developer ? (
                <p className='text-[11px] text-gray-400 mt-0.5'>
                  Подтверждено {formatDate(s.received_from_developer_at)}
                </p>
              ) : s.developer_receipt ? (
                <p className='text-[11px] text-gray-400 mt-0.5'>
                  Чек загружен {formatDate(s.developer_receipt_uploaded_at)}
                </p>
              ) : s.paid_to_broker ? (
                <p className={cn('text-[11px] mt-0.5', s.developer_payment_overdue ? 'text-red-600' : 'text-gray-400')}>
                  Дедлайн: {formatDate(s.developer_payment_deadline)}
                  {s.developer_payment_overdue && ' · просрочено'}
                </p>
              ) : null}
            </div>
          </div>
          <div className='shrink-0 text-right'>
            {!s.paid_to_broker ? (
              <span className='text-xs text-gray-400'>после выплаты</span>
            ) : !s.received_from_developer && s.developer_receipt ? (
              <button
                type='button'
                onClick={handleConfirm}
                disabled={confirmRecv.isPending}
                className='bg-blue-600 text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {confirmRecv.isPending ? 'Подтверждение...' : 'Подтвердить'}
              </button>
            ) : s.developer_receipt ? (
              <a
                href={s.developer_receipt}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700'
              >
                <HugeiconsIcon icon={File01Icon} size={12} color='currentColor' strokeWidth={1.5} />
                Чек
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className='border-t border-gray-100' />

      {/* Доход платформы */}
      <div className='px-5 py-3 flex items-center justify-between'>
        <p className='text-sm font-semibold text-gray-900'>Доход платформы ({s.platform_rate}%)</p>
        <p className='text-base font-bold text-emerald-600'>{formatPrice(s.platform_amount)}</p>
      </div>
    </div>
  );
}

export function AdminPaymentsView() {
  const [filter, setFilter] = React.useState<StatusFilter>('all');
  const { data: sum } = useSettlementSummary();
  const { data, isLoading } = useSettlements();
  const all = data ?? [];

  const filtered = all.filter((s) => {
    switch (filter) {
      case 'awaiting_broker_payout':
        return !s.paid_to_broker;
      case 'awaiting_developer_payment':
        return !s.received_from_developer;
      case 'closed':
        return s.is_financially_closed;
      default:
        return true;
    }
  });

  const toPayBrokers = all
    .filter((s) => !s.paid_to_broker)
    .reduce((acc, s) => acc + parseFloat(s.broker_amount || '0'), 0);
  const paidToBrokers = parseFloat(sum?.total_paid_to_brokers ?? '0');

  const awaitingFromDevelopers = all
    .filter((s) => !s.received_from_developer)
    .reduce((acc, s) => acc + parseFloat(s.total_from_developer || '0'), 0);
  const receivedFromDevelopers = parseFloat(sum?.total_received_from_developers ?? '0');

  const platformIncome = all
    .filter((s) => s.received_from_developer)
    .reduce((acc, s) => acc + parseFloat(s.platform_amount || '0'), 0);

  const kpiCards: {
    label: string;
    value: number;
    secondary?: { label: string; value: number };
    valueColor: string;
  }[] = [
    {
      label: 'К выплате брокерам',
      value: toPayBrokers,
      secondary: { label: 'Выплачено', value: paidToBrokers },
      valueColor: 'text-red-500',
    },
    {
      label: 'Ожидаем от девелоперов',
      value: awaitingFromDevelopers,
      secondary: { label: 'Получено', value: receivedFromDevelopers },
      valueColor: 'text-amber-500',
    },
    {
      label: 'Доход платформы',
      value: platformIncome,
      valueColor: 'text-emerald-500',
    },
  ];

  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-lg font-semibold text-gray-900'>Выплаты (админ)</h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          Транзитная модель: платформа выплачивает брокеру за 3 дня, затем получает от девелопера до 6 месяцев.
        </p>
      </div>

      <div className='mt-5 flex flex-wrap gap-4'>
        {kpiCards.map((c) => (
          <div
            key={c.label}
            className='bg-white rounded-xl border border-gray-200 p-5 w-full max-w-full lg:w-auto md:flex-1 lg:min-w-[225px] lg:max-w-[300px]'
          >
            <p className='text-xs text-gray-500'>{c.label}</p>
            <p className={cn('text-xl font-bold tracking-tight mt-1', c.valueColor)}>
              {formatPrice(String(c.value))}
            </p>
            {c.secondary && (
              <p className='text-xs text-gray-500 mt-1'>
                {c.secondary.label}: {formatPrice(String(c.secondary.value))}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className='flex items-center gap-0 border-b border-gray-200 mt-5'>
        {FILTERS.map((t) => (
          <button
            key={t.value}
            type='button'
            onClick={() => setFilter(t.value)}
            className={cn(
              'px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors border-b-2 -mb-px',
              filter === t.value ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className='mt-6'>
        {isLoading ? (
          <div className='flex justify-center py-16'>
            <p className='text-sm text-gray-400'>Загрузка...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <p className='text-sm font-medium text-gray-900'>Пусто</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start'>
            {filtered.map((s) => <AdminSettlementCard key={s.id} s={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
