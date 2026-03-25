'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Image01Icon,
  Delete01Icon,
  Building03Icon,
} from '@hugeicons/core-free-icons';

import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import * as Select from '@/shared/ui/select';
import { cn } from '@/shared/lib/cn';
import {
  PropertiesTablePagination,
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
  STATUS_MAP,
} from '@/shared/components/properties-table';
import { CardGridSkeleton } from '@/shared/components/skeletons';
import {
  useMyProperties,
  useDeleteProperty,
} from '@/features/properties';
import type {
  Property,
  PropertyType,
  PropertyClass,
  PropertyStatus,
  PropertyListParams,
} from '@/shared/types/properties';

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽', TRY: '₺' };

function formatPrice(value: string, currency?: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '\u2014';
  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? currency) : '';
  return new Intl.NumberFormat('ru-RU').format(num) + (symbol ? ` ${symbol}` : '');
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  active: 'bg-blue-50 text-blue-700',
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  sold: 'bg-blue-50 text-blue-700',
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
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
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
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
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

function PropertyCard({
  property,
  onDelete,
}: {
  property: Property;
  onDelete: (p: Property) => void;
}) {
  const badgeStyle = STATUS_BADGE_STYLES[property.status] || STATUS_BADGE_STYLES.draft;

  return (
    <Link
      href={`/properties/${property.id}`}
      className='group block overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'
    >
      {/* Image with overlays */}
      <div className='relative'>
        <PropertyImageCarousel images={property.images} />
        {/* Type/Class badges on photo */}
        <div className='absolute left-3 top-3 flex gap-1.5'>
          <span className='rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 backdrop-blur-sm shadow-sm'>
            {TYPE_LABELS[property.type]}
          </span>
          <span className='rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 backdrop-blur-sm shadow-sm'>
            {CLASS_LABELS[property.property_class]}
          </span>
        </div>
        {/* Price overlay */}
        <div className='absolute left-3 bottom-3 rounded-md bg-black/60 px-2 py-1 text-[13px] font-bold text-white backdrop-blur-sm'>
          {formatPrice(property.price, property.currency)}
        </div>
        {/* Delete on hover */}
        <div className='absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            type='button'
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(property); }}
            className='size-7 rounded-md bg-white/80 flex items-center justify-center text-gray-600 backdrop-blur-sm hover:bg-white hover:text-red-500 transition-colors'
          >
            <HugeiconsIcon icon={Delete01Icon} size={14} />
          </button>
        </div>
      </div>
      {/* Footer */}
      <div className='px-4 py-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-[14px] font-semibold text-gray-900 truncate'>{property.address}</h3>
          <span className={cn('inline-flex items-center gap-1 shrink-0 ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium', badgeStyle)}>
            {STATUS_LABELS[property.status]}
          </span>
        </div>
        <span className='mt-1 block text-[12px] text-gray-400'>
          {property.area} м² · до {formatDate(property.deadline)}
        </span>
      </div>
    </Link>
  );
}

export default function PropertiesPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [classFilter, setClassFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingProperty, setDeletingProperty] = React.useState<Property | null>(null);

  const params: PropertyListParams = {
    page,
    page_size: pageSize,
    ...(search && { address: search }),
    ...(typeFilter !== 'all' && { type: typeFilter as PropertyType }),
    ...(classFilter !== 'all' && { property_class: classFilter as PropertyClass }),
    ...(statusFilter !== 'all' && { status: statusFilter as PropertyStatus }),
    ordering: '-created_at',
  };

  const { data, isLoading } = useMyProperties(params);
  const deleteMutation = useDeleteProperty();

  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;

  const handleDeleteClick = (property: Property) => {
    setDeletingProperty(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingProperty) return;
    deleteMutation.mutate(deletingProperty.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeletingProperty(null);
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, typeFilter, classFilter, statusFilter]);

  const properties = data?.results ?? [];

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Мои объекты</h1>
          <p className='mt-1 text-sm text-gray-500'>Управление объектами недвижимости</p>
        </div>
        <Link href='/properties/create'>
          <FancyButton.Root variant='primary' size='small'>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            Создать объект
          </FancyButton.Root>
        </Link>
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
            onChange={(e) => setSearch(e.target.value)}
            className='h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[13px] placeholder:text-gray-400 focus:border-blue-300 focus:outline-none transition-colors'
          />
        </div>

        <div className='w-[140px] shrink-0'>
          <Select.Root size='small' value={typeFilter} onValueChange={setTypeFilter}>
            <Select.Trigger className='h-9 w-full cursor-pointer'>
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
          <Select.Root size='small' value={classFilter} onValueChange={setClassFilter}>
            <Select.Trigger className='h-9 w-full cursor-pointer'>
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

        <div className='w-[150px] shrink-0'>
          <Select.Root size='small' value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger className='h-9 w-full cursor-pointer'>
              <Select.Value placeholder='Статус' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>Все статусы</Select.Item>
              {(Object.entries(STATUS_LABELS) as [PropertyStatus, string][]).map(([value, label]) => (
                <Select.Item key={value} value={value}>{label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {/* Content */}
      <div className='mt-6'>
        {isLoading ? (
          <CardGridSkeleton count={8} />
        ) : properties.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 py-20'>
            <div className='flex size-12 items-center justify-center rounded-xl bg-gray-50'>
              <HugeiconsIcon icon={Building03Icon} size={24} className='text-gray-400' />
            </div>
            <div className='text-center'>
              <div className='text-base font-semibold text-gray-900'>
                Объекты не найдены
              </div>
              <div className='mt-1 text-sm text-gray-500'>
                Попробуйте изменить фильтры или создайте новый объект
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
            <PropertiesTablePagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Modal.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Modal.Content>
          <Modal.Header
            title='Удалить объект'
            description={`Вы уверены, что хотите удалить \u00AB${deletingProperty?.address}\u00BB? Это действие нельзя отменить.`}
          />
          <Modal.Footer>
            <FancyButton.Root
              variant='basic'
              size='small'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Отмена
            </FancyButton.Root>
            <FancyButton.Root
              variant='destructive'
              size='small'
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
