'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Image01Icon,
  Building03Icon,
  Tick01Icon,
  Cancel01Icon,
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
import toast from 'react-hot-toast';
import { CardGridSkeleton } from '@/shared/components/skeletons';
import { useProperties } from '@/features/properties';
import { usePendingProperties, useApproveProperty, useRejectProperty } from '@/features/admin';
import { useSessionStore } from '@/entities/auth/model/store';
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
  published: 'bg-blue-50 text-blue-700',
  archived: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
};

const MODERATION_BADGE_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
};

const MODERATION_LABELS: Record<string, string> = {
  pending: 'На модерации',
  approved: 'Одобрен',
  rejected: 'Отклонён',
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

type CatalogCardItem = {
  id: number;
  address: string;
  type: string;
  property_class: string;
  status: string;
  price: string;
  currency: string;
  area: string;
  deadline?: string | null;
  created_at: string;
  images?: Property['images'];
  developer_name?: string;
  moderation_status?: string;
};

function CatalogPropertyCard({
  property,
  showActions,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  property: CatalogCardItem;
  showActions?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}) {
  const badgeStyle = STATUS_BADGE_STYLES[property.status] || STATUS_BADGE_STYLES.draft;
  const moderationStyle = property.moderation_status
    ? MODERATION_BADGE_STYLES[property.moderation_status]
    : undefined;

  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden transition-all duration-150 hover:border-blue-200 hover:shadow-sm'>
      <Link href={`/catalog/${property.id}`} className='block'>
        {/* Carousel */}
        <PropertyImageCarousel images={property.images ?? []} />

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

          {/* Status badges */}
          <div className='mt-3 flex items-center gap-2 flex-wrap'>
            <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', badgeStyle)}>
              {STATUS_LABELS[property.status] ?? property.status}
            </span>
            {property.moderation_status && moderationStyle && (
              <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', moderationStyle)}>
                {MODERATION_LABELS[property.moderation_status] ?? property.moderation_status}
              </span>
            )}
            {property.developer_name && (
              <span className='text-[11px] text-gray-400 truncate'>
                {property.developer_name}
              </span>
            )}
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
            {property.deadline && (
              <div>
                <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Дедлайн</div>
                <div className='text-[13px] font-medium text-gray-900 mt-1'>
                  {formatDateShort(property.deadline)}
                </div>
              </div>
            )}
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Создан</div>
              <div className='text-[13px] font-medium text-gray-900 mt-1'>
                {formatDateShort(property.created_at)}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Admin approve/reject actions — only for pending */}
      {showActions && (
        <div className='flex items-center gap-2 border-t border-blue-50 px-5 py-3'>
          <button
            type='button'
            onClick={() => onApprove?.(property.id)}
            disabled={isApproving || isRejecting}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50'
          >
            <HugeiconsIcon icon={Tick01Icon} size={16} color='currentColor' strokeWidth={1.5} />
            {isApproving ? 'Одобрение...' : 'Одобрить'}
          </button>
          <button
            type='button'
            onClick={() => onReject?.(property.id)}
            disabled={isApproving || isRejecting}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50'
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} color='currentColor' strokeWidth={1.5} />
            {isRejecting ? 'Отклонение...' : 'Отклонить'}
          </button>
        </div>
      )}
    </div>
  );
}

function useFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('page_size')) || 12;
  const search = searchParams.get('search') ?? '';
  const typeFilter = searchParams.get('type') ?? 'all';
  const classFilter = searchParams.get('class') ?? 'all';
  const moderationFilter = searchParams.get('moderation') ?? 'all';

  const setParam = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === '1') || (key === 'page_size' && value === '12')) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '/objects', { scroll: false });
    },
    [router, searchParams],
  );

  return { page, pageSize, search, typeFilter, classFilter, moderationFilter, setParam };
}

export default function CatalogPage() {
  const isAdmin = useSessionStore((s) => s.user?.role === 'admin');
  const { page, pageSize, search, typeFilter, classFilter, moderationFilter, setParam } = useFilterParams();

  const isPendingMode = isAdmin && moderationFilter === 'pending';

  const params: PropertyListParams = {
    page,
    page_size: pageSize,
    ...(search && { address: search }),
    ...(typeFilter !== 'all' && { type: typeFilter as PropertyType }),
    ...(classFilter !== 'all' && { property_class: classFilter as PropertyClass }),
    ordering: '-created_at',
  };

  // Default: /properties/ for all users (including admin)
  // When admin selects "pending" filter: /admin/properties/pending/
  const propertiesQuery = useProperties(params, { enabled: !isPendingMode });
  const pendingQuery = usePendingProperties(
    { ordering: '-created_at', page, page_size: pageSize },
    { enabled: isPendingMode },
  );

  const approve = useApproveProperty();
  const reject = useRejectProperty();

  const handleApprove = (id: number) => {
    approve.mutate(id, {
      onSuccess: () => toast.success('Объект одобрен'),
      onError: () => toast.error('Ошибка при одобрении'),
    });
  };

  const handleReject = (id: number) => {
    reject.mutate(
      { id },
      {
        onSuccess: () => toast.success('Объект отклонён'),
        onError: () => toast.error('Ошибка при отклонении'),
      },
    );
  };

  const isLoading = isPendingMode ? pendingQuery.isLoading : propertiesQuery.isLoading;

  let properties: CatalogCardItem[];
  let totalPages: number;

  if (isPendingMode) {
    const pendingData = pendingQuery.data;
    properties = Array.isArray(pendingData) ? pendingData : pendingData?.results ?? [];
    const count = Array.isArray(pendingData) ? pendingData.length : pendingData?.count ?? 0;
    totalPages = Math.ceil(count / pageSize);
  } else {
    const propData = propertiesQuery.data;
    properties = propData?.results ?? [];
    totalPages = propData ? Math.ceil(propData.count / pageSize) : 0;
  }

  // Page title depends on role
  const pageTitle = isAdmin ? 'Объекты' : 'Каталог объектов';
  const pageDescription = isAdmin
    ? 'Все объекты недвижимости в системе'
    : 'Объекты недвижимости, доступные для аукционов';

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>{pageTitle}</h1>
        <p className='mt-1 text-sm text-gray-500'>{pageDescription}</p>
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
            onChange={(e) => { setParam({ search: e.target.value, page: null }); }}
            className='h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[13px] placeholder:text-gray-400 focus:border-blue-300 focus:outline-none transition-colors'
          />
        </div>

        <div className='w-[140px] shrink-0'>
          <Select.Root size='small' value={typeFilter} onValueChange={(v) => { setParam({ type: v, page: null }); }}>
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
          <Select.Root size='small' value={classFilter} onValueChange={(v) => { setParam({ class: v, page: null }); }}>
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

        {/* Admin-only: moderation filter */}
        {isAdmin && (
          <div className='w-[170px] shrink-0'>
            <Select.Root size='small' value={moderationFilter} onValueChange={(v) => { setParam({ moderation: v, page: null }); }}>
              <Select.Trigger className='h-9 w-full'>
                <Select.Value placeholder='Модерация' />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='all'>Все объекты</Select.Item>
                <Select.Item value='pending'>На модерации</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='mt-6'>
        {isLoading ? (
          <CardGridSkeleton count={12} />
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
                  showActions={isPendingMode}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isApproving={approve.isPending}
                  isRejecting={reject.isPending}
                />
              ))}
            </div>
            <PropertiesTablePagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={(p) => setParam({ page: String(p) })}
              onPageSizeChange={(size) => { setParam({ page_size: String(size), page: null }); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
