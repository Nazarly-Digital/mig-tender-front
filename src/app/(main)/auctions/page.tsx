'use client';

import * as React from 'react';
import {
  RiAuctionLine,
  RiMore2Line,
  RiTimeLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Divider from '@/shared/ui/divider';
import * as SegmentedControl from '@/shared/ui/segmented-control';
import { useMyProperties } from '@/features/properties';
import type {
  Property,
  PropertyType,
  PropertyClass,
  PropertyStatus,
} from '@/shared/types/properties';

const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  townhouse: 'Таунхаус',
  commercial: 'Коммерция',
  land: 'Земля',
};

const CLASS_LABELS: Record<PropertyClass, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  premium: 'Премиум',
};

const STATUS_CONFIG: Record<PropertyStatus, { label: string; color: 'blue' | 'green' | 'gray' }> = {
  published: { label: 'Активный', color: 'green' },
  draft: { label: 'Черновик', color: 'gray' },
  archived: { label: 'Завершён', color: 'gray' },
};

function formatPrice(value: string, currency: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';

  const formatted = new Intl.NumberFormat('ru-RU').format(num);
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
    TRY: '₺',
  };
  return `${formatted} ${symbols[currency] ?? currency}`;
}

function formatDeadline(dateStr: string) {
  const date = new Date(dateStr);
  return 'до ' + date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ' г.';
}

function PropertyCard({ property }: { property: Property }) {
  const statusCfg = STATUS_CONFIG[property.status];

  return (
    <div className='flex flex-col rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {/* Header: Address + Type */}
      <div className='p-5 pb-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='truncate text-label-md text-text-strong-950'>
              {property.address}
            </div>
            <div className='mt-1 text-paragraph-sm text-text-sub-600'>
              {TYPE_LABELS[property.type]} · {CLASS_LABELS[property.property_class]}
            </div>
          </div>
          <button
            type='button'
            className='flex size-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50'
          >
            <RiMore2Line className='size-5' />
          </button>
        </div>
      </div>

      <div className='px-5 pt-4'>
        <Divider.Root />
      </div>

      {/* Status badge */}
      <div className='flex items-center gap-2 px-5 pt-4'>
        {/* <RiAuctionLine className='size-4 text-text-soft-400' /> */}
        <Badge.Root variant='lighter' color={statusCfg.color} size='medium'>
          {statusCfg.label}
        </Badge.Root>
      </div>

      {/* Stats: Area + Class */}
      <div className='grid grid-cols-2 gap-x-4 gap-y-3 px-5 pt-4'>
        <div>
          <div className='text-paragraph-sm text-text-sub-600'>Площадь</div>
          <div className='text-label-md text-text-strong-950'>{property.area} м²</div>
        </div>
        <div>
          <div className='text-paragraph-sm text-text-sub-600'>Класс</div>
          <div className='text-label-md text-text-strong-950'>{CLASS_LABELS[property.property_class]}</div>
        </div>
      </div>

      {/* Stats: Price */}
      <div className='grid grid-cols-2 gap-x-4 px-5 pt-3 pb-5'>
        <div>
          <div className='text-paragraph-sm text-text-sub-600'>Цена</div>
          <div className='text-label-md text-text-strong-950'>
            {formatPrice(property.price, property.currency)}
          </div>
        </div>
      </div>

      {/* Footer */}
      {property.deadline && (
        <>
          <div className='px-5'>
            <Divider.Root />
          </div>
          <div className='flex items-center gap-4 px-5 py-3.5 text-paragraph-sm text-text-sub-600'>
            <div className='flex items-center gap-1.5'>
              <RiTimeLine className='size-4 text-text-soft-400' />
              <span>{formatDeadline(property.deadline)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type Tab = 'active' | 'completed';

export default function AuctionsPage() {
  const [tab, setTab] = React.useState<Tab>('active');

  const statusFilter = tab === 'active' ? 'published' : 'archived';

  const { data, isLoading } = useMyProperties({
    status: statusFilter,
    ordering: '-created_at',
  });

  const properties = data?.results ?? [];

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      {/* Header */}
      <div>
        <div className='text-label-xl font-semibold text-text-strong-950'>
          Мои аукционы
        </div>
        <div className='mt-1 text-paragraph-sm text-text-sub-600'>
          Управление вашими объектами на торгах
        </div>
      </div>

      {/* Filter */}
      <SegmentedControl.Root
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        className='w-fit'
      >
        <SegmentedControl.List>
          <SegmentedControl.Trigger value='active'>
            Активные
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='completed'>
            Завершённые
          </SegmentedControl.Trigger>
        </SegmentedControl.List>
      </SegmentedControl.Root>

      {/* Content */}
      {isLoading ? (
        <div className='py-12 text-center text-paragraph-sm text-text-soft-400'>
          Загрузка...
        </div>
      ) : properties.length === 0 ? (
        <div className='py-12 text-center text-paragraph-sm text-text-soft-400'>
          {tab === 'active' ? 'Нет активных аукционов' : 'Нет завершённых аукционов'}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
