'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  RiAddLine,
  RiBuilding2Line,
  RiPencilLine,
  RiSearch2Line,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as CompactButton from '@/shared/ui/compact-button';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Select from '@/shared/ui/select';
import * as StatusBadge from '@/shared/ui/status-badge';
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
import { PropertyFormModal } from '@/shared/components/property-form-modal';
import {
  useMyProperties,
  useUpdateProperty,
} from '@/features/properties';
import type {
  Property,
  PropertyType,
  PropertyStatus,
  PropertyUpdateRequest,
  PropertyListParams,
} from '@/shared/types/properties';

function formatPrice(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function PropertyCard({
  property,
  onEdit,
}: {
  property: Property;
  onEdit: (p: Property) => void;
}) {
  return (
    <div className='flex flex-col rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {/* Header */}
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
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
        <CompactButton.Root
          variant='ghost'
          size='medium'
          onClick={() => onEdit(property)}
        >
          <CompactButton.Icon as={RiPencilLine} />
        </CompactButton.Root>
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
            {formatDate(property.deadline)}
          </div>
        </div>
        <div>
          <div className='text-subheading-2xs uppercase text-text-soft-400'>Создан</div>
          <div className='mt-0.5 text-label-sm text-text-strong-950'>
            {formatDate(property.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState<Property | null>(
    null,
  );

  const params: PropertyListParams = {
    page,
    page_size: pageSize,
    ...(search && { address: search }),
    ...(typeFilter !== 'all' && { type: typeFilter as PropertyType }),
    ...(statusFilter !== 'all' && { status: statusFilter as PropertyStatus }),
    ordering: '-created_at',
  };

  const { data, isLoading } = useMyProperties(params);
  const updateMutation = useUpdateProperty();

  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setModalOpen(true);
  };

  const handleSubmit = (formData: PropertyUpdateRequest) => {
    if (editingProperty) {
      updateMutation.mutate(
        { id: editingProperty.id, data: formData },
        {
          onSuccess: () => setModalOpen(false),
        },
      );
    }
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
  }, [search, typeFilter, statusFilter]);

  const properties = data?.results ?? [];

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title='Мои объекты'
        description='Управление объектами недвижимости'
        icon={RiBuilding2Line}
        action={
          <Link href='/properties/create'>
            <FancyButton.Root variant='primary' size='xsmall'>
              <FancyButton.Icon as={RiAddLine} />
              Создать объект
            </FancyButton.Root>
          </Link>
        }
      />

      {/* Filters */}
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
        <Input.Root size='small' className='max-w-lg lg:w-[280px]'>
          <Input.Wrapper>
            <Input.Icon as={RiSearch2Line} />
            <Input.Input
              placeholder='Поиск по адресу...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Input.Wrapper>
        </Input.Root>

        <div className='flex items-center gap-2'>
          <Select.Root
            size='small'
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <Select.Trigger className='w-auto min-w-[140px]'>
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
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <Select.Trigger className='w-auto min-w-[160px]'>
              <Select.Value placeholder='Статус' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>Все статусы</Select.Item>
              {(
                Object.entries(STATUS_LABELS) as [PropertyStatus, string][]
              ).map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
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
              Попробуйте изменить фильтры или создайте новый объект
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEdit}
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
        </>
      )}

      {/* Modal */}
      <PropertyFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        property={editingProperty}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
