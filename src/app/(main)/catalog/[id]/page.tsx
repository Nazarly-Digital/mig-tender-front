'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBuilding2Line,
  RiImageLine,
  RiAuctionLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as StatusBadge from '@/shared/ui/status-badge';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { PageHeader } from '@/shared/components/page-header';
import {
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
  STATUS_MAP,
  TYPE_COLORS,
  CLASS_COLORS,
} from '@/shared/components/properties-table';
import { useProperty } from '@/features/properties';
import { useAuctions } from '@/features/auctions';
import type { Property } from '@/shared/types/properties';

function DetailImageCarousel({ images }: { images: Property['images'] }) {
  const [current, setCurrent] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className='flex h-72 items-center justify-center rounded-xl bg-gray-50 sm:h-96'>
        <RiImageLine className='size-12 text-gray-400' />
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
            className='absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 transition-opacity hover:bg-white'
          >
            <RiArrowLeftSLine className='size-5 text-gray-900' />
          </button>
          <button
            type='button'
            onClick={next}
            className='absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 transition-opacity hover:bg-white'
          >
            <RiArrowRightSLine className='size-5 text-gray-900' />
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
      <div className='flex flex-1 items-center justify-center p-6 lg:p-8'>
        <div className='text-sm text-gray-400'>Загрузка...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 px-4 py-20 lg:px-10'>
        <div className='flex size-12 items-center justify-center rounded-xl bg-gray-50'>
          <RiBuilding2Line className='size-6 text-gray-400' />
        </div>
        <div className='text-center'>
          <div className='text-base font-semibold text-gray-900'>Объект не найден</div>
          <div className='mt-1 max-w-[360px] text-sm text-gray-500'>
            Возможно, объект был удален или у вас нет доступа
          </div>
        </div>
        <Link href='/catalog'>
          <FancyButton.Root variant='neutral' size='xsmall'>
            Вернуться в каталог
          </FancyButton.Root>
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title={property.address}
        description='Информация об объекте недвижимости'
        backHref='/catalog'
        action={
          activeAuction ? (
            <Link href={`/auctions/${activeAuction.id}`}>
              <FancyButton.Root variant='primary' size='xsmall'>
                <FancyButton.Icon as={RiAuctionLine} />
                Участвовать в аукционе
              </FancyButton.Root>
            </Link>
          ) : undefined
        }
      />

      {/* Image carousel */}
      <DetailImageCarousel images={property.images} />

      {/* Property info */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main details */}
        <div className='rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2'>
          <div className='text-lg font-semibold text-gray-900'>Основная информация</div>

          <Divider.Root variant='line-spacing' className='my-0 py-4' />

          <div className='grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3'>
            <div>
              <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Тип</div>
              <div className='mt-1'>
                <Badge.Root variant='lighter' color={TYPE_COLORS[property.type]} size='small'>
                  {TYPE_LABELS[property.type]}
                </Badge.Root>
              </div>
            </div>
            <div>
              <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Класс</div>
              <div className='mt-1'>
                <Badge.Root variant='lighter' color={CLASS_COLORS[property.property_class]} size='small'>
                  {CLASS_LABELS[property.property_class]}
                </Badge.Root>
              </div>
            </div>
            <div>
              <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Статус</div>
              <div className='mt-1'>
                <StatusBadge.Root variant='light' status={STATUS_MAP[property.status]}>
                  <StatusBadge.Dot />
                  {STATUS_LABELS[property.status]}
                </StatusBadge.Root>
              </div>
            </div>
            <div>
              <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Адрес</div>
              <div className='mt-1 text-sm font-medium text-gray-900'>
                {property.address}
              </div>
            </div>
            <div>
              <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Площадь</div>
              <div className='mt-1 text-sm font-medium text-gray-900'>
                {property.area} м²
              </div>
            </div>
            <div>
              <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Дедлайн</div>
              <div className='mt-1 text-sm font-medium text-gray-900'>
                {formatDateShort(property.deadline)}
              </div>
            </div>
          </div>
        </div>

        {/* Price & Auction card */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-xl border border-gray-200 bg-white p-6'>
            <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Цена</div>
            <div className='mt-2 text-xl font-semibold text-gray-900'>
              {formatPrice(property.price)} {property.currency}
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-6'>
            <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Даты</div>
            <div className='mt-3 space-y-2'>
              <div className='flex justify-between'>
                <span className='text-[13px] text-gray-500'>Создан</span>
                <span className='text-sm font-medium text-gray-900'>
                  {formatDateShort(property.created_at)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[13px] text-gray-500'>Обновлен</span>
                <span className='text-sm font-medium text-gray-900'>
                  {formatDateShort(property.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {activeAuction && (
            <div className='rounded-xl border border-gray-200 bg-white p-6'>
              <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>
                Активный аукцион
              </div>
              <div className='mt-3 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Мин. цена</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {formatPrice(activeAuction.min_price)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Текущая цена</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {formatPrice(activeAuction.current_price)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Ставки</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {activeAuction.bids_count}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-[13px] text-gray-500'>Окончание</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {formatDateShort(activeAuction.end_date)}
                  </span>
                </div>
              </div>
              <div className='mt-4'>
                <Link href={`/auctions/${activeAuction.id}`} className='block'>
                  <FancyButton.Root variant='primary' size='xsmall' className='w-full'>
                    <FancyButton.Icon as={RiAuctionLine} />
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
