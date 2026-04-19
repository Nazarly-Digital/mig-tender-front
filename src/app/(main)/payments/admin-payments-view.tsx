'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  File01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  AlertCircleIcon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/formatters';
import * as FancyButton from '@/shared/ui/fancy-button';
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

  return (
    <div className={cn(
      'bg-white rounded-xl border p-5',
      s.is_financially_closed ? 'border-emerald-200' : 'border-gray-200',
    )}>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900'>{s.property_name}</h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            Аукцион #{s.auction_id} · Сделка #{s.deal_id} · Девелопер: {s.developer_name} · Брокер: {s.broker_name}
          </p>
        </div>
        {s.is_financially_closed && (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color='currentColor' strokeWidth={2} />
            Финансово закрыто
          </span>
        )}
      </div>

      <div className='grid grid-cols-4 gap-4 mt-4'>
        <div>
          <p className='text-xs text-gray-500'>Сумма сделки</p>
          <p className='text-sm font-semibold text-gray-900 mt-0.5'>{formatPrice(s.deal_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Брокеру ({s.broker_rate}%)</p>
          <p className='text-sm font-medium text-gray-900 mt-0.5'>{formatPrice(s.broker_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Платформе ({s.platform_rate}%)</p>
          <p className='text-sm font-medium text-gray-900 mt-0.5'>{formatPrice(s.platform_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Всего с девелопера</p>
          <p className='text-sm font-bold text-blue-700 mt-0.5'>{formatPrice(s.total_from_developer)}</p>
        </div>
      </div>

      {/* Step 1 — pay broker */}
      <div className={cn(
        'mt-4 rounded-lg border p-3',
        s.paid_to_broker ? 'bg-emerald-50/50 border-emerald-200' : s.broker_payout_overdue ? 'bg-red-50/50 border-red-200' : 'bg-amber-50/50 border-amber-200',
      )}>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              {s.paid_to_broker ? (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color='currentColor' strokeWidth={2} className='text-emerald-600' />
              ) : s.broker_payout_overdue ? (
                <HugeiconsIcon icon={AlertCircleIcon} size={14} color='currentColor' strokeWidth={2} className='text-red-600' />
              ) : (
                <HugeiconsIcon icon={Clock01Icon} size={14} color='currentColor' strokeWidth={2} className='text-amber-600' />
              )}
              <p className='text-sm font-semibold text-gray-900'>
                1. Платформа → брокеру ({formatPrice(s.broker_amount)})
              </p>
            </div>
            <p className='text-xs text-gray-600 mt-0.5'>
              {s.paid_to_broker
                ? `Выплачено ${formatDate(s.paid_to_broker_at)}`
                : `Дедлайн: ${formatDate(s.broker_payout_deadline)}${s.broker_payout_overdue ? ' (просрочено!)' : ''}`}
            </p>
          </div>
          {!s.paid_to_broker && (
            <div>
              <input ref={fileRef} type='file' accept='image/*,.pdf' className='hidden' onChange={handleFile} />
              <FancyButton.Root variant='primary' size='small' onClick={handlePickFile} disabled={markPaid.isPending}>
                <HugeiconsIcon icon={Upload01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                {markPaid.isPending ? 'Загрузка...' : 'Выплатил (с чеком)'}
              </FancyButton.Root>
            </div>
          )}
        </div>
        {s.broker_payout_receipt && (
          <a
            href={s.broker_payout_receipt}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700'
          >
            <HugeiconsIcon icon={File01Icon} size={12} color='currentColor' strokeWidth={1.5} />
            Чек выплаты брокеру
          </a>
        )}
      </div>

      {/* Step 2 — receive from developer */}
      <div className={cn(
        'mt-3 rounded-lg border p-3',
        s.received_from_developer ? 'bg-emerald-50/50 border-emerald-200' : s.developer_payment_overdue ? 'bg-red-50/50 border-red-200' : 'bg-amber-50/50 border-amber-200',
      )}>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              {s.received_from_developer ? (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color='currentColor' strokeWidth={2} className='text-emerald-600' />
              ) : s.developer_payment_overdue ? (
                <HugeiconsIcon icon={AlertCircleIcon} size={14} color='currentColor' strokeWidth={2} className='text-red-600' />
              ) : (
                <HugeiconsIcon icon={Clock01Icon} size={14} color='currentColor' strokeWidth={2} className='text-amber-600' />
              )}
              <p className='text-sm font-semibold text-gray-900'>
                2. Девелопер → платформе ({formatPrice(s.total_from_developer)})
              </p>
            </div>
            <p className='text-xs text-gray-600 mt-0.5'>
              {s.received_from_developer
                ? `Подтверждено ${formatDate(s.received_from_developer_at)}`
                : s.developer_receipt
                  ? `Чек загружен ${formatDate(s.developer_receipt_uploaded_at)} — требуется подтверждение`
                  : `Ожидаем чек от девелопера. Дедлайн: ${formatDate(s.developer_payment_deadline)}`}
            </p>
          </div>
          {!s.received_from_developer && s.developer_receipt && (
            <FancyButton.Root variant='primary' size='small' onClick={handleConfirm} disabled={confirmRecv.isPending}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color='currentColor' strokeWidth={1.5} />
              {confirmRecv.isPending ? 'Подтверждение...' : 'Подтвердить поступление'}
            </FancyButton.Root>
          )}
        </div>
        {s.developer_receipt && (
          <a
            href={s.developer_receipt}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700'
          >
            <HugeiconsIcon icon={File01Icon} size={12} color='currentColor' strokeWidth={1.5} />
            Чек от девелопера
          </a>
        )}
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

  const cards = [
    { label: 'Всего расчётов', value: String(sum?.total_settlements ?? 0), color: 'text-gray-900', raw: true },
    { label: 'Долг девелоперов', value: sum?.total_owed_by_developers ?? '0', color: 'text-amber-600', raw: false },
    { label: 'Выплачено брокерам', value: sum?.total_paid_to_brokers ?? '0', color: 'text-blue-600', raw: false },
    { label: 'Получено от девелоперов', value: sum?.total_received_from_developers ?? '0', color: 'text-emerald-600', raw: false },
  ];

  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-lg font-semibold text-gray-900'>Выплаты (админ)</h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          Транзитная модель: платформа выплачивает брокеру за 3 дня, затем получает от девелопера до 6 месяцев.
        </p>
      </div>

      <div className='grid grid-cols-4 gap-4 mt-5'>
        {cards.map((c) => (
          <div key={c.label} className='bg-gray-50 rounded-xl border border-gray-200 p-4'>
            <p className='text-xs text-gray-500'>{c.label}</p>
            <p className={cn('text-2xl font-bold tracking-tight mt-1', c.color)}>
              {c.raw ? c.value : `${formatPrice(c.value)}`}
            </p>
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

      <div className='space-y-4 mt-6'>
        {isLoading ? (
          <div className='flex justify-center py-16'>
            <p className='text-sm text-gray-400'>Загрузка...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <p className='text-sm font-medium text-gray-900'>Пусто</p>
          </div>
        ) : (
          filtered.map((s) => <AdminSettlementCard key={s.id} s={s} />)
        )}
      </div>
    </div>
  );
}
