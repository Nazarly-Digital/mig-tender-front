'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBuilding2Line,
  RiImageLine,
  RiSearch2Line,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Divider from '@/shared/ui/divider';
import * as Input from '@/shared/ui/input';
import * as Select from '@/shared/ui/select';
import * as StatusBadge from '@/shared/ui/status-badge';
import { cn } from '@/shared/lib/cn';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import { PageHeader } from '@/shared/components/page-header';
import {
  PropertiesTablePagination,
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
  STATUS_MAP,
  TYPE_COLORS,
  CLASS_COLORS,
} from '@/shared/components/properties-table';
import { useProperties } from '@/features/properties';
import type {
  Property,
  PropertyType,
  PropertyClass,
  PropertyListParams,
} from '@/shared/types/properties';

function PropertyImageCarousel({ images }: { images: Property['images'] }) {
  const [current, setCurrent] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className='flex h-44 items-center justify-center rounded-xl bg-bg-weak-50'>
        <RiImageLine className='size-8 text-text-soft-400' />
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
    <div className='group relative h-44 overflow-hidden rounded-xl bg-bg-weak-50'>
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
            className='absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-bg-white-0/80 opacity-0 shadow-regular-xs transition-opacity group-hover:opacity-100'
          >
            <RiArrowLeftSLine className='size-4 text-text-strong-950' />
          </button>
          <button
            type='button'
            onClick={next}
            className='absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-bg-white-0/80 opacity-0 shadow-regular-xs transition-opacity group-hover:opacity-100'
          >
            <RiArrowRightSLine className='size-4 text-text-strong-950' />
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
  return (
    <Link href={`/catalog/${property.id}`} className='block'>
      <div className='flex flex-col rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 transition-shadow hover:shadow-regular-md'>
        {/* Carousel */}
        <div className='p-2 pb-0'>
          <PropertyImageCarousel images={property.images} />
        </div>

        <div className='flex flex-col p-5 pt-4'>
          {/* Header */}
          <div className='min-w-0'>
            <div className='truncate text-label-md text-text-strong-950'>
              {property.address}
            </div>
            <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
              <Badge.Root variant='lighter' color={TYPE_COLORS[property.type]} size='small'>
                {TYPE_LABELS[property.type]}
              </Badge.Root>
              <Badge.Root variant='lighter' color={CLASS_COLORS[property.property_class]} size='small'>
                {CLASS_LABELS[property.property_class]}
              </Badge.Root>
            </div>
          </div>

          <Divider.Root variant='line-spacing' className='my-0 py-3' />

          {/* Status */}
          <div>
            <StatusBadge.Root variant='light' status={STATUS_MAP[property.status]}>
              <StatusBadge.Dot />
              {STATUS_LABELS[property.status]}
            </StatusBadge.Root>
          </div>

          {/* Details grid */}
          <div className='mt-4 grid grid-cols-2 gap-x-4 gap-y-3'>
            <div>
              <div className='text-subheading-2xs uppercase text-text-soft-400'>Цена</div>
              <div className='mt-0.5 text-label-sm text-text-strong-950'>
                {formatPrice(property.price)} {property.currency}
              </div>
            </div>
            <div>
              <div className='text-subheading-2xs uppercase text-text-soft-400'>Площадь</div>
              <div className='mt-0.5 text-label-sm text-text-strong-950'>
                {property.area} м²
              </div>
            </div>
            <div>
              <div className='text-subheading-2xs uppercase text-text-soft-400'>Дедлайн</div>
              <div className='mt-0.5 text-label-sm text-text-strong-950'>
                {formatDateShort(property.deadline)}
              </div>
            </div>
            <div>
              <div className='text-subheading-2xs uppercase text-text-soft-400'>Создан</div>
              <div className='mt-0.5 text-label-sm text-text-strong-950'>
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
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title='Каталог объектов'
        description='Объекты недвижимости, доступные для аукционов'
        icon={RiBuilding2Line}
      />

      {/* Filters */}
      <div className='flex flex-col gap-2'>
        <Input.Root size='small'>
          <Input.Wrapper>
            <Input.Icon as={RiSearch2Line} />
            <Input.Input
              placeholder='Поиск по адресу...'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </Input.Wrapper>
        </Input.Root>

        <div className='flex flex-wrap gap-2'>
          <Select.Root
            size='small'
            value={typeFilter}
            onValueChange={(v) => { setTypeFilter(v); setPage(1); }}
          >
            <Select.Trigger className='flex-1 sm:flex-none'>
              <Select.Value placeholder='Тип' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>Все типы</Select.Item>
              {(Object.entries(TYPE_LABELS) as [PropertyType, string][]).map(
                ([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ),
              )}
            </Select.Content>
          </Select.Root>

          <Select.Root
            size='small'
            value={classFilter}
            onValueChange={(v) => { setClassFilter(v); setPage(1); }}
          >
            <Select.Trigger className='flex-1 sm:flex-none'>
              <Select.Value placeholder='Класс' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>Все классы</Select.Item>
              {(Object.entries(CLASS_LABELS) as [PropertyClass, string][]).map(
                ([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ),
              )}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <div className='text-paragraph-sm text-text-soft-400'>
            Загрузка...
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20'>
          <div className='flex size-12 items-center justify-center rounded-full bg-bg-weak-50'>
            <RiBuilding2Line className='size-6 text-text-soft-400' />
          </div>
          <div className='text-center'>
            <div className='text-label-sm text-text-sub-600'>
              Объекты не найдены
            </div>
            <div className='mt-1 text-paragraph-xs text-text-soft-400'>
              Попробуйте изменить фильтры
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
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
        </>
      )}
    </div>
  );
}
