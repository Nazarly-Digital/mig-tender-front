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
import { useSettlements, useUploadDeveloperReceipt } from '@/features/payments';
import type { Settlement } from '@/shared/types/payments';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function DeveloperSettlementCard({ s }: { s: Settlement }) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const upload = useUploadDeveloperReceipt();

  const isPaid = s.received_from_developer;
  const isOverdue = s.developer_payment_overdue && !isPaid;
  const hasUploaded = !!s.developer_receipt;

  const handlePickFile = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Максимальный размер файла — 10 МБ');
      return;
    }
    upload.mutate({ settlementId: s.id, file });
  };

  const total = parseFloat(s.total_from_developer || '0');
  const brokerPct = s.broker_rate;
  const platformPct = s.platform_rate;
  const totalPct = (parseFloat(brokerPct) + parseFloat(platformPct)).toFixed(2);

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
            Оплачено
          </span>
        ) : hasUploaded ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700'>
            <HugeiconsIcon icon={Clock01Icon} size={12} color='currentColor' strokeWidth={2} />
            На проверке
          </span>
        ) : isOverdue ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'>
            <HugeiconsIcon icon={AlertCircleIcon} size={12} color='currentColor' strokeWidth={2} />
            Просрочено
          </span>
        ) : (
          <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'>
            <HugeiconsIcon icon={Clock01Icon} size={12} color='currentColor' strokeWidth={2} />
            Ожидает оплаты
          </span>
        )}
      </div>

      <div className='grid grid-cols-4 gap-4 mt-4'>
        <div>
          <p className='text-xs text-gray-500'>Сумма сделки</p>
          <p className='text-sm font-semibold text-gray-900 mt-0.5'>{formatPrice(s.deal_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Брокеру ({brokerPct}%)</p>
          <p className='text-sm font-medium text-gray-900 mt-0.5'>{formatPrice(s.broker_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Платформе ({platformPct}%)</p>
          <p className='text-sm font-medium text-gray-900 mt-0.5'>{formatPrice(s.platform_amount)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Срок оплаты</p>
          <p className={cn('text-sm font-medium mt-0.5', isOverdue ? 'text-red-600' : 'text-gray-900')}>
            {formatDate(s.developer_payment_deadline)}
          </p>
        </div>
      </div>

      <div className='mt-4 rounded-lg bg-blue-50/60 border border-blue-100 p-3 flex items-center justify-between'>
        <div>
          <p className='text-[11px] uppercase font-semibold tracking-wider text-blue-900/70'>
            К оплате одной транзакцией ({totalPct}%)
          </p>
          <p className='text-xl font-bold text-blue-700 mt-0.5'>{formatPrice(String(total))}</p>
        </div>
        {!isPaid && (
          <div>
            <input ref={fileRef} type='file' accept='image/*,.pdf' className='hidden' onChange={handleFile} />
            <FancyButton.Root
              variant={hasUploaded ? 'basic' : 'primary'}
              size='small'
              onClick={handlePickFile}
              disabled={upload.isPending}
            >
              <HugeiconsIcon icon={Upload01Icon} size={14} color='currentColor' strokeWidth={1.5} />
              {upload.isPending ? 'Загрузка...' : hasUploaded ? 'Заменить чек' : 'Загрузить чек'}
            </FancyButton.Root>
          </div>
        )}
      </div>

      {hasUploaded && (
        <div className='mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2'>
          <HugeiconsIcon icon={File01Icon} size={14} color='currentColor' strokeWidth={1.5} className='text-gray-500' />
          <span className='text-xs text-gray-600'>
            Ваш чек (загружен {formatDate(s.developer_receipt_uploaded_at)})
          </span>
          <a
            href={s.developer_receipt!}
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

export function DeveloperPaymentsView() {
  const { data, isLoading } = useSettlements();
  const settlements = data ?? [];

  const totalOwed = settlements.reduce((a, s) => a + parseFloat(s.total_from_developer || '0'), 0);
  const paid = settlements
    .filter((s) => s.received_from_developer)
    .reduce((a, s) => a + parseFloat(s.total_from_developer || '0'), 0);
  const pending = totalOwed - paid;

  const cards = [
    { label: 'Общая задолженность', value: String(totalOwed), color: 'text-gray-900' },
    { label: 'Оплачено', value: String(paid), color: 'text-emerald-600' },
    { label: 'К оплате', value: String(pending), color: 'text-amber-600' },
    { label: 'Сделок', value: String(settlements.length), color: 'text-blue-600' },
  ];

  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-lg font-semibold text-gray-900'>Мои платежи</h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          Одной транзакцией (комиссия брокера + 0.4% платформе) на счёт платформы. Срок — до 6 месяцев с даты подтверждения сделки.
        </p>
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
            <p className='text-sm font-medium text-gray-900'>Нет платежей</p>
            <p className='text-xs text-gray-400 mt-1'>Платежи появятся после подтверждения сделок</p>
          </div>
        ) : (
          settlements.map((s) => <DeveloperSettlementCard key={s.id} s={s} />)
        )}
      </div>
    </div>
  );
}
