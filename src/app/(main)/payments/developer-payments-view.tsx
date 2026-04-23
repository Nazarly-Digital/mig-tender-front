'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  AlertCircleIcon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/formatters';
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
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='px-5 pt-4 pb-3 flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-gray-500'>
            Аукцион #{s.auction_id} · Сделка #{s.deal_id}
          </p>
          <h3 className='text-sm font-semibold text-gray-900 mt-1 truncate'>
            {s.property_name}
          </h3>
        </div>
        {isPaid ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 shrink-0'>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color='currentColor' strokeWidth={2} />
            Оплачено
          </span>
        ) : hasUploaded ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 shrink-0'>
            <HugeiconsIcon icon={Clock01Icon} size={12} color='currentColor' strokeWidth={2} />
            На проверке
          </span>
        ) : isOverdue ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 shrink-0'>
            <HugeiconsIcon icon={AlertCircleIcon} size={12} color='currentColor' strokeWidth={2} />
            Просрочено
          </span>
        ) : (
          <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 shrink-0'>
            <HugeiconsIcon icon={Clock01Icon} size={12} color='currentColor' strokeWidth={2} />
            Ожидает загрузки чека
          </span>
        )}
      </div>

      <div className='border-t border-gray-100' />

      {/* Body */}
      <div className='px-5 py-4'>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-gray-500'>Сумма сделки</p>
          <p className='text-sm font-medium text-gray-900'>{formatPrice(s.deal_amount)}</p>
        </div>

        <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4'>
          Разбивка комиссии
        </p>

        <div className='space-y-2 mt-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-600'>Комиссия брокера ({brokerPct}%)</p>
            <p className='text-sm text-gray-900'>{formatPrice(s.broker_amount)}</p>
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-600'>Комиссия платформы ({platformPct}%)</p>
            <p className='text-sm text-gray-900'>{formatPrice(s.platform_amount)}</p>
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-600'>Дедлайн</p>
            <p className={cn('text-sm', isOverdue ? 'text-red-600 font-medium' : 'text-gray-900')}>
              {formatDate(s.developer_payment_deadline)}
            </p>
          </div>
          <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
            <p className='text-sm font-semibold text-gray-900'>Итого ({totalPct}%)</p>
            <p className='text-base font-bold text-gray-900'>{formatPrice(String(total))}</p>
          </div>
        </div>

        {hasUploaded && (
          <div className='flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 mt-4'>
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={14}
              color='currentColor'
              strokeWidth={2}
              className='text-emerald-600 shrink-0'
            />
            <span className='text-xs text-emerald-700'>
              {isPaid ? 'Чек подтверждён администратором' : 'Чек загружен, ожидает подтверждения админа'}
            </span>
            <a
              href={s.developer_receipt!}
              target='_blank'
              rel='noopener noreferrer'
              className='ml-auto text-xs font-medium text-emerald-700 hover:text-emerald-800 shrink-0'
            >
              Скачать
            </a>
          </div>
        )}
      </div>

      {!isPaid && (
        <>
          <input ref={fileRef} type='file' accept='image/*,.pdf' className='hidden' onChange={handleFile} />
          <button
            type='button'
            onClick={handlePickFile}
            disabled={upload.isPending}
            className='w-full bg-blue-600 text-white py-3 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            <HugeiconsIcon icon={Upload01Icon} size={14} color='currentColor' strokeWidth={2} />
            {upload.isPending ? 'Загрузка...' : hasUploaded ? 'Заменить чек' : 'Загрузить чек об оплате'}
          </button>
        </>
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

  return (
    <div className='w-full px-8 py-8'>
      <div>
        <h1 className='text-lg font-semibold text-gray-900'>Мои платежи</h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          Одной транзакцией (комиссия брокера + 0.4% платформе) на счёт платформы. Срок — до 6 месяцев с даты подтверждения сделки.
        </p>
      </div>

      <div className='relative bg-white rounded-xl border border-gray-200 p-5 mt-5 overflow-hidden w-full max-w-full lg:min-w-[225px] lg:max-w-[300px]'>
        <span className='absolute left-0 top-0 bottom-0 w-1 bg-red-500' />
        <p className='text-xs text-gray-500'>К перечислению</p>
        <p className='text-2xl font-bold text-gray-900 tracking-tight mt-1'>{formatPrice(String(pending))}</p>
      </div>

      <div className='mt-5'>
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
          <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start'>
            {settlements.map((s) => <DeveloperSettlementCard key={s.id} s={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
