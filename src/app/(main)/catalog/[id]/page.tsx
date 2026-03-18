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
} from '@hugeicons/core-free-icons';

import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import {
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import { useProperty } from '@/features/properties';
import { useAuctions } from '@/features/auctions';
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

  const { data: property, isLoading: isPropertyLoading } = useProperty(propertyId);

  // Check if there is an active auction for this property
  const { data: auctionsData } = useAuctions({
    property_id: propertyId,
    status: 'active',
    page_size: 1,
  });

  const activeAuction = auctionsData?.results?.[0] ?? null;

  if (isPropertyLoading) {
    return (
      <div className='w-full px-8 py-8'>
        <div className='flex items-center justify-center py-20'>
          <div className='text-sm text-gray-400'>Загрузка...</div>
        </div>
      </div>
    );
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
          <Link
            href='/catalog'
            className='mt-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors'
          >
            Вернуться в каталог
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
            href='/catalog'
            className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>{property.address}</h1>
            <p className='mt-1 text-sm text-gray-500'>Информация об объекте недвижимости</p>
          </div>
        </div>
        {activeAuction && (
          <Link href={`/auctions/${activeAuction.id}`}>
            <button className='bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2'>
              <HugeiconsIcon icon={Award01Icon} size={16} />
              Участвовать в аукционе
            </button>
          </Link>
        )}
      </div>

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
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Класс</div>
              <div className='mt-1'>
                <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500'>
                  {CLASS_LABELS[property.property_class]}
                </span>
              </div>
            </div>
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
                {property.area} м²
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
              {formatPrice(property.price)} {property.currency}
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
                <Link href={`/auctions/${activeAuction.id}`} className='block'>
                  <button className='w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2'>
                    <HugeiconsIcon icon={Award01Icon} size={16} />
                    Участвовать в аукционе
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
