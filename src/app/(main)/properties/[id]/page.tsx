'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Building03Icon,
  Delete01Icon,
  Image01Icon,
} from '@hugeicons/core-free-icons';
import { RiImageAddLine, RiCloseLine, RiCheckLine } from '@remixicon/react';

import { DetailPageSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import * as Modal from '@/shared/ui/modal';
import {
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import { propertySchema, type PropertyFormData } from '@/shared/lib/validations';
import { formatPriceInput, stripPriceFormat } from '@/shared/lib/formatters';
import {
  useProperty,
  useUpdateProperty,
  useDeleteProperty,
  usePropertyImages,
  useAddPropertyImage,
  useUpdatePropertyImage,
  useDeletePropertyImage,
} from '@/features/properties';
import type {
  Property,
  PropertyType,
  PropertyClass,
  PropertyStatus,
  PropertyImage,
} from '@/shared/types/properties';

// --- Constants ---

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽', TRY: '₺' };

const STATUS_BADGE: Record<PropertyStatus, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-amber-50 text-amber-700',
};

// --- Helpers ---

function formatPrice(value: string, currency?: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? currency) : '';
  return new Intl.NumberFormat('ru-RU').format(num) + (symbol ? ` ${symbol}` : '');
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Images Gallery ---

function ImagesGallery({ images }: { images: PropertyImage[] }) {
  const [current, setCurrent] = React.useState(0);

  // Clamp index when images are removed (e.g. delete last image while viewing it)
  React.useEffect(() => {
    if (images.length > 0 && current >= images.length) {
      setCurrent(images.length - 1);
    }
  }, [images.length, current]);

  if (images.length === 0) {
    return (
      <div className='flex h-48 items-center justify-center rounded-xl border border-blue-100/80 bg-gray-50'>
        <div className='flex flex-col items-center gap-2'>
          <HugeiconsIcon icon={Image01Icon} size={32} color='currentColor' strokeWidth={1.5} className='text-gray-300' />
          <span className='text-[13px] text-gray-400'>Нет фотографий</span>
        </div>
      </div>
    );
  }

  return (
    <div className='relative overflow-hidden rounded-xl border border-blue-100/80 bg-gray-50'>
      <img
        src={images[current].url || images[current].external_url || ''}
        alt=''
        className='h-64 w-full object-cover sm:h-80'
      />
      {images.length > 1 && (
        <>
          <button
            type='button'
            onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
            className='absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 backdrop-blur-sm transition-colors hover:bg-white'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color='currentColor' strokeWidth={1.5} />
          </button>
          <button
            type='button'
            onClick={() => setCurrent((c) => (c + 1) % images.length)}
            className='absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 backdrop-blur-sm transition-colors hover:bg-white'
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color='currentColor' strokeWidth={1.5} />
          </button>
          <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'>
            {images.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
      <div className='absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm'>
        {current + 1} / {images.length}
      </div>
    </div>
  );
}

// --- Image Upload Section ---

function ImageUploadSection({ propertyId }: { propertyId: number }) {
  const { data: images = [] } = usePropertyImages(propertyId);
  const addImage = useAddPropertyImage();
  const updateImage = useUpdatePropertyImage();
  const deleteImage = useDeletePropertyImage();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Local order state — synced from server, edited locally
  const [localOrder, setLocalOrder] = React.useState<PropertyImage[]>([]);
  const [isDirty, setIsDirty] = React.useState(false);

  // Sync from server when images change (stable key to avoid infinite loop)
  const imagesKey = images.map((i) => `${i.id}:${i.sort_order}:${i.is_primary}`).join(',');
  React.useEffect(() => {
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
    setLocalOrder(sorted);
    setIsDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || uploading) return;
    setUploading(true);
    const startOrder = localOrder.length > 0 ? Math.max(...localOrder.map((i) => i.sort_order)) + 1 : 0;
    const fileArr = Array.from(files);
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Файл «${file.name}» превышает 5MB`);
        continue;
      }
      try {
        await addImage.mutateAsync({
          propertyId,
          data: {
            image: file,
            sort_order: startOrder + i,
            is_primary: localOrder.length === 0 && i === 0,
          },
        });
      } catch {
        toast.error(`Ошибка загрузки «${file.name}»`);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const moveImage = (fromIdx: number, toIdx: number) => {
    const next = [...localOrder];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setLocalOrder(next);
    setIsDirty(true);
  };

  const togglePrimary = (imageId: number) => {
    setLocalOrder((prev) =>
      prev.map((img) => ({ ...img, is_primary: img.id === imageId })),
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Phase 1: move all to temporary high sort_order to avoid unique constraint conflicts
      const offset = 10000;
      for (let i = 0; i < localOrder.length; i++) {
        await updateImage.mutateAsync({
          propertyId,
          imageId: localOrder[i].id,
          data: { sort_order: offset + i },
        });
      }
      // Phase 2: set final sort_order and is_primary
      for (let i = 0; i < localOrder.length; i++) {
        await updateImage.mutateAsync({
          propertyId,
          imageId: localOrder[i].id,
          data: { sort_order: i, is_primary: localOrder[i].is_primary },
        });
      }
      toast.success('Порядок сохранён');
      setIsDirty(false);
    } catch {
      toast.error('Ошибка при сохранении порядка');
    }
    setSaving(false);
  };

  return (
    <div className='space-y-3'>
      {localOrder.length > 0 && (
        <div className='space-y-2'>
          {localOrder.map((img, idx) => (
            <div key={img.id} className='group flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5'>
              <img
                src={img.url || img.external_url || ''}
                alt=''
                className='h-14 w-14 flex-shrink-0 rounded-md object-cover'
              />
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='truncate text-xs text-gray-500'>#{idx + 1}</span>
                {img.is_primary && (
                  <span className='inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700'>
                    Главное
                  </span>
                )}
              </div>
              <div className='flex items-center gap-0.5'>
                <button
                  type='button'
                  disabled={idx === 0}
                  onClick={() => moveImage(idx, idx - 1)}
                  className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30'
                  title='Переместить выше'
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={14} color='currentColor' strokeWidth={1.5} className='rotate-90' />
                </button>
                <button
                  type='button'
                  disabled={idx === localOrder.length - 1}
                  onClick={() => moveImage(idx, idx + 1)}
                  className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30'
                  title='Переместить ниже'
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} color='currentColor' strokeWidth={1.5} className='rotate-90' />
                </button>
                {!img.is_primary && (
                  <button
                    type='button'
                    onClick={() => togglePrimary(img.id)}
                    className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600'
                    title='Сделать главным'
                  >
                    <RiCheckLine className='size-3.5' />
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => toast.promise(
                    deleteImage.mutateAsync({ propertyId, imageId: img.id }),
                    { loading: 'Удаление...', success: 'Фото удалено', error: 'Ошибка при удалении' },
                  )}
                  className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600'
                  title='Удалить'
                >
                  <RiCloseLine className='size-3.5' />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDirty && (
        <button
          type='button'
          disabled={saving}
          onClick={handleSave}
          className='flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60'
        >
          {saving ? 'Сохранение...' : 'Сохранить порядок'}
        </button>
      )}

      <button
        type='button'
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm transition-all duration-150 ${
          uploading
            ? 'cursor-not-allowed border-gray-200 text-gray-400 opacity-60'
            : 'border-gray-200 text-gray-400 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <RiImageAddLine className='size-4' />
        {uploading ? 'Загрузка...' : 'Добавить фото'}
        <input
          ref={inputRef}
          type='file'
          multiple
          accept='image/*'
          className='hidden'
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>
    </div>
  );
}

// --- Edit Form ---

function PropertyEditForm({
  property,
  onSubmit,
  isSubmitting,
}: {
  property: Property;
  onSubmit: (data: PropertyFormData) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: property.type,
      address: property.address,
      area: property.area,
      property_class: property.property_class,
      price: property.price,
      currency: property.currency,
      deadline: property.deadline ?? '',
      status: property.status,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      {/* Type */}
      <div className='space-y-1.5'>
        <Label.Root htmlFor='p-type'>Тип <Label.Asterisk /></Label.Root>
        <Controller
          name='type'
          control={control}
          render={({ field }) => (
            <Select.Root size='small' value={field.value} onValueChange={field.onChange}>
              <Select.Trigger id='p-type'><Select.Value /></Select.Trigger>
              <Select.Content>
                {(Object.entries(TYPE_LABELS) as [PropertyType, string][]).map(([v, l]) => (
                  <Select.Item key={v} value={v}>{l}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
        />
        {errors.type && <p className='text-[11px] text-red-500'>{errors.type.message}</p>}
      </div>

      {/* Address */}
      <div className='space-y-1.5'>
        <Label.Root htmlFor='p-address'>Адрес <Label.Asterisk /></Label.Root>
        <Input.Root size='small'>
          <Input.Wrapper>
            <Input.Input id='p-address' placeholder='ул. Примерная, д. 1' {...register('address')} />
          </Input.Wrapper>
        </Input.Root>
        {errors.address && <p className='text-[11px] text-red-500'>{errors.address.message}</p>}
      </div>

      {/* Area + Class */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='p-area'>Площадь (м²) <Label.Asterisk /></Label.Root>
          <Input.Root size='small'>
            <Input.Wrapper>
              <Input.Input id='p-area' type='number' step='0.01' placeholder='120.5' {...register('area')} />
            </Input.Wrapper>
          </Input.Root>
          {errors.area && <p className='text-[11px] text-red-500'>{errors.area.message}</p>}
        </div>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='p-class'>Класс <Label.Asterisk /></Label.Root>
          <Controller
            name='property_class'
            control={control}
            render={({ field }) => (
              <Select.Root size='small' value={field.value} onValueChange={field.onChange}>
                <Select.Trigger id='p-class'><Select.Value /></Select.Trigger>
                <Select.Content>
                  {(Object.entries(CLASS_LABELS) as [PropertyClass, string][]).map(([v, l]) => (
                    <Select.Item key={v} value={v}>{l}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
          {errors.property_class && <p className='text-[11px] text-red-500'>{errors.property_class.message}</p>}
        </div>
      </div>

      {/* Price + Currency */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='p-price'>Цена <Label.Asterisk /></Label.Root>
          <Input.Root size='small'>
            <Input.Wrapper>
              <Controller
                name='price'
                control={control}
                render={({ field }) => (
                  <Input.Input
                    id='p-price'
                    type='text'
                    inputMode='decimal'
                    placeholder='150 000'
                    value={formatPriceInput(field.value)}
                    onChange={(e) => field.onChange(stripPriceFormat(e.target.value))}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Input.Wrapper>
          </Input.Root>
          {errors.price && <p className='text-[11px] text-red-500'>{errors.price.message}</p>}
        </div>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='p-currency'>Валюта</Label.Root>
          <Controller
            name='currency'
            control={control}
            render={({ field }) => (
              <Select.Root size='small' value={field.value} onValueChange={field.onChange}>
                <Select.Trigger id='p-currency'><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value='USD'>USD</Select.Item>
                  <Select.Item value='EUR'>EUR</Select.Item>
                  <Select.Item value='RUB'>RUB</Select.Item>
                  <Select.Item value='TRY'>TRY</Select.Item>
                </Select.Content>
              </Select.Root>
            )}
          />
        </div>
      </div>

      {/* Deadline + Status */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='p-deadline'>Срок сдачи</Label.Root>
          <Input.Root size='small'>
            <Input.Wrapper>
              <Input.Input id='p-deadline' type='date' {...register('deadline')} />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className='space-y-1.5'>
          <Label.Root htmlFor='p-status'>Статус</Label.Root>
          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <Select.Root size='small' value={field.value} onValueChange={field.onChange}>
                <Select.Trigger id='p-status'><Select.Value /></Select.Trigger>
                <Select.Content>
                  {(Object.entries(STATUS_LABELS) as [PropertyStatus, string][]).map(([v, l]) => (
                    <Select.Item key={v} value={v}>{l}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
          {errors.status && <p className='text-[11px] text-red-500'>{errors.status.message}</p>}
        </div>
      </div>

      <div className='pt-2'>
        <FancyButton.Root
          variant='primary'
          size='small'
          type='submit'
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </FancyButton.Root>
      </div>
    </form>
  );
}

// --- Main Page ---

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = Number(params.id);
  const isValidId = Number.isFinite(propertyId) && propertyId > 0;

  const { data: property, isLoading } = useProperty(isValidId ? propertyId : 0);
  const updateMutation = useUpdateProperty();
  const deleteMutation = useDeleteProperty();

  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const onSubmit = (data: PropertyFormData) => {
    updateMutation.mutate(
      {
        id: propertyId,
        data: {
          ...data,
          type: data.type as PropertyType,
          property_class: data.property_class as PropertyClass,
          status: data.status as PropertyStatus,
          deadline: data.deadline || null,
        },
      },
      {
        onSuccess: () => toast.success('Объект сохранён'),
        onError: () => toast.error('Ошибка при сохранении'),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(propertyId, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push('/properties');
      },
      onError: () => toast.error('Ошибка при удалении'),
    });
  };

  if (!isValidId) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-20'>
        <div className='flex size-11 items-center justify-center rounded-xl bg-gray-50'>
          <HugeiconsIcon icon={Building03Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
        </div>
        <div className='text-base font-semibold text-gray-900'>Объект не найден</div>
        <Link href='/properties'>
          <FancyButton.Root variant='basic' size='small'>Назад к объектам</FancyButton.Root>
        </Link>
      </div>
    );
  }

  if (isLoading) return <DetailPageSkeleton />;

  if (!property) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-20'>
        <div className='flex size-11 items-center justify-center rounded-xl bg-gray-50'>
          <HugeiconsIcon icon={Building03Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
        </div>
        <div className='text-base font-semibold text-gray-900'>Объект не найден</div>
        <Link href='/properties'>
          <FancyButton.Root variant='basic' size='small'>Назад к объектам</FancyButton.Root>
        </Link>
      </div>
    );
  }

  const statusCls = STATUS_BADGE[property.status] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className='w-full px-8 py-8 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link
            href='/properties'
            className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700'
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color='currentColor' strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-gray-900'>Объект #{property.id}</h1>
            <span className='text-[13px] text-gray-400'>{property.address}</span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCls}`}>
            {STATUS_LABELS[property.status]}
          </span>
          <FancyButton.Root variant='destructive' size='small' onClick={() => setDeleteOpen(true)}>
            <HugeiconsIcon icon={Delete01Icon} size={16} color='currentColor' strokeWidth={1.5} />
            Удалить
          </FancyButton.Root>
        </div>
      </div>

      {/* KPI Row */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className='rounded-xl border border-blue-200 bg-blue-50/50 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Цена</span>
          <span className='mt-1 block text-[17px] font-bold text-blue-700'>{formatPrice(property.price, property.currency)}</span>
        </div>
        <div className='rounded-xl border border-blue-100/80 bg-linear-to-br from-white via-white to-blue-50/40 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Площадь</span>
          <span className='mt-1 block text-[17px] font-bold text-gray-900'>{property.area} м²</span>
        </div>
        <div className='rounded-xl border border-blue-100/80 bg-linear-to-br from-white via-white to-blue-50/40 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Тип</span>
          <span className='mt-1 block text-[17px] font-bold text-gray-900'>{TYPE_LABELS[property.type]}</span>
        </div>
        <div className='rounded-xl border border-blue-100/80 bg-linear-to-br from-white via-white to-blue-50/40 p-4'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Класс</span>
          <span className='mt-1 block text-[17px] font-bold text-gray-900'>{CLASS_LABELS[property.property_class]}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
        {/* Left 2/3 */}
        <div className='space-y-4 xl:col-span-2'>
          <ImagesGallery images={property.images} />

          {/* Edit Form */}
          <div className='rounded-xl border border-blue-100/80 bg-linear-to-br from-white via-white to-blue-50/40 p-6'>
            <h3 className='mb-5 flex items-center gap-2 text-[14px] font-semibold text-gray-900'>
              <HugeiconsIcon icon={Building03Icon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
              Редактировать объект
            </h3>
            <PropertyEditForm
              property={property}
              onSubmit={onSubmit}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </div>

        {/* Right 1/3 */}
        <div className='space-y-4'>
          {/* Image Upload */}
          <div className='rounded-xl border border-blue-100/80 bg-linear-to-br from-white via-white to-blue-50/40 p-5'>
            <h3 className='mb-4 text-[14px] font-semibold text-gray-900'>Фотографии</h3>
            <ImageUploadSection propertyId={property.id} />
          </div>

          {/* Metadata */}
          <div className='rounded-xl border border-blue-100/80 bg-linear-to-br from-white via-white to-blue-50/40 p-5'>
            <h3 className='mb-4 text-[14px] font-semibold text-gray-900'>Информация</h3>
            <div className='space-y-3'>
              <div>
                <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Срок сдачи</span>
                <span className='mt-0.5 block text-[13px] font-medium text-gray-900'>{formatDate(property.deadline)}</span>
              </div>
              <div>
                <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Создан</span>
                <span className='mt-0.5 block text-[13px] font-medium text-gray-900'>{formatDateTime(property.created_at)}</span>
              </div>
              <div>
                <span className='text-[11px] font-semibold uppercase tracking-widest text-gray-400'>Обновлён</span>
                <span className='mt-0.5 block text-[13px] font-medium text-gray-900'>{formatDateTime(property.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal.Content>
          <Modal.Header
            title='Удалить объект'
            description={`Вы уверены, что хотите удалить «${property.address}»? Это действие нельзя отменить.`}
          />
          <Modal.Footer>
            <FancyButton.Root
              variant='basic'
              size='small'
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Отмена
            </FancyButton.Root>
            <FancyButton.Root
              variant='destructive'
              size='small'
              onClick={handleDelete}
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
