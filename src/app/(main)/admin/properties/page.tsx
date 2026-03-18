'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  RiBuilding2Line,
  RiCheckLine,
  RiCloseLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Button from '@/shared/ui/button';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Modal from '@/shared/ui/modal';
import * as StatusBadge from '@/shared/ui/status-badge';
import * as Table from '@/shared/ui/table';
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

function formatPrice(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num);
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
          icon={RiCheckLine}
          title='Одобрить объект?'
          description={property.address}
        />
        <Modal.Body>
          <div className='grid grid-cols-2 gap-3 text-[14px]'>
            <div>
              <span className='text-[#9CA3AF]'>Тип: </span>
              <span className='text-[#111827]'>
                {TYPE_LABELS[property.type] ?? property.type}
              </span>
            </div>
            <div>
              <span className='text-[#9CA3AF]'>Площадь: </span>
              <span className='text-[#111827]'>{property.area} м²</span>
            </div>
            <div>
              <span className='text-[#9CA3AF]'>Цена: </span>
              <span className='text-[#111827]'>
                {formatPrice(property.price)} {property.currency}
              </span>
            </div>
            <div>
              <span className='text-[#9CA3AF]'>Девелопер: </span>
              <span className='text-[#111827]'>
                {property.developer_name}
              </span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root variant='neutral' mode='stroke' type='button'>
              Отмена
            </Button.Root>
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
          icon={RiCloseLine}
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
            <div className='grid grid-cols-2 gap-3 text-[14px]'>
              <div>
                <span className='text-[#9CA3AF]'>Тип: </span>
                <span className='text-[#111827]'>
                  {TYPE_LABELS[property.type] ?? property.type}
                </span>
              </div>
              <div>
                <span className='text-[#9CA3AF]'>Цена: </span>
                <span className='text-[#111827]'>
                  {formatPrice(property.price)} {property.currency}
                </span>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label.Root htmlFor='reject-reason'>Причина отклонения</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='reject-reason'
                    placeholder='Укажите причину (необязательно)'
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root variant='neutral' mode='stroke' type='button'>
                Отмена
              </Button.Root>
            </Modal.Close>
            <FancyButton.Root
              variant='neutral'
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
    page_size: 50,
  });
  const properties = data?.results ?? [];

  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Модерация объектов'
        description='Объекты, ожидающие проверки и одобрения'
        icon={RiBuilding2Line}
      />

      {/* Content */}
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center py-20'>
          <div className='text-[14px] text-[#9CA3AF]'>
            Загрузка...
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20'>
          <div className='flex size-12 items-center justify-center rounded-full bg-[#F9FAFB]'>
            <RiCheckLine className='size-6 text-[#9CA3AF]' />
          </div>
          <div className='text-center'>
            <div className='text-[14px] font-medium text-[#6B7280]'>
              Нет объектов на модерации
            </div>
            <div className='mt-1 text-[12px] text-[#9CA3AF]'>
              Все объекты проверены
            </div>
          </div>
        </div>
      ) : (
        <div className='rounded-2xl bg-white p-4 shadow-regular-xs ring-1 ring-inset ring-[#E5E7EB]'>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Адрес</Table.Head>
                <Table.Head>Тип</Table.Head>
                <Table.Head>Класс</Table.Head>
                <Table.Head>Площадь</Table.Head>
                <Table.Head>Цена</Table.Head>
                <Table.Head>Девелопер</Table.Head>
                <Table.Head>Дата</Table.Head>
                <Table.Head className='w-[200px] text-right'>
                  Действия
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {properties.map((property) => (
                <Table.Row key={property.id}>
                  <Table.Cell>
                    <div className='max-w-[200px] truncate text-[14px] font-medium text-[#111827]'>
                      {property.address}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge.Root variant='lighter' color='gray' size='small'>
                      {TYPE_LABELS[property.type] ?? property.type}
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge.Root variant='lighter' color='blue' size='small'>
                      {CLASS_LABELS[property.property_class] ??
                        property.property_class}
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <div className='text-[14px] text-[#6B7280]'>
                      {property.area} м²
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className='text-[14px] font-medium text-[#111827]'>
                      {formatPrice(property.price)} {property.currency}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className='text-[14px] text-[#6B7280]'>
                      {property.developer_name}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className='text-[14px] text-[#6B7280]'>
                      {formatDate(property.created_at)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className='flex items-center justify-end gap-2'>
                      <Button.Root
                        variant='neutral'
                        mode='stroke'
                        size='xsmall'
                        onClick={() => setApproveTarget(property)}
                      >
                        <Button.Icon as={RiCheckLine} />
                        Одобрить
                      </Button.Root>
                      <Button.Root
                        variant='neutral'
                        mode='stroke'
                        size='xsmall'
                        onClick={() => setRejectTarget(property)}
                      >
                        <Button.Icon as={RiCloseLine} />
                        Отклонить
                      </Button.Root>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
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
