'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Image01Icon,
  Building03Icon,
  Award01Icon,
  Tick01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

import toast from 'react-hot-toast';
import { PropertyDetailSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import {
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import { useProperty } from '@/features/properties';
import { useAuctions } from '@/features/auctions';
import { useApproveProperty, useRejectProperty } from '@/features/admin';
import { useSessionStore } from '@/entities/auth/model/store';
import type { Property } from '@/shared/types/properties';

const STATUS_BADGE_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  active: 'bg-blue-50 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
};

function DetailImageCarousel({ images }: { images: Property['images'] }) {
  const [current, setCurrent] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className='flex h-72 items-center justify-center rounded-xl bg-gray-50 sm:h-96'>
        <HugeiconsIcon icon={Image01Icon} size={48} className='text-gray-400' />
      </div>
    );
  }

  const prev = () => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  const next = () => {
    setCurrent((c) => (c + 1) % images.length);
  };

  return (
    <div className='group relative h-72 overflow-hidden rounded-xl bg-gray-50 sm:h-96'>
      <img
        src={images[current].url || images[current].external_url || ''}
        alt=''
        className='h-full w-full object-cover transition-opacity duration-200'
      />

      {images.length > 1 && (
        <>
          <button
            type='button'
            onClick={prev}
            className='absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-opacity hover:bg-white'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} className='text-gray-900' />
          </button>
          <button
            type='button'
            onClick={next}
            className='absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-opacity hover:bg-white'
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} className='text-gray-900' />
          </button>

          <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'>
            {images.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === current ? 'w-5 bg-white' : 'w-2 bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CatalogDetailPage() {
  const params = useParams();
  const propertyId = Number(params.id);
  const user = useSessionStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.is_admin === true;

  const { data: property, isLoading: isPropertyLoading } = useProperty(propertyId);

  // Check if there is an active auction for this property
  const { data: auctionsData } = useAuctions({
    property_id: propertyId,
    status: 'active',
    page_size: 1,
  });

  const activeAuction = auctionsData?.results?.[0] ?? null;

  const approve = useApproveProperty();
  const reject = useRejectProperty();
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  const handleApprove = () => {
    approve.mutate(propertyId, {
      onSuccess: () => toast.success('Объект одобрен'),
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    reject.mutate(
      { id: propertyId, data: { reason: rejectReason.trim() } },
      {
        onSuccess: () => {
          toast.success('Объект отклонён');
          setRejectOpen(false);
          setRejectReason('');
        },
      },
    );
  };

  if (isPropertyLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property) {
    return (
      <div className='w-full px-8 py-8'>
        <div className='flex flex-col items-center justify-center gap-3 py-20'>
          <div className='flex size-12 items-center justify-center rounded-xl bg-gray-50'>
            <HugeiconsIcon icon={Building03Icon} size={24} className='text-gray-400' />
          </div>
          <div className='text-center'>
            <div className='text-base font-semibold text-gray-900'>Объект не найден</div>
            <div className='mt-1 max-w-[360px] text-sm text-gray-500'>
              Возможно, объект был удален или у вас нет доступа
            </div>
          </div>
          <Link href='/objects' className='mt-2'>
            <FancyButton.Root variant='basic' size='small'>
              Вернуться в каталог
            </FancyButton.Root>
          </Link>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_BADGE_STYLES[property.status] || STATUS_BADGE_STYLES.draft;

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link
            href='/objects'
            className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>{property.address}</h1>
            <p className='mt-1 text-sm text-gray-500'>Информация об объекте недвижимости</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {isAdmin && property.moderation_status === 'pending' && !approve.isSuccess && !reject.isSuccess && (
            <>
              <FancyButton.Root
                variant='primary'
                size='small'
                onClick={handleApprove}
                disabled={approve.isPending || reject.isPending}
              >
                <HugeiconsIcon icon={Tick01Icon} size={16} />
                {approve.isPending ? 'Одобрение...' : 'Одобрить'}
              </FancyButton.Root>
              <FancyButton.Root
                variant='basic'
                size='small'
                onClick={() => setRejectOpen(true)}
                disabled={approve.isPending || reject.isPending}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                Отклонить
              </FancyButton.Root>
            </>
          )}
        </div>
      </div>

      {/* Reject reason form */}
      {rejectOpen && (
        <div className='mt-4 rounded-xl border border-red-200 bg-red-50/60 p-4'>
          <div className='text-[13px] font-semibold text-red-700 mb-2'>Причина отклонения</div>
          <input
            type='text'
            placeholder='Укажите причину отклонения'
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className='w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 placeholder:text-gray-400 transition-colors'
            autoFocus
          />
          <div className='mt-3 flex gap-2'>
            <FancyButton.Root variant='destructive' size='small' onClick={handleReject} disabled={reject.isPending}>
              {reject.isPending ? 'Отклонение...' : 'Подтвердить отклонение'}
            </FancyButton.Root>
            <FancyButton.Root variant='basic' size='small' onClick={() => { setRejectOpen(false); setRejectReason(''); }}>
              Отмена
            </FancyButton.Root>
          </div>
        </div>
      )}

      {/* Rejection reason display */}
      {property.moderation_status === 'rejected' && property.moderation_rejection_reason && (
        <div className='mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4'>
          <HugeiconsIcon icon={Cancel01Icon} size={18} color='currentColor' strokeWidth={1.5} className='mt-0.5 shrink-0 text-red-500' />
          <div>
            <div className='text-[13px] font-semibold text-red-700'>Объект отклонён</div>
            <div className='mt-0.5 text-[13px] text-red-600'>{property.moderation_rejection_reason}</div>
          </div>
        </div>
      )}

      {/* Image carousel */}
      <div className='mt-6'>
        <DetailImageCarousel images={property.images} />
      </div>

      {/* Property info */}
      <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main details */}
        <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6 lg:col-span-2'>
          <div className='text-[15px] font-semibold text-gray-900'>Основная информация</div>

          <div className='mt-5 border-t border-blue-50 pt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3'>
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Тип</div>
              <div className='mt-1'>
                <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500'>
                  {TYPE_LABELS[property.type]}
                </span>
              </div>
            </div>
            {property.type !== 'land' && (
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Класс</div>
              <div className='mt-1'>
                <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500'>
                  {CLASS_LABELS[property.property_class]}
                </span>
              </div>
            </div>
            )}
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Статус</div>
              <div className='mt-1'>
                <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', statusStyle)}>
                  {STATUS_LABELS[property.status]}
                </span>
              </div>
            </div>
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Адрес</div>
              <div className='text-[13px] font-medium text-gray-900 mt-1'>
                {property.address}
              </div>
            </div>
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Площадь</div>
              <div className='text-[13px] font-medium text-gray-900 mt-1'>
                {property.area} {property.type === 'land' ? 'соток' : 'м²'}
              </div>
            </div>
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Дедлайн</div>
              <div className='text-[13px] font-medium text-gray-900 mt-1'>
                {formatDateShort(property.deadline)}
              </div>
            </div>
          </div>
        </div>

        {/* Price & Auction card */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
            <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Цена</div>
            <div className='mt-2 text-xl font-semibold text-gray-900'>
              {formatPrice(property.price, property.currency)}
            </div>
          </div>

          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
            <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Даты</div>
            <div className='mt-3 space-y-2'>
              <div className='flex justify-between'>
                <span className='text-[13px] text-gray-500'>Создан</span>
                <span className='text-[13px] font-medium text-gray-900'>
                  {formatDateShort(property.created_at)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[13px] text-gray-500'>Обновлен</span>
                <span className='text-[13px] font-medium text-gray-900'>
                  {formatDateShort(property.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {activeAuction && (
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                Активный аукцион
              </div>
              <div className='mt-3 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Мин. цена</span>
                  <span className='text-[13px] font-medium text-gray-900'>
                    {formatPrice(activeAuction.min_price)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Текущая цена</span>
                  <span className='text-[13px] font-medium text-gray-900'>
                    {formatPrice(activeAuction.current_price)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Ставки</span>
                  <span className='text-[13px] font-medium text-gray-900'>
                    {activeAuction.bids_count}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Окончание</span>
                  <span className='text-[13px] font-medium text-gray-900'>
                    {formatDateShort(activeAuction.end_date)}
                  </span>
                </div>
              </div>
              <div className='mt-4'>
                <Link href={`/auctions/${activeAuction.id}`} className='w-full'>
                  <FancyButton.Root variant='primary' size='small' className='w-full'>
                    <HugeiconsIcon icon={Award01Icon} size={16} />
                    Участвовать в аукционе
                  </FancyButton.Root>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
