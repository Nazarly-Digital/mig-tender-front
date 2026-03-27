'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Tick01Icon,
  Cancel01Icon,
  Building03Icon,
} from '@hugeicons/core-free-icons';

import { TableSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import { PageHeader } from '@/shared/components/page-header';
import {
  usePendingProperties,
  useApproveProperty,
  useRejectProperty,
} from '@/features/admin';
import type { PendingProperty } from '@/shared/types/admin';

// --- Helpers ---

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  townhouse: 'Таунхаус',
  commercial: 'Коммерция',
  land: 'Участок',
};

const CLASS_LABELS: Record<string, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  premium: 'Премиум',
};

function formatPrice(value: string, _currency?: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { error?: string; detail?: string } } };
  return err.response?.data?.error ?? err.response?.data?.detail ?? 'Произошла ошибка';
}

// --- Approve Confirm Modal ---

function ApproveModal({
  property,
  open,
  onOpenChange,
}: {
  property: PendingProperty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const approve = useApproveProperty();

  if (!property) return null;

  const handleConfirm = () => {
    approve.mutate(property.id, {
      onSuccess: () => {
        toast.success(`Объект "${property.address}" одобрен`);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(getApiError(error));
      },
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header
          title='Одобрить объект?'
          description={property.address}
        />
        <Modal.Body>
          <div className='grid grid-cols-2 gap-3 text-[13px]'>
            <div>
              <span className='text-gray-400'>Тип: </span>
              <span className='text-gray-900'>
                {TYPE_LABELS[property.type] ?? property.type}
              </span>
            </div>
            <div>
              <span className='text-gray-400'>Площадь: </span>
              <span className='text-gray-900'>{property.area} {property.type === 'land' ? 'соток' : 'м²'}</span>
            </div>
            <div>
              <span className='text-gray-400'>Цена: </span>
              <span className='text-gray-900'>
                {formatPrice(property.price, property.currency)}
              </span>
            </div>
            <div>
              <span className='text-gray-400'>Девелопер: </span>
              <span className='text-gray-900'>
                {property.developer_name}
              </span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant='primary'
            size='small'
            onClick={handleConfirm}
            disabled={approve.isPending}
          >
            {approve.isPending ? 'Одобрение...' : 'Одобрить'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Reject Modal ---

function RejectModal({
  property,
  open,
  onOpenChange,
}: {
  property: PendingProperty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = React.useState('');
  const reject = useRejectProperty();

  if (!property) return null;

  const handleConfirm = () => {
    reject.mutate(
      { id: property.id, data: reason.trim() ? { reason } : undefined },
      {
        onSuccess: () => {
          toast.success(`Объект "${property.address}" отклонён`);
          setReason('');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header
          title='Отклонить объект?'
          description={property.address}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirm();
          }}
        >
          <Modal.Body className='space-y-4'>
            <div className='grid grid-cols-2 gap-3 text-[13px]'>
              <div>
                <span className='text-gray-400'>Тип: </span>
                <span className='text-gray-900'>
                  {TYPE_LABELS[property.type] ?? property.type}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Цена: </span>
                <span className='text-gray-900'>
                  {formatPrice(property.price, property.currency)}
                </span>
              </div>
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='reject-reason' className='block text-[13px] font-medium text-gray-700'>
                Причина отклонения
              </label>
              <input
                id='reject-reason'
                type='text'
                placeholder='Укажите причину (необязательно)'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className='w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors'
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='basic' size='small'>
                Отмена
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              variant='destructive'
              size='small'
              type='submit'
              disabled={reject.isPending}
            >
              {reject.isPending ? 'Отклонение...' : 'Отклонить'}
            </FancyButton.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Main Page ---

export default function AdminPropertiesPage() {
  const [approveTarget, setApproveTarget] =
    React.useState<PendingProperty | null>(null);
  const [rejectTarget, setRejectTarget] =
    React.useState<PendingProperty | null>(null);

  const { data, isLoading } = usePendingProperties({
    ordering: '-created_at',
    page_size: 20,
  });
  const properties = Array.isArray(data) ? data : data?.results ?? [];

  return (
    <div className='w-full px-8 py-8'>
      <PageHeader
        title='Модерация объектов'
        description='Объекты, ожидающие проверки и одобрения'
      />

      {/* Content */}
      {isLoading ? (
        <div className='mt-6'>
          <TableSkeleton rows={6} cols={8} />
        </div>
      ) : properties.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 py-20'>
          <HugeiconsIcon icon={Building03Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-300' />
          <span className='text-[13px] font-medium text-gray-500'>Нет объектов на модерации</span>
        </div>
      ) : (
        <div className='mt-6 overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-gray-50/50'>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Адрес
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Тип
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Класс
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Площадь
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Цена
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Девелопер
                </th>
                <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Дата
                </th>
                <th className='px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr
                  key={property.id}
                  className='border-b border-gray-100 last:border-0 transition-colors hover:bg-blue-50/20'
                >
                  <td className='px-5 py-3.5'>
                    <span className='block max-w-[200px] truncate text-[13px] font-medium text-gray-900'>
                      {property.address}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600'>
                      {TYPE_LABELS[property.type] ?? property.type}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700'>
                      {CLASS_LABELS[property.property_class] ?? property.property_class}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500'>
                      {property.area} м²
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] font-medium text-gray-900'>
                      {formatPrice(property.price, property.currency)}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-500'>
                      {property.developer_name}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='text-[13px] text-gray-400'>
                      {formatDate(property.created_at)}
                    </span>
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center justify-end gap-1.5'>
                      <FancyButton.Root variant='primary' size='xsmall' onClick={() => setApproveTarget(property)}>
                        <HugeiconsIcon icon={Tick01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                        Одобрить
                      </FancyButton.Root>
                      <FancyButton.Root variant='basic' size='xsmall' onClick={() => setRejectTarget(property)}>
                        <HugeiconsIcon icon={Cancel01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                        Отклонить
                      </FancyButton.Root>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ApproveModal
        property={approveTarget}
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
      />
      <RejectModal
        property={rejectTarget}
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      />
    </div>
  );
}
