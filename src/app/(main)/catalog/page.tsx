'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Image01Icon,
  Building03Icon,
} from '@hugeicons/core-free-icons';

import * as Select from '@/shared/ui/select';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import {
  PropertiesTablePagination,
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import { useProperties } from '@/features/properties';
import type {
  Property,
  PropertyType,
  PropertyClass,
  PropertyListParams,
} from '@/shared/types/properties';

const STATUS_BADGE_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  active: 'bg-blue-50 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
};

function PropertyImageCarousel({ images }: { images: Property['images'] }) {
  const [current, setCurrent] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className='flex h-44 items-center justify-center bg-gray-50 rounded-t-xl'>
        <HugeiconsIcon icon={Image01Icon} size={32} className='text-gray-400' />
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };

  return (
    <div className='group/carousel relative h-44 overflow-hidden bg-gray-50 rounded-t-xl'>
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
            className='absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover/carousel:opacity-100'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className='text-gray-900' />
          </button>
          <button
            type='button'
            onClick={next}
            className='absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover/carousel:opacity-100'
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} className='text-gray-900' />
          </button>

          <div className='absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1'>
            {images.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CatalogPropertyCard({ property }: { property: Property }) {
  const badgeStyle = STATUS_BADGE_STYLES[property.status] || STATUS_BADGE_STYLES.draft;

  return (
    <Link href={`/catalog/${property.id}`} className='block'>
      <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden transition-all duration-150 hover:border-blue-200 hover:shadow-sm'>
        {/* Carousel */}
        <PropertyImageCarousel images={property.images} />

        <div className='p-5'>
          {/* Header */}
          <div className='min-w-0'>
            <div className='text-[14px] font-medium text-gray-900 truncate'>
              {property.address}
            </div>
            <div className='flex items-center gap-1.5 mt-2'>
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500'>
                {TYPE_LABELS[property.type]}
              </span>
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500'>
                {CLASS_LABELS[property.property_class]}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className='mt-3'>
            <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', badgeStyle)}>
              {STATUS_LABELS[property.status]}
            </span>
          </div>

          {/* Details grid */}
          <div className='mt-4 pt-4 border-t border-blue-50 grid grid-cols-2 gap-x-4 gap-y-3'>
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Цена</div>
              <div className='text-[13px] font-medium text-gray-900 mt-1'>
                {formatPrice(property.price)} {property.currency}
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
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Создан</div>
              <div className='text-[13px] font-medium text-gray-900 mt-1'>
                {formatDateShort(property.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(12);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [classFilter, setClassFilter] = React.useState<string>('all');

  const params: PropertyListParams = {
    page,
    page_size: pageSize,
    ...(search && { address: search }),
    ...(typeFilter !== 'all' && { type: typeFilter as PropertyType }),
    ...(classFilter !== 'all' && { property_class: classFilter as PropertyClass }),
    ordering: '-created_at',
  };

  const { data, isLoading } = useProperties(params);

  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;
  const properties = data?.results ?? [];

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Каталог объектов</h1>
        <p className='mt-1 text-sm text-gray-500'>Объекты недвижимости, доступные для аукционов</p>
      </div>

      {/* Filters */}
      <div className='mt-6 flex items-center gap-2'>
        <div className='relative min-w-0 flex-1'>
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
          <input
            type='text'
            placeholder='Поиск по адресу...'
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className='h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[13px] placeholder:text-gray-400 focus:border-blue-300 focus:outline-none transition-colors'
          />
        </div>

        <div className='w-[140px] shrink-0'>
          <Select.Root size='small' value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <Select.Trigger className='h-9 w-full'>
              <Select.Value placeholder='Тип' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>Все типы</Select.Item>
              {(Object.entries(TYPE_LABELS) as [PropertyType, string][]).map(([value, label]) => (
                <Select.Item key={value} value={value}>{label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div className='w-[140px] shrink-0'>
          <Select.Root size='small' value={classFilter} onValueChange={(v) => { setClassFilter(v); setPage(1); }}>
            <Select.Trigger className='h-9 w-full'>
              <Select.Value placeholder='Класс' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>Все классы</Select.Item>
              {(Object.entries(CLASS_LABELS) as [PropertyClass, string][]).map(([value, label]) => (
                <Select.Item key={value} value={value}>{label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {/* Content */}
      <div className='mt-6'>
        {isLoading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='text-sm text-gray-400'>Загрузка...</div>
          </div>
        ) : properties.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 py-20'>
            <div className='flex size-12 items-center justify-center rounded-xl bg-gray-50'>
              <HugeiconsIcon icon={Building03Icon} size={24} className='text-gray-400' />
            </div>
            <div className='text-center'>
              <div className='text-base font-semibold text-gray-900'>
                Объекты не найдены
              </div>
              <div className='mt-1 max-w-[360px] text-sm text-gray-500'>
                Попробуйте изменить фильтры
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {properties.map((property) => (
                <CatalogPropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
            <PropertiesTablePagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
