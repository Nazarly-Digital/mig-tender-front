'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  File01Icon,
  Upload04Icon,
  AlertCircleIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { openAuthedFile } from '@/shared/lib/fetch-file';
import { useDeals, useUploadDDU, useUploadPaymentProof, useUpdateDealComment, useSubmitForReview } from '@/features/deals';
import type { Deal, DealStatus } from '@/shared/types/deals';

type TabFilter = 'all' | DealStatus;

const BROKER_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает документов', value: 'pending_documents' },
  { label: 'На проверке', value: 'admin_review' },
  { label: 'Ожидает девелопера', value: 'developer_confirm' },
  { label: 'Подтверждена', value: 'confirmed' },
  { label: 'Несостоявшиеся', value: 'failed' },
  { label: 'Отклонённые', value: 'declined' },
];

type BadgeTone = 'amber' | 'blue' | 'violet' | 'emerald' | 'red';

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  amber: 'bg-amber-50 text-amber-700 border border-amber-100',
  blue: 'bg-blue-50 text-blue-700 border border-blue-100',
  violet: 'bg-violet-50 text-violet-700 border border-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  red: 'bg-red-50 text-red-700 border border-red-100',
};

function getStatusBadge(deal: Deal): { label: string; tone: BadgeTone; withIcon?: boolean } {
  if (deal.obligation_status === 'overdue' && deal.status === 'pending_documents') {
    return { label: 'Просрочено', tone: 'red', withIcon: true };
  }
  const map: Record<DealStatus, { label: string; tone: BadgeTone; withIcon?: boolean }> = {
    pending_documents: { label: 'Ожидает документов', tone: 'amber', withIcon: true },
    admin_review: { label: 'На проверке', tone: 'blue' },
    developer_confirm: { label: 'Ожидает девелопера', tone: 'blue' },
    confirmed: { label: 'Подтверждена', tone: 'emerald' },
    failed: { label: 'Несостоявшаяся', tone: 'red' },
    declined: { label: 'Отклонена девелопером', tone: 'red' },
  };
  return map[deal.status];
}

const BROKER_STEPS: { key: DealStatus | 'confirmed'; label: string }[] = [
  { key: 'pending_documents', label: 'Документы' },
  { key: 'admin_review', label: 'Проверка' },
  { key: 'developer_confirm', label: 'Девелопер' },
  { key: 'confirmed', label: 'Готово' },
];

function getStepIndex(status: DealStatus): number {
  if (status === 'confirmed') return BROKER_STEPS.length - 1;
  const idx = BROKER_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
}

function formatDeadlineRelative(deadline: string, isOverdue: boolean): string {
  const shortDate = formatDateShort(deadline);
  if (isOverdue) return `Просрочено · ${shortDate}`;
  const now = new Date();
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return shortDate;
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return `${shortDate} · сегодня`;
  if (diffDays === 1) return `${shortDate} · завтра`;
  return `${shortDate} · ${diffDays} ${pluralDays(diffDays)}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return '';
}

type RightColumn = { label: string; value: string; valueClass?: string };

function getRightColumn(deal: Deal): RightColumn {
  const isOverdue = deal.obligation_status === 'overdue';
  if (deal.status === 'confirmed') {
    return { label: 'Завершено', value: formatDateShort(deal.updated_at) };
  }
  if (deal.status === 'failed' || deal.status === 'declined') {
    return { label: 'Закрыто', value: formatDateShort(deal.updated_at), valueClass: 'text-red-600' };
  }
  if (deal.status === 'developer_confirm') {
    return { label: 'Проверено', value: formatDateShort(deal.updated_at) };
  }
  if (deal.status === 'admin_review') {
    return { label: 'Загружено', value: formatDateShort(deal.updated_at) };
  }
  // pending_documents
  return {
    label: 'Дедлайн',
    value: formatDeadlineRelative(deal.document_deadline, isOverdue),
    valueClass: isOverdue ? 'text-red-600 font-semibold' : 'text-red-600',
  };
}

type InfoBar = { text: string; tone: 'amber' | 'blue' | 'emerald' | 'red'; icon: typeof AlertCircleIcon };

function getInfoBar(deal: Deal): InfoBar | null {
  if (deal.status === 'declined') {
    const reason = (deal.developer_rejection_reason || deal.admin_rejection_reason || '').trim();
    const text = reason
      ? `Девелопер отказался от результата аукциона. Причина: ${reason}`
      : 'Девелопер отказался от результата аукциона. Сделка закрыта без завершения.';
    return { text, tone: 'red', icon: AlertCircleIcon };
  }
  if (deal.status === 'failed') {
    const reason = (deal.admin_rejection_reason || '').trim();
    const text = reason
      ? `Сделка не состоялась. Причина: ${reason}`
      : 'Сделка переведена в «Несостоявшийся»: документы не были загружены в течение 5 дней. Восстановить нельзя.';
    return { text, tone: 'red', icon: AlertCircleIcon };
  }
  if (deal.obligation_status === 'overdue' && deal.status === 'pending_documents') {
    return { text: `Дедлайн загрузки был ${formatDateShort(deal.document_deadline)} · обязательство просрочено`, tone: 'red', icon: AlertCircleIcon };
  }
  switch (deal.status) {
    case 'admin_review':
      return { text: 'Администратор проверяет · обычно до 2 рабочих дней', tone: 'blue', icon: Clock01Icon };
    case 'developer_confirm':
      return { text: 'Ожидаем подтверждения девелопера', tone: 'blue', icon: Clock01Icon };
    case 'confirmed':
      return { text: 'Выплата в разделе «Мои выплаты»', tone: 'emerald', icon: CheckmarkCircle02Icon };
    default:
      return null;
  }
}

const INFO_BAR_TONE: Record<InfoBar['tone'], string> = {
  amber: 'border border-gray-200 bg-gray-50 text-gray-700',
  blue: 'border border-gray-200 bg-gray-50 text-gray-700',
  emerald: 'border border-gray-200 bg-gray-50 text-gray-700',
  red: 'border border-gray-200 bg-gray-50 text-gray-700',
};

function extractFileName(url: string): string {
  try {
    const withoutQuery = url.split('?')[0];
    const name = withoutQuery.split('/').pop() || url;
    return decodeURIComponent(name);
  } catch {
    return url;
  }
}

function BrokerDealCard({ deal }: { deal: Deal }) {
  const badge = getStatusBadge(deal);
  const info = getInfoBar(deal);
  const right = getRightColumn(deal);
  const isOverdue = deal.obligation_status === 'overdue';
  const isFailed = deal.status === 'failed';
  const isDeclined = deal.status === 'declined';
  const isTerminal = isFailed || isDeclined;
  const activeIndex = getStepIndex(deal.status);

  const uploadDDU = useUploadDDU();
  const uploadPaymentProof = useUploadPaymentProof();
  const updateComment = useUpdateDealComment();
  const submitForReview = useSubmitForReview();
  const [comment, setComment] = React.useState('');

  const canSubmit = deal.has_ddu && deal.has_payment_proof && deal.status === 'pending_documents';
  const canUpload = deal.status === 'pending_documents' && !isOverdue;

  const handleDDUUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadDDU.mutate({ deal_id: deal.id, ddu_document: file });
  };

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPaymentProof.mutate({ deal_id: deal.id, payment_proof_document: file });
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='p-5'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-xs text-gray-500'>
              <Link
                href={`/auctions/${deal.auction_id}`}
                className='font-medium text-gray-600 underline-offset-2 hover:text-blue-600 hover:underline'
              >
                Аукцион #{deal.auction_id}
              </Link>
              <span className='mx-1.5 text-gray-300'>•</span>
              <span>{deal.auction_mode === 'open' ? 'Открытый' : 'Закрытый'}</span>
            </p>
            <h3 className='mt-1 text-base font-semibold text-gray-900 truncate'>
              {deal.property_address}
            </h3>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0',
              BADGE_TONE_CLASS[badge.tone],
            )}
          >
            {badge.withIcon && (
              <HugeiconsIcon icon={AlertCircleIcon} size={12} color='currentColor' strokeWidth={2} />
            )}
            {badge.label}
          </span>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100'>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>Моя ставка</p>
            <p className='mt-1 text-sm font-semibold text-gray-900 truncate'>{formatPrice(deal.amount)}</p>
          </div>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>Комиссия</p>
            <p className='mt-1 text-sm font-semibold text-gray-900 truncate'>
              {deal.broker_commission_amount
                ? `${formatPrice(deal.broker_commission_amount)}${deal.broker_commission_rate ? ` (${deal.broker_commission_rate}%)` : ''}`
                : deal.broker_commission_rate
                  ? `${deal.broker_commission_rate}%`
                  : '—'}
            </p>
          </div>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>Девелопер</p>
            <div className='mt-1 flex items-center gap-2'>
              <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700'>
                {getInitials(deal.developer_name)}
              </span>
              <span className='text-sm font-semibold text-gray-900 truncate'>{deal.developer_name}</span>
            </div>
          </div>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>{right.label}</p>
            <p className={cn('mt-1 text-sm font-semibold truncate', right.valueClass ?? 'text-gray-900')}>{right.value}</p>
          </div>
        </div>

        {/* Documents chips */}
        {(deal.ddu_document || deal.payment_proof_document) && (
          <div className='flex flex-wrap gap-2 mt-4'>
            {deal.ddu_document && (
              <button
                type='button'
                onClick={() => openAuthedFile(deal.ddu_document!)}
                className='inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors max-w-full cursor-pointer'
              >
                <HugeiconsIcon icon={File01Icon} size={14} color='currentColor' strokeWidth={1.5} className='shrink-0' />
                <span className='truncate'>{extractFileName(deal.ddu_document)}</span>
              </button>
            )}
            {deal.payment_proof_document && (
              <button
                type='button'
                onClick={() => openAuthedFile(deal.payment_proof_document!)}
                className='inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors max-w-full cursor-pointer'
              >
                <HugeiconsIcon icon={File01Icon} size={14} color='currentColor' strokeWidth={1.5} className='shrink-0' />
                <span className='truncate'>{extractFileName(deal.payment_proof_document)}</span>
              </button>
            )}
          </div>
        )}

        {/* Step dots */}
        {!isTerminal && (
          <div className='mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
            {BROKER_STEPS.map((step, i) => {
              const isActive = i === activeIndex;
              const isDone = i < activeIndex;
              const dotClass = isOverdue && (isActive || isDone)
                ? 'bg-red-500'
                : isActive
                  ? 'bg-blue-600'
                  : isDone
                    ? 'bg-blue-400'
                    : 'bg-gray-300';
              const textClass = isOverdue && (isActive || isDone)
                ? 'text-red-600 font-medium'
                : isActive
                  ? 'text-blue-600 font-medium'
                  : isDone
                    ? 'text-gray-600'
                    : 'text-gray-400';
              return (
                <React.Fragment key={step.key}>
                  <span className='inline-flex items-center gap-1.5'>
                    <span className={cn('size-1.5 rounded-full', dotClass)} />
                    <span className={textClass}>{step.label}</span>
                  </span>
                  {i < BROKER_STEPS.length - 1 && <span className='text-gray-300'>›</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Upload area (pending_documents only, not overdue) */}
        {canUpload && (
          <div className='mt-4 space-y-3'>
            <div className='flex flex-wrap gap-2'>
              <label className={cn(
                'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                uploadDDU.isPending
                  ? 'text-gray-400 bg-gray-50 border border-gray-200'
                  : deal.has_ddu
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50',
              )}>
                <HugeiconsIcon
                  icon={deal.has_ddu ? File01Icon : Upload04Icon}
                  size={16}
                  color='currentColor'
                  strokeWidth={1.5}
                />
                {uploadDDU.isPending
                  ? 'Загрузка...'
                  : deal.has_ddu
                    ? 'Заменить ДДУ'
                    : 'Загрузить ДДУ'}
                <input
                  type='file'
                  className='hidden'
                  onChange={handleDDUUpload}
                  accept='.pdf,.doc,.docx'
                  disabled={uploadDDU.isPending}
                />
              </label>
              <label className={cn(
                'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                uploadPaymentProof.isPending
                  ? 'text-gray-400 bg-gray-50 border border-gray-200'
                  : deal.has_payment_proof
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50',
              )}>
                <HugeiconsIcon
                  icon={deal.has_payment_proof ? File01Icon : Upload04Icon}
                  size={16}
                  color='currentColor'
                  strokeWidth={1.5}
                />
                {uploadPaymentProof.isPending
                  ? 'Загрузка...'
                  : deal.has_payment_proof
                    ? 'Заменить оплату'
                    : 'Загрузить подтверждение оплаты'}
                <input
                  type='file'
                  className='hidden'
                  onChange={handlePaymentProofUpload}
                  accept='.pdf,.jpg,.jpeg,.png'
                  disabled={uploadPaymentProof.isPending}
                />
              </label>
            </div>
            <input
              type='text'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Комментарий (необязательно) — ссылка или описание'
              className='w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors'
            />
            {canSubmit && (
              <button
                onClick={() => {
                  if (comment.trim()) updateComment.mutate({ deal_id: deal.id, comment: comment.trim() });
                  submitForReview.mutate(deal.id);
                }}
                disabled={submitForReview.isPending || updateComment.isPending}
                className='w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer'
              >
                <HugeiconsIcon icon={Upload04Icon} size={16} color='currentColor' strokeWidth={2} />
                {submitForReview.isPending ? 'Отправка...' : 'Отправить на проверку'}
              </button>
            )}
          </div>
        )}

        {/* Info bar */}
        {info && (
          <div className={cn('inline-flex w-fit max-w-full items-start gap-2 rounded-lg px-3 py-2 mt-4', INFO_BAR_TONE[info.tone])}>
            <HugeiconsIcon
              icon={info.icon}
              size={14}
              color='currentColor'
              strokeWidth={2}
              className='mt-0.5 shrink-0'
            />
            <p className='text-xs leading-relaxed'>{info.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BrokerDealsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const { data, isLoading } = useDeals(
    activeTab === 'all' ? undefined : { status: activeTab as DealStatus }
  );
  const deals = data?.results ?? [];

  const { data: allData } = useDeals();
  const allDeals = allData?.results ?? [];

  return (
    <div className='w-full px-8 py-8'>
      <div>
        <div className='flex items-start justify-between mb-1'>
          <div>
            <h1 className='text-lg font-semibold text-gray-900'>Мои сделки</h1>
            <p className='text-sm text-gray-500 mt-0.5'>Обязательства и документы по выигранным аукционам</p>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex items-center gap-0 border-b border-gray-200 mt-5'>
          {BROKER_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? allDeals.length
              : allDeals.filter((d) => d.status === tab.value).length;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type='button'
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors border-b-2 -mb-px',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-1.5 font-normal',
                    isActive ? 'text-blue-400' : 'text-gray-400',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className='mt-6'>
          {isLoading ? (
            <div className='flex justify-center py-16'>
              <p className='text-sm text-gray-400'>Загрузка...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-sm font-medium text-gray-900'>Нет сделок</p>
              <p className='text-xs text-gray-400 mt-1'>Сделки появятся после победы в аукционах</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
              {deals.map((deal) => <BrokerDealCard key={deal.id} deal={deal} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
