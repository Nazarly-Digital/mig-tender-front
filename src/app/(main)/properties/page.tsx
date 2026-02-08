'use client';

import * as React from 'react';
import {
  RiAddLine,
  RiBuilding2Line,
  RiSearch2Line,
} from '@remixicon/react';

import * as Button from '@/shared/ui/button';
import * as Input from '@/shared/ui/input';
import * as Select from '@/shared/ui/select';
import * as Kbd from '@/shared/ui/kbd';
import {
  PropertiesTable,
  PropertiesTablePagination,
  TYPE_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import { PropertyFormModal } from '@/shared/components/property-form-modal';
import {
  useMyProperties,
  useCreateProperty,
  useUpdateProperty,
} from '@/features/properties';
import type {
  Property,
  PropertyType,
  PropertyStatus,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyListParams,
} from '@/shared/types/properties';

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
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();

  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;

  const handleCreate = () => {
    setEditingProperty(null);
    setModalOpen(true);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setModalOpen(true);
  };

  const handleSubmit = (formData: PropertyCreateRequest | PropertyUpdateRequest) => {
    if (editingProperty) {
      updateMutation.mutate(
        { id: editingProperty.id, data: formData },
        {
          onSuccess: () => setModalOpen(false),
        },
      );
    } else {
      createMutation.mutate(formData as PropertyCreateRequest, {
        onSuccess: () => setModalOpen(false),
      });
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

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      {/* Header */}
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
        <div className='flex flex-1 items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
            <RiBuilding2Line className='size-5 text-text-sub-600' />
          </div>
          <div>
            <div className='text-label-sm text-text-strong-950'>
              Мои объекты
            </div>
            <div className='mt-1 text-paragraph-xs text-text-sub-600'>
              Управление объектами недвижимости
            </div>
          </div>
        </div>
        <Button.Root size='small' onClick={handleCreate}>
          <Button.Icon as={RiAddLine} />
          Добавить объект
        </Button.Root>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3 -translate-x-3 lg:flex-row lg:items-center max-w-[300px]'>
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

      {/* Table */}
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <div className='text-paragraph-sm text-text-soft-400'>
            Загрузка...
          </div>
        </div>
      ) : (
        <>
          <PropertiesTable
            data={data?.results ?? []}
            onEdit={handleEdit}
          />
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
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
