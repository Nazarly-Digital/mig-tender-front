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
import * as FancyButton from '@/shared/ui/fancy-button';
import { CardGridSkeleton } from '@/shared/components/skeletons';
import { useProperties } from '@/features/properties';
import { usePendingProperties, useApproveProperty, useRejectProperty } from '@/features/admin';
import { useSessionStore } from '@/entities/auth/model/store';
import type {
  Property,
  PropertyType,
  PropertyClass,
  PropertyStatus,
  PropertyListParams,
} from '@/shared/types/properties';

const STATUS_BADGE_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  active: 'bg-blue-50 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-emerald-50 text-emerald-700',
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
  approvingId,
  rejectingId,
}: {
  property: CatalogCardItem;
  showActions?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  approvingId?: number | null;
  rejectingId?: number | null;
}) {
  const badgeStyle = STATUS_BADGE_STYLES[property.status] || STATUS_BADGE_STYLES.draft;
  const moderationStyle = property.moderation_status
    ? MODERATION_BADGE_STYLES[property.moderation_status]
    : undefined;

  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden transition-all duration-150 hover:border-blue-200 hover:shadow-sm'>
      <Link href={`/objects/${property.id}`} className='block'>
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
                {TYPE_LABELS[property.type as PropertyType]}
              </span>
              {property.type !== 'land' && (
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500'>
                {CLASS_LABELS[property.property_class as PropertyClass]}
              </span>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className='mt-3 flex items-center gap-2 flex-wrap'>
            <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', badgeStyle)}>
              {STATUS_LABELS[property.status as PropertyStatus] ?? property.status}
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
                {formatPrice(property.price, property.currency)}
              </div>
            </div>
            <div>
              <div className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Площадь</div>
              <div className='text-[13px] font-medium text-gray-900 mt-1'>
                {property.area} {property.type === 'land' ? 'соток' : 'м²'}
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
      {showActions && (() => {
        const isThisApproving = approvingId === property.id;
        const isThisRejecting = rejectingId === property.id;
        const isThisCard = isThisApproving || isThisRejecting;
        const isOtherBusy = !isThisCard && (approvingId != null || rejectingId != null);
        return (
          <div className={cn('grid grid-cols-2 gap-2 border-t border-blue-50 px-5 py-3', isOtherBusy && 'pointer-events-none')}>
            <FancyButton.Root
              variant='primary'
              size='small'
              className='w-full'
              onClick={() => onApprove?.(property.id)}
              disabled={isThisRejecting}
            >
              <HugeiconsIcon icon={Tick01Icon} size={16} />
              {isThisApproving ? 'Одобрение...' : 'Одобрить'}
            </FancyButton.Root>
            <FancyButton.Root
              variant='basic'
              size='small'
              className='w-full'
              onClick={() => onReject?.(property.id)}
              disabled={isThisApproving}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
              {isThisRejecting ? 'Отклонение...' : 'Отклонить'}
            </FancyButton.Root>
          </div>
        );
      })()}
    </div>
  );
}

function useFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('page_size')) || 20;
  const search = searchParams.get('search') ?? '';
  const typeFilter = searchParams.get('type') ?? 'all';
  const classFilter = searchParams.get('class') ?? 'all';
  const moderationFilter = searchParams.get('moderation') ?? 'all';

  const setParam = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === '1') || (key === 'page_size' && value === '20')) {
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
  const user = useSessionStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.is_admin === true;
  const { page, pageSize, search, typeFilter, classFilter, moderationFilter, setParam } = useFilterParams();

  // Debounced search input — local state for display, URL updated after 400ms idle
  const [searchInput, setSearchInput] = React.useState(search);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input if URL changes externally (e.g. browser back/forward)
  React.useEffect(() => { setSearchInput(search); }, [search]);

  React.useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam({ search: value, page: null }), 400);
  };

  // Unified handler for the 3 select filters
  const handleSelectChange = (key: 'type' | 'class' | 'moderation', value: string) => {
    setParam({ [key]: value, page: null });
  };

  const isPendingMode = isAdmin && moderationFilter === 'pending';
  const isAllMode = isAdmin && moderationFilter === 'all';

  const params: PropertyListParams = {
    page,
    page_size: pageSize,
    ...(search && { address: search }),
    ...(typeFilter !== 'all' && { type: typeFilter as PropertyType }),
    ...(classFilter !== 'all' && { property_class: classFilter as PropertyClass }),
    ordering: '-created_at',
  };

  const pendingParams = {
    page,
    page_size: pageSize,
    ...(search && { address: search }),
    ...(typeFilter !== 'all' && { type: typeFilter }),
    ...(classFilter !== 'all' && { property_class: classFilter }),
    ordering: '-created_at',
  };

  // Fetch published properties (always except pending-only mode)
  const propertiesQuery = useProperties(params, { enabled: !isPendingMode });
  // Fetch pending properties (for admin: pending mode OR all mode)
  const pendingQuery = usePendingProperties(pendingParams, { enabled: isPendingMode || isAllMode });

  const approve = useApproveProperty();
  const reject = useRejectProperty();
  const [approvingId, setApprovingId] = React.useState<number | null>(null);
  const [rejectingId, setRejectingId] = React.useState<number | null>(null);

  const handleApprove = (id: number) => {
    setApprovingId(id);
    approve.mutate(id, {
      onSuccess: () => toast.success('Объект одобрен'),
      onSettled: () => setApprovingId(null),
    });
  };

  const handleReject = (id: number) => {
    setRejectingId(id);
    reject.mutate(
      { id },
      {
        onSuccess: () => toast.success('Объект отклонён'),
        onSettled: () => setRejectingId(null),
      },
    );
  };

  const isLoading = isPendingMode
    ? pendingQuery.isLoading
    : isAllMode
      ? propertiesQuery.isLoading || pendingQuery.isLoading
      : propertiesQuery.isLoading;

  let properties: CatalogCardItem[];
  let totalPages: number;

  if (isPendingMode) {
    const pendingData = pendingQuery.data;
    properties = Array.isArray(pendingData) ? pendingData : pendingData?.results ?? [];
    const count = Array.isArray(pendingData) ? pendingData.length : pendingData?.count ?? 0;
    totalPages = Math.ceil(count / pageSize);
  } else if (isAllMode) {
    // Merge published + pending, deduplicate by id
    const published = propertiesQuery.data?.results ?? [];
    const pendingData = pendingQuery.data;
    const pending: CatalogCardItem[] = Array.isArray(pendingData) ? pendingData : pendingData?.results ?? [];
    const publishedIds = new Set(published.map((p) => p.id));
    const merged = [...published, ...pending.filter((p) => !publishedIds.has(p.id))];
    properties = merged;
    const publishedCount = propertiesQuery.data?.count ?? 0;
    const pendingCount = Array.isArray(pendingData) ? pendingData.length : pendingData?.count ?? 0;
    totalPages = Math.ceil((publishedCount + pendingCount) / pageSize);
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
            value={searchInput}
            onChange={handleSearchChange}
            className='h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[13px] placeholder:text-gray-400 focus:border-blue-300 focus:outline-none transition-colors'
          />
        </div>

        <div className='w-[140px] shrink-0'>
          <Select.Root size='small' value={typeFilter} onValueChange={(v) => handleSelectChange('type', v)}>
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
          <Select.Root size='small' value={classFilter} onValueChange={(v) => handleSelectChange('class', v)}>
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

        {/* Admin-only: moderation filter */}
        {isAdmin && (
          <div className='w-[170px] shrink-0'>
            <Select.Root size='small' value={moderationFilter} onValueChange={(v) => handleSelectChange('moderation', v)}>
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
          <CardGridSkeleton count={4} />
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
                  approvingId={approvingId}
                  rejectingId={rejectingId}
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
