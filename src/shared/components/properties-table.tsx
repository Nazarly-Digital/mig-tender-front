'use client';

import * as React from 'react';
import {
  RiArrowDownSFill,
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiMore2Line,
  RiPencilLine,
} from '@remixicon/react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Column,
  type Row,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    className?: string;
  }
}

import { cn } from '@/shared/lib/cn';
import * as Badge from '@/shared/ui/badge';
import * as Button from '@/shared/ui/button';
import * as Checkbox from '@/shared/ui/checkbox';
import * as Pagination from '@/shared/ui/pagination';
import * as Select from '@/shared/ui/select';
import * as StatusBadge from '@/shared/ui/status-badge';
import * as Table from '@/shared/ui/table';
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

const TYPE_COLORS: Record<PropertyType, 'blue' | 'green' | 'purple' | 'orange' | 'teal'> = {
  apartment: 'blue',
  house: 'green',
  townhouse: 'purple',
  commercial: 'orange',
  land: 'teal',
};

const CLASS_LABELS: Record<PropertyClass, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  premium: 'Премиум',
};

const CLASS_COLORS: Record<PropertyClass, 'gray' | 'blue' | 'purple' | 'orange'> = {
  economy: 'gray',
  comfort: 'blue',
  business: 'purple',
  premium: 'orange',
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликован',
  archived: 'Архив',
};

const STATUS_MAP: Record<PropertyStatus, 'pending' | 'completed' | 'disabled'> = {
  draft: 'pending',
  published: 'completed',
  archived: 'disabled',
};

function formatPrice(price: string, currency: string) {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}

function formatArea(area: string) {
  const num = parseFloat(area);
  if (isNaN(num)) return area;
  return `${new Intl.NumberFormat('ru-RU').format(num)} м²`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

const getSortingIcon = (state: 'asc' | 'desc' | false) => {
  if (state === 'asc')
    return <RiArrowUpSFill className='size-5 text-[#6B7280]' />;
  if (state === 'desc')
    return <RiArrowDownSFill className='size-5 text-[#6B7280]' />;
  return <RiExpandUpDownFill className='size-5 text-[#6B7280]' />;
};

function SortableHeader({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) {
  return (
    <div className='flex items-center gap-0.5'>
      {children}
      <button
        type='button'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        {getSortingIcon(column.getIsSorted())}
      </button>
    </div>
  );
}

const columns: ColumnDef<Property>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox.Root
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Выбрать все'
      />
    ),
    cell: ({ row }) => (
      <Checkbox.Root
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Выбрать строку'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'pr-0 w-0' },
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: ({ column }) => (
      <SortableHeader column={column}>Адрес</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className='max-w-[240px] truncate text-[14px] text-[#111827]'>
        {row.original.address}
      </div>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => (
      <SortableHeader column={column}>Тип</SortableHeader>
    ),
    cell: ({ row }) => (
      <Badge.Root
        variant='light'
        size='medium'
        color={TYPE_COLORS[row.original.type]}
      >
        {TYPE_LABELS[row.original.type]}
      </Badge.Root>
    ),
  },
  {
    id: 'property_class',
    accessorKey: 'property_class',
    header: ({ column }) => (
      <SortableHeader column={column}>Класс</SortableHeader>
    ),
    cell: ({ row }) => (
      <Badge.Root
        variant='lighter'
        size='medium'
        color={CLASS_COLORS[row.original.property_class]}
      >
        {CLASS_LABELS[row.original.property_class]}
      </Badge.Root>
    ),
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }) => (
      <SortableHeader column={column}>Цена</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className='text-[14px] font-medium text-[#111827]'>
        {formatPrice(row.original.price, row.original.currency)}
      </div>
    ),
  },
  {
    id: 'area',
    accessorKey: 'area',
    header: ({ column }) => (
      <SortableHeader column={column}>Площадь</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className='text-[14px] text-[#6B7280]'>
        {formatArea(row.original.area)}
      </div>
    ),
  },
  {
    id: 'deadline',
    accessorKey: 'deadline',
    header: ({ column }) => (
      <SortableHeader column={column}>Срок сдачи</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className='text-[14px] text-[#6B7280]'>
        {formatDate(row.original.deadline)}
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => (
      <StatusBadge.Root
        variant='light'
        status={STATUS_MAP[row.original.status]}
      >
        <StatusBadge.Dot />
        {STATUS_LABELS[row.original.status]}
      </StatusBadge.Root>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const onEdit = (table.options.meta as any)?.onEdit;
      return (
        <Button.Root
          variant='neutral'
          mode='ghost'
          size='xsmall'
          onClick={() => onEdit?.(row.original)}
        >
          <Button.Icon as={RiPencilLine} />
        </Button.Root>
      );
    },
    meta: { className: 'px-5 w-0' },
  },
];

export function PropertiesTable({
  data,
  onEdit,
}: {
  data: Property[];
  onEdit?: (property: Property) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    meta: { onEdit },
  });

  return (
    <Table.Root className='[&>table]:min-w-[960px]'>
      <Table.Header className='whitespace-nowrap'>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.Head
                key={header.id}
                className={header.column.columnDef.meta?.className}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.Head>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows?.length > 0 ? (
          table.getRowModel().rows.map((row, i, arr) => (
            <React.Fragment key={row.id}>
              <Table.Row data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    className={cn(
                      'h-12',
                      cell.column.columnDef.meta?.className,
                    )}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </Table.Cell>
                ))}
              </Table.Row>
              {i < arr.length - 1 && <Table.RowDivider />}
            </React.Fragment>
          ))
        ) : (
          <Table.Row>
            <Table.Cell colSpan={columns.length} className='h-24 text-center'>
              <div className='text-[14px] text-[#9CA3AF]'>
                Объекты не найдены
              </div>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

export function PropertiesTablePagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = React.useMemo(() => {
    const items: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push('ellipsis');
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        items.push(i);
      }
      if (page < totalPages - 2) items.push('ellipsis');
      items.push(totalPages);
    }
    return items;
  }, [page, totalPages]);

  return (
    <div className='mt-auto'>
      {/* Mobile */}
      <div className='mt-4 flex items-center justify-between py-4 lg:hidden'>
        <Button.Root
          variant='neutral'
          mode='stroke'
          size='xsmall'
          className='w-28'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Назад
        </Button.Root>
        <span className='whitespace-nowrap text-center text-[14px] text-[#6B7280]'>
          {page} из {totalPages}
        </span>
        <Button.Root
          variant='neutral'
          mode='stroke'
          size='xsmall'
          className='w-28'
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Далее
        </Button.Root>
      </div>

      {/* Desktop */}
      <div className='mt-10 hidden items-center gap-3 lg:flex'>
        <span className='flex-1 whitespace-nowrap text-[14px] text-[#6B7280]'>
          Страница {page} из {totalPages}
        </span>

        <Pagination.Root>
          <Pagination.NavButton
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
          >
            <Pagination.NavIcon as={RiArrowLeftDoubleLine} />
          </Pagination.NavButton>
          <Pagination.NavButton
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <Pagination.NavIcon as={RiArrowLeftSLine} />
          </Pagination.NavButton>

          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <Pagination.Item key={`e-${i}`} disabled>
                ...
              </Pagination.Item>
            ) : (
              <Pagination.Item
                key={p}
                current={p === page}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Pagination.Item>
            ),
          )}

          <Pagination.NavButton
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <Pagination.NavIcon as={RiArrowRightSLine} />
          </Pagination.NavButton>
          <Pagination.NavButton
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <Pagination.NavIcon as={RiArrowRightDoubleLine} />
          </Pagination.NavButton>
        </Pagination.Root>

        <div className='flex flex-1 justify-end'>
          <Select.Root
            size='xsmall'
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <Select.Trigger className='w-auto'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='10'>10 / стр</Select.Item>
              <Select.Item value='25'>25 / стр</Select.Item>
              <Select.Item value='50'>50 / стр</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </div>
  );
}

export {
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
  STATUS_MAP,
  TYPE_COLORS,
  CLASS_COLORS,
};
