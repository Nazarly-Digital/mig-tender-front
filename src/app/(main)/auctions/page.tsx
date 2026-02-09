'use client';

import * as React from 'react';
import {
  RiAuctionLine,
  RiMore2Line,
  RiTimeLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
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
  published: { label: 'Активный', color: 'blue' },
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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PropertyCard({ property }: { property: Property }) {
  const statusCfg = STATUS_CONFIG[property.status];

  return (
    <div className='flex flex-col gap-4 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {/* Header */}
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='text-label-sm text-text-strong-950'>
            {property.address}
          </div>
          <div className='mt-0.5 text-paragraph-xs text-text-sub-600'>
            {TYPE_LABELS[property.type]} · {CLASS_LABELS[property.property_class]}
          </div>
        </div>
        <button
          type='button'
          className='flex size-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50'
        >
          <RiMore2Line className='size-5' />
        </button>
      </div>

      {/* Status */}
      <div className='flex items-center gap-2'>
        <RiAuctionLine className='size-4 text-text-soft-400' />
        <Badge.Root variant='lighter' color={statusCfg.color} size='medium'>
          {statusCfg.label}
        </Badge.Root>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-y-3 gap-x-4'>
        <div>
          <div className='text-paragraph-xs text-text-soft-400'>Площадь</div>
          <div className='text-label-sm text-text-strong-950'>
            {property.area} м²
          </div>
        </div>
        <div>
          <div className='text-paragraph-xs text-text-soft-400'>Класс</div>
          <div className='text-label-sm text-text-strong-950'>
            {CLASS_LABELS[property.property_class]}
          </div>
        </div>
        <div>
          <div className='text-paragraph-xs text-text-soft-400'>Цена</div>
          <div className='text-label-sm text-text-strong-950'>
            {formatPrice(property.price, property.currency)}
          </div>
        </div>
        <div>
          <div className='text-paragraph-xs text-text-soft-400'>Валюта</div>
          <div className='text-label-sm text-text-strong-950'>
            {property.currency}
          </div>
        </div>
      </div>

      {/* Footer */}
      {property.deadline && (
        <div className='flex items-center gap-4 border-t border-stroke-soft-200 pt-3 text-paragraph-xs text-text-soft-400'>
          <span className='flex items-center gap-1'>
            <RiTimeLine className='size-3.5' />
            до {formatDate(property.deadline)}
          </span>
        </div>
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
  const count = data?.count ?? 0;

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
            {/* {count > 0 && tab === 'active' ? `(${count})` : ''} */}
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
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
