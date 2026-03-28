'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, Upload04Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { DealProgressBar } from './deal-progress-bar';
import { useDeals, useUploadDDU, useUploadPaymentProof, useUpdateDealComment } from '@/features/deals';
import type { Deal, DealStatus, ObligationStatus } from '@/shared/types/deals';

type TabFilter = 'all' | DealStatus;

const BROKER_TABS: { label: string; value: TabFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидает документов', value: 'pending_documents' },
  { label: 'На проверке', value: 'admin_review' },
  { label: 'Подтверждена', value: 'confirmed' },
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
  const [comment, setComment] = React.useState('');

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

  return (
    <div className={cn(
      'bg-white rounded-xl border p-5',
      isOverdue ? 'border-red-200' : 'border-gray-200'
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
            <label className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <HugeiconsIcon icon={Upload04Icon} size={16} color="currentColor" strokeWidth={1.5} />
              Загрузить ДДУ
              <input type="file" className="hidden" onChange={handleDDUUpload} accept=".pdf,.doc,.docx" />
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <HugeiconsIcon icon={Upload04Icon} size={16} color="currentColor" strokeWidth={1.5} />
              Загрузить подтверждение оплаты
              <input type="file" className="hidden" onChange={handlePaymentProofUpload} accept=".pdf,.jpg,.jpeg,.png" />
            </label>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Комментарий (если документы переданы вне платформы)</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ссылка или описание, где находятся документы"
                className="flex-1 h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors"
              />
              {comment.trim() && (
                <button
                  onClick={handleCommentSubmit}
                  disabled={updateComment.isPending}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Отправить
                </button>
              )}
            </div>
          </div>
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Мои сделки</h1>
            <p className="text-sm text-gray-500 mt-0.5">Обязательства и документы по выигранным аукционам</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {BROKER_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? allDeals.length
              : allDeals.filter((d) => d.status === tab.value).length;
            return (
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
