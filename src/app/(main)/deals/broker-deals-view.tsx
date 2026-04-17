'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, Upload04Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { DealProgressBar } from './deal-progress-bar';
import { useDeals, useUploadDDU, useUploadPaymentProof, useUpdateDealComment, useSubmitForReview } from '@/features/deals';
import type { Deal, DealStatus, ObligationStatus } from '@/shared/types/deals';

type TabFilter = 'all' | DealStatus;

const BROKER_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает документов', value: 'pending_documents' },
  { label: 'На проверке', value: 'admin_review' },
  { label: 'Ожидает подтверждения девелопера', value: 'developer_confirm' },
  { label: 'Подтверждена', value: 'confirmed' },
  { label: 'Несостоявшиеся', value: 'failed' },
  { label: 'Отклонённые', value: 'declined' },
];

function getStatusBadge(status: DealStatus, obligationStatus?: ObligationStatus) {
  if (obligationStatus === 'overdue') {
    return { label: 'Просрочено', className: 'bg-red-50 text-red-700' };
  }
  const map: Record<DealStatus, { label: string; className: string }> = {
    pending_documents: { label: 'Ожидает документов', className: 'bg-amber-50 text-amber-700' },
    admin_review: { label: 'На проверке', className: 'bg-gray-100 text-gray-600' },
    developer_confirm: { label: 'Ожидает девелопера', className: 'bg-blue-50 text-blue-700' },
    confirmed: { label: 'Подтверждена', className: 'bg-emerald-50 text-emerald-700' },
    failed: { label: 'Несостоявшаяся', className: 'bg-red-50 text-red-700' },
    declined: { label: 'Отклонена девелопером', className: 'bg-red-50 text-red-700' },
  };
  return map[status];
}

function getObligationLabel(status: ObligationStatus) {
  const map: Record<ObligationStatus, { label: string; className: string }> = {
    active: { label: 'Активно', className: 'text-amber-600' },
    fulfilled: { label: 'Выполнено', className: 'text-emerald-600' },
    overdue: { label: 'Просрочено', className: 'text-red-600' },
  };
  return map[status];
}

function getInfoMessage(deal: Deal): { text: string; color: string } | null {
  if (deal.status === 'declined') {
    return { text: 'Девелопер отказался от результата аукциона. Сделка закрыта без завершения.', color: 'text-red-600' };
  }
  if (deal.status === 'failed') {
    return { text: 'Сделка автоматически переведена в статус «Несостоявшийся», так как документы не были загружены в течение 5 дней. Восстановить сделку нельзя.', color: 'text-red-600' };
  }
  if (deal.obligation_status === 'overdue') {
    return { text: `Дедлайн загрузки документов был ${formatDateShort(deal.document_deadline)}. Обязательство просрочено.`, color: 'text-red-600' };
  }
  switch (deal.status) {
    case 'admin_review':
      return { text: 'Документы на проверке у администратора. Ожидаем подтверждения.', color: 'text-blue-600' };
    case 'developer_confirm':
      return { text: 'Админ проверил документы. Ожидаем подтверждения от девелопера.', color: 'text-blue-600' };
    case 'confirmed':
      return { text: 'Сделка закрыта. Выплата комиссии оформляется на странице «Мои выплаты».', color: 'text-emerald-600' };
    default:
      return null;
  }
}

function BrokerDealCard({ deal }: { deal: Deal }) {
  const badge = getStatusBadge(deal.status, deal.obligation_status);
  const obligation = getObligationLabel(deal.obligation_status);
  const info = getInfoMessage(deal);
  const isOverdue = deal.obligation_status === 'overdue';

  const uploadDDU = useUploadDDU();
  const uploadPaymentProof = useUploadPaymentProof();
  const updateComment = useUpdateDealComment();
  const submitForReview = useSubmitForReview();
  const [comment, setComment] = React.useState('');

  const canSubmit = deal.has_ddu && deal.has_payment_proof && deal.status === 'pending_documents';

  const handleDDUUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadDDU.mutate({ deal_id: deal.id, ddu_document: file });
  };

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPaymentProof.mutate({ deal_id: deal.id, payment_proof_document: file });
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      updateComment.mutate({ deal_id: deal.id, comment: comment.trim() });
    }
  };

  const isFailed = deal.status === 'failed';
  const isDeclined = deal.status === 'declined';
  const isTerminal = isFailed || isDeclined;

  return (
    <div className={cn(
      'bg-white rounded-xl border p-5',
      isTerminal ? 'border-red-200 bg-red-50/30' : isOverdue ? 'border-red-200' : 'border-gray-200'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{deal.property_address}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.developer_name} · {deal.auction_mode === 'open' ? 'Открытый' : 'Закрытый'} аукцион #{deal.auction_id}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500">Ставка</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(deal.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Обязательство</p>
          <p className={cn('text-sm font-semibold mt-0.5', obligation.className)}>{obligation.label}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Дедлайн загрузки</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateShort(deal.document_deadline)}</p>
        </div>
      </div>

      {/* Progress */}
      <DealProgressBar currentStep={deal.status} isOverdue={isOverdue} />

      {/* Upload section */}
      {deal.status === 'pending_documents' && deal.obligation_status !== 'overdue' && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              {deal.has_ddu && (
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <HugeiconsIcon icon={File01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                  ДДУ загружен
                </div>
              )}
              <label className={cn("flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer", uploadDDU.isPending ? "text-gray-400 bg-gray-50 border border-gray-200" : deal.has_ddu ? "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50" : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50")}>
                <HugeiconsIcon icon={Upload04Icon} size={16} color="currentColor" strokeWidth={1.5} />
                {uploadDDU.isPending ? 'Загрузка...' : deal.has_ddu ? 'Заменить' : 'Загрузить ДДУ'}
                <input type="file" className="hidden" onChange={handleDDUUpload} accept=".pdf,.doc,.docx" disabled={uploadDDU.isPending} />
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              {deal.has_payment_proof && (
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <HugeiconsIcon icon={File01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                  Оплата подтверждена
                </div>
              )}
              <label className={cn("flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer", uploadPaymentProof.isPending ? "text-gray-400 bg-gray-50 border border-gray-200" : deal.has_payment_proof ? "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50" : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50")}>
                <HugeiconsIcon icon={Upload04Icon} size={16} color="currentColor" strokeWidth={1.5} />
                {uploadPaymentProof.isPending ? 'Загрузка...' : deal.has_payment_proof ? 'Заменить' : 'Загрузить подтверждение оплаты'}
                <input type="file" className="hidden" onChange={handlePaymentProofUpload} accept=".pdf,.jpg,.jpeg,.png" disabled={uploadPaymentProof.isPending} />
              </label>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Комментарий (необязательно)</p>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ссылка или описание, где находятся документы"
              className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Submit for review */}
      {canSubmit && (
        <div className="mt-4">
          <button
            onClick={() => {
              if (comment.trim()) updateComment.mutate({ deal_id: deal.id, comment: comment.trim() });
              submitForReview.mutate(deal.id);
            }}
            disabled={submitForReview.isPending || updateComment.isPending}
            className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {submitForReview.isPending ? 'Отправка...' : 'Отправить на проверку'}
          </button>
        </div>
      )}

      {/* Info message */}
      {info && (
        <div className="flex items-start gap-2 mt-4">
          <span className={cn(
            'mt-1 size-2 shrink-0 rounded-full',
            info.color === 'text-blue-600' ? 'bg-blue-500'
              : info.color === 'text-emerald-600' ? 'bg-emerald-500'
                : info.color === 'text-red-600' ? 'bg-red-500'
                  : 'bg-amber-500'
          )} />
          <p className={cn('text-xs', info.color)}>{info.text}</p>
        </div>
      )}
    </div>
  );
}

export function BrokerDealsView() {
  const [activeTab, setActiveTab] = React.useState<TabFilter>('all');

  const { data, isLoading } = useDeals(
    activeTab === 'all' ? undefined : { status: activeTab as DealStatus }
  );
  const deals = data?.results ?? [];

  // For tab counts, fetch all deals
  const { data: allData } = useDeals();
  const allDeals = allData?.results ?? [];

  return (
    <div className="w-full px-8 py-8">
      <div className="">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Мои сделки</h1>
            <p className="text-sm text-gray-500 mt-0.5">Обязательства и документы по выигранным аукционам</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-200 mt-5">
          {BROKER_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? allDeals.length
              : allDeals.filter((d) => d.status === tab.value).length;
            return (
              <button
                key={tab.value}
                type='button'
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.value
                    ? 'border-blue-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                {tab.label}{tab.value === 'all' && count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="space-y-4 mt-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-gray-400">Загрузка...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-gray-900">Нет сделок</p>
              <p className="text-xs text-gray-400 mt-1">Сделки появятся после победы в аукционах</p>
            </div>
          ) : (
            deals.map((deal) => <BrokerDealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </div>
    </div>
  );
}
