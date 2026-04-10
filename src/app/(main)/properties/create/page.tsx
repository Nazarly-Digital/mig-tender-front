'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ImageAdd01Icon,
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/shared/lib/cn';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Hint from '@/shared/ui/hint';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import { AreaField, PriceField } from '@/shared/components/property-fields';
import { AddressInput } from '@/shared/components/address-input';
import { useSessionStore } from '@/entities/auth/model/store';
import { useCreateProperty } from '@/features/properties';
import { propertiesService } from '@/entities/properties';
import {
  TYPE_LABELS,
  CLASS_LABELS,
} from '@/shared/components/properties-table';
import type {
  PropertyType,
  PropertyClass,
  PropertyStatus,
} from '@/shared/types/properties';
import { propertySchema, type PropertyFormData } from '@/shared/lib/validations';
import { clampDateInputYear, enforceNotPastYearOnBlur } from '@/shared/lib/date';

export default function CreatePropertyPage() {
  const router = useRouter();
  const createMutation = useCreateProperty();
  const companyName = useSessionStore((s) => s.user?.developer?.company_name ?? '');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'apartment',
      property_class: 'comfort',
      currency: 'RUB',
      status: 'published',
      address: '',
      area: '',
      price: '',
      deadline: '',
      commission_rate: '',
      floor: '',
      developer_name: companyName,
      project: '',
      land_number: '',
      house_number: '',
    },
  });

  const selectedType = watch('type');
  const isLand = selectedType === 'land';
  const hasFloor = selectedType === 'apartment' || selectedType === 'commercial';
  const hasHouseNumber = selectedType === 'house' || selectedType === 'townhouse';

  // Sync company name after zustand persist rehydration
  React.useEffect(() => {
    if (companyName) setValue('developer_name', companyName);
  }, [companyName, setValue]);

  // Clear property_class when switching to land
  React.useEffect(() => {
    if (isLand) setValue('property_class', '', { shouldValidate: false });
  }, [isLand, setValue]);

  // Photo-related state
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragIndex = React.useRef<number | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`Файл \u00AB${f.name}\u00BB превышает 5MB`);
        return false;
      }
      return true;
    });
    setPhotos((prev) => [...prev, ...arr]);
    arr.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => [...prev, url]);
    });
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDrop = (dropIndex: number) => {
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    dragIndex.current = null;
    movePhoto(from, dropIndex);
  };

  const movePhoto = (from: number, to: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (data: PropertyFormData) => {
    setSubmitting(true);
    try {
      const property = await createMutation.mutateAsync(
        { ...data, type: data.type as PropertyType, property_class: data.property_class ? data.property_class as PropertyClass : null, status: data.status as PropertyStatus, deadline: data.deadline || null, commission_rate: data.commission_rate || null, floor: (data.type === 'apartment' || data.type === 'commercial') && data.floor ? parseInt(data.floor) : null, developer_name: data.developer_name, project: data.project, land_number: data.type === 'land' && data.land_number ? data.land_number : null, house_number: (data.type === 'house' || data.type === 'townhouse') && data.house_number ? data.house_number : null } as any,
      );
      for (let i = 0; i < photos.length; i++) {
        try {
          await propertiesService.addImage(property.id, {
            image: photos[i],
            sort_order: i,
            is_primary: i === 0,
          });
        } catch {
          toast.error(`Ошибка загрузки фото ${i + 1}`);
        }
      }
      toast.success('Объект успешно создан');
      router.push('/properties');
    } catch {
      toast.error('Ошибка при создании объекта');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link
          href='/properties'
          className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors'
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Новый объект</h1>
          <p className='mt-1 text-sm text-gray-500'>Заполните информацию о новом объекте недвижимости</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 w-full'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Left column */}
          <div className='flex flex-col gap-4'>
            {/* Basic info */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
              <div className='text-[14px] font-semibold text-gray-900'>Основная информация</div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-type'>Тип <Label.Asterisk /></Label.Root>
                  <Controller name='type' control={control} render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger id='property-type' className='cursor-pointer'><Select.Value /></Select.Trigger>
                      <Select.Content>
                        {(Object.entries(TYPE_LABELS) as [PropertyType, string][]).map(([v, l]) => (
                          <Select.Item key={v} value={v}>{l}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )} />
                  {errors.type && <p className='text-xs text-red-500'>{errors.type.message}</p>}
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-class'>Класс {!isLand && <Label.Asterisk />}</Label.Root>
                  <Controller name='property_class' control={control} render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange} disabled={isLand}>
                      <Select.Trigger id='property-class' className='cursor-pointer'><Select.Value placeholder={isLand ? '—' : undefined} /></Select.Trigger>
                      <Select.Content>
                        {(Object.entries(CLASS_LABELS) as [PropertyClass, string][]).map(([v, l]) => (
                          <Select.Item key={v} value={v}>{l}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )} />
                  {errors.property_class && <p className='text-xs text-red-500'>{errors.property_class.message}</p>}
                </div>
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-address'>Адрес <Label.Asterisk /></Label.Root>
                <Controller
                  name='address'
                  control={control}
                  render={({ field }) => (
                    <AddressInput
                      id='property-address'
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder='ул. Примерная, д. 1'
                      hasError={!!errors.address}
                    />
                  )}
                />
                {errors.address && (
                  <p className='text-xs text-red-500'>{errors.address.message}</p>
                ) }
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-developer-name'>Застройщик <Label.Asterisk /></Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id='property-developer-name'
                        type='text'
                        disabled
                        className='disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
                        {...register('developer_name')}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-project'>Название проекта <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.project}>
                    <Input.Wrapper>
                      <Input.Input id='property-project' type='text' placeholder='Название проекта или ЖК' {...register('project')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.project && <p className='text-xs text-red-500'>{errors.project.message}</p>}
                </div>
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-area'>Площадь ({isLand ? 'сот' : 'м²'}) <Label.Asterisk /></Label.Root>
                <AreaField control={control} hasError={!!errors.area} />
                {errors.area && <p className='text-xs text-red-500'>{errors.area.message}</p>}
              </div>
              {hasFloor && (
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-floor'>Этаж <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.floor}>
                    <Input.Wrapper>
                      <Input.Input id='property-floor' type='number' min='1' placeholder='5' {...register('floor')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.floor && <p className='text-xs text-red-500'>{errors.floor.message}</p>}
                </div>
              )}
              {isLand && (
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-land-number'>Номер участка <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.land_number}>
                    <Input.Wrapper>
                      <Input.Input id='property-land-number' type='text' placeholder='Например, 12А' {...register('land_number')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.land_number && <p className='text-xs text-red-500'>{errors.land_number.message}</p>}
                </div>
              )}
              {hasHouseNumber && (
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-house-number'>Номер дома <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.house_number}>
                    <Input.Wrapper>
                      <Input.Input id='property-house-number' type='text' placeholder='Например, 15' {...register('house_number')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.house_number && <p className='text-xs text-red-500'>{errors.house_number.message}</p>}
                </div>
              )}
            </div>

            {/* Price & Status */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
              <div className='text-[14px] font-semibold text-gray-900'>Стоимость и сроки</div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-price'>Прайсовая цена <Label.Asterisk /></Label.Root>
                  <PriceField control={control} hasError={!!errors.price} />
                  {errors.price && <p className='text-xs text-red-500'>{errors.price.message}</p>}
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-deadline'>Срок сдачи</Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id='property-deadline'
                        type='date'
                        min={new Date().toISOString().split('T')[0]}
                        max='9999-12-31'
                        onInput={clampDateInputYear}
                        {...register('deadline', { onBlur: enforceNotPastYearOnBlur })}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  <Hint.Root>Если неизвестен — пусто</Hint.Root>
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-commission'>Комиссия брокера (%) <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.commission_rate}>
                    <Input.Wrapper>
                      <Input.Input id='property-commission' type='number' step='0.01' min='0' placeholder='5' {...register('commission_rate')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.commission_rate && (
                    <p className='text-xs text-red-500'>{errors.commission_rate.message}</p>
                  ) }
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Photos */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4 self-start'>
            <div className='text-[14px] font-semibold text-gray-900'>Фотографии</div>

            {previews.length > 0 && (
              <div className='space-y-2'>
                {previews.map((src, i) => (
                  <div
                    key={src}
                    className='group flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5 cursor-grab active:cursor-grabbing'
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                  >
                    <img
                      src={src}
                      alt=''
                      className='h-14 w-14 flex-shrink-0 rounded-md object-cover'
                    />
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='truncate text-xs text-gray-500'>#{i + 1}</span>
                      {i === 0 && (
                        <span className='inline-flex w-fit items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700'>
                          Главное
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-0.5'>
                      <button
                        type='button'
                        disabled={i === 0}
                        onClick={() => movePhoto(i, i - 1)}
                        className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30'
                        title='Переместить выше'
                      >
                        <HugeiconsIcon icon={ArrowUp01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                      </button>
                      <button
                        type='button'
                        disabled={i === previews.length - 1}
                        onClick={() => movePhoto(i, i + 1)}
                        className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30'
                        title='Переместить ниже'
                      >
                        <HugeiconsIcon icon={ArrowDown01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                      </button>
                      <button
                        type='button'
                        onClick={() => handleRemovePhoto(i)}
                        className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600'
                        title='Удалить'
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={12} color='currentColor' strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type='button'
              onClick={() => inputRef.current?.click()}
              className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/30 px-4 py-8 text-sm text-gray-400 transition-colors hover:border-blue-200 hover:text-gray-600'
            >
              <HugeiconsIcon icon={ImageAdd01Icon} size={16} />
              Добавить фотографии
            </button>
            <input
              ref={inputRef}
              type='file'
              multiple
              accept='image/*'
              className='hidden'
              onChange={(e) => handleAddPhotos(e.target.files)}
            />
            <p className='text-[11px] text-gray-400'>Перетащите для порядка. Первое — главное. JPG, PNG, WebP.</p>
          </div>
        </div>

        {/* Actions */}
        <div className='mt-5 flex items-center gap-3'>
          <Link href='/properties'>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Link>
          <FancyButton.Root
            variant='primary'
            size='small'
            type='submit'
            disabled={submitting}
          >
            {submitting ? 'Создание...' : 'Создать объект'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
