'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiImageAddLine,
  RiDraggable,
} from '@remixicon/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/shared/lib/cn';
import * as Button from '@/shared/ui/button';
import * as CompactButton from '@/shared/ui/compact-button';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Hint from '@/shared/ui/hint';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import * as WidgetBox from '@/shared/components/widget-box';
import { PageHeader } from '@/shared/components/page-header';
import { useCreateProperty } from '@/features/properties';
import { propertiesService } from '@/entities/properties';
import {
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import type {
  PropertyType,
  PropertyClass,
  PropertyStatus,
} from '@/shared/types/properties';
import { propertySchema, type PropertyFormData } from '@/shared/lib/validations';

export default function CreatePropertyPage() {
  const router = useRouter();
  const createMutation = useCreateProperty();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'apartment',
      property_class: 'comfort',
      currency: 'USD',
      status: 'draft',
      address: '',
      area: '',
      price: '',
      deadline: '',
    },
  });

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
        toast.error(`Файл «${f.name}» превышает 5MB`);
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
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(dropIndex, 0, item);
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(dropIndex, 0, item);
      return next;
    });
  };

  const onSubmit = (data: PropertyFormData) => {
    createMutation.mutate(
      { ...data, deadline: data.deadline || null },
      {
        onSuccess: async (property) => {
          for (let i = 0; i < photos.length; i++) {
            try {
              await propertiesService.addImage(property.id, {
                image: photos[i],
                sort_order: i,
                is_primary: i === 0,
              });
            } catch (err) {
              console.error(`Ошибка загрузки фото ${i + 1}:`, err);
            }
          }
          toast.success('Объект успешно создан');
          router.push('/properties');
        },
      },
    );
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Новый объект'
        description='Заполните информацию о новом объекте недвижимости'
        backHref='/properties'
      />

      <form onSubmit={handleSubmit(onSubmit)} className='flex w-full max-w-[640px] flex-col gap-5'>
        {/* Section: Basic info */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Основная информация</WidgetBox.Header>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='property-type'>
              Тип объекта <Label.Asterisk />
            </Label.Root>
            <Controller
              name='type'
              control={control}
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger id='property-type'>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {(Object.entries(TYPE_LABELS) as [PropertyType, string][]).map(
                      ([value, label]) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ),
                    )}
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.type && <p className='text-paragraph-xs text-error-base'>{errors.type.message}</p>}
          </div>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='property-address'>
              Адрес <Label.Asterisk />
            </Label.Root>
            <Input.Root hasError={!!errors.address}>
              <Input.Wrapper>
                <Input.Input
                  id='property-address'
                  placeholder='ул. Примерная, д. 1'
                  {...register('address')}
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.address ? (
              <p className='text-paragraph-xs text-error-base'>{errors.address.message}</p>
            ) : (
              <Hint.Root>Полный адрес объекта недвижимости</Hint.Root>
            )}
          </div>
        </WidgetBox.Root>

        {/* Section: Characteristics */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Характеристики</WidgetBox.Header>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-area'>
                Площадь (м²) <Label.Asterisk />
              </Label.Root>
              <Controller
                name='area'
                control={control}
                render={({ field }) => (
                  <Input.Root hasError={!!errors.area}>
                    <Input.Wrapper>
                      <Input.Input
                        id='property-area'
                        type='text'
                        inputMode='decimal'
                        placeholder='120.5'
                        value={field.value}
                        onKeyDown={(e) => {
                          if (['+', '-', 'e', 'E'].includes(e.key)) e.preventDefault();
                          if (e.key === '.' && field.value.includes('.')) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          const val = raw.split('.').length > 2
                            ? raw.slice(0, raw.lastIndexOf('.'))
                            : raw;
                          field.onChange(val);
                        }}
                        onBlur={field.onBlur}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                )}
              />
              {errors.area && (
                <p className='text-paragraph-xs text-error-base'>{errors.area.message}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-class'>
                Класс <Label.Asterisk />
              </Label.Root>
              <Controller
                name='property_class'
                control={control}
                render={({ field }) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger id='property-class'>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {(
                        Object.entries(CLASS_LABELS) as [PropertyClass, string][]
                      ).map(([value, label]) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.property_class && <p className='text-paragraph-xs text-error-base'>{errors.property_class.message}</p>}
            </div>
          </div>
        </WidgetBox.Root>

        {/* Section: Price */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Стоимость</WidgetBox.Header>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-price'>
                Цена <Label.Asterisk />
              </Label.Root>
              <Controller
                name='price'
                control={control}
                render={({ field }) => (
                  <Input.Root hasError={!!errors.price}>
                    <Input.Wrapper>
                      <Input.Input
                        id='property-price'
                        type='text'
                        inputMode='decimal'
                        placeholder='150000'
                        value={field.value}
                        onKeyDown={(e) => {
                          if (['+', '-', 'e', 'E'].includes(e.key)) e.preventDefault();
                          if (e.key === '.' && field.value.includes('.')) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          const val = raw.split('.').length > 2
                            ? raw.slice(0, raw.lastIndexOf('.'))
                            : raw;
                          field.onChange(val);
                        }}
                        onBlur={field.onBlur}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                )}
              />
              {errors.price && (
                <p className='text-paragraph-xs text-error-base'>{errors.price.message}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-currency'>Валюта</Label.Root>
              <Controller
                name='currency'
                control={control}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger id='property-currency'>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value='USD'>USD</Select.Item>
                      <Select.Item value='EUR'>EUR</Select.Item>
                      <Select.Item value='RUB'>RUB</Select.Item>
                      <Select.Item value='TRY'>TRY</Select.Item>
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.currency && <p className='text-paragraph-xs text-error-base'>{errors.currency.message}</p>}
            </div>
          </div>
        </WidgetBox.Root>

        {/* Section: Deadlines & Status */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Сроки и статус</WidgetBox.Header>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-deadline'>Срок сдачи</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='property-deadline'
                    type='date'
                    {...register('deadline')}
                  />
                </Input.Wrapper>
              </Input.Root>
              <Hint.Root>Оставьте пустым, если срок неизвестен</Hint.Root>
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-status'>Статус</Label.Root>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger id='property-status'>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {(
                        Object.entries(STATUS_LABELS) as [PropertyStatus, string][]
                      ).map(([value, label]) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.status && <p className='text-paragraph-xs text-error-base'>{errors.status.message}</p>}
            </div>
          </div>
        </WidgetBox.Root>

        {/* Section: Photos */}
        <WidgetBox.Root className='space-y-4'>
          <WidgetBox.Header>Фотографии</WidgetBox.Header>

          {previews.length > 0 && (
            <div className='flex flex-wrap gap-3'>
              {previews.map((src, i) => (
                <div
                  key={src}
                  className='group relative cursor-grab active:cursor-grabbing'
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                >
                  <img
                    src={src}
                    alt=''
                    className={cn(
                      'h-24 w-24 rounded-xl object-cover ring-1 ring-inset transition-opacity',
                      i === 0 ? 'ring-primary-base' : 'ring-stroke-soft-200',
                    )}
                  />
                  {i === 0 ? (
                    <span className='absolute bottom-1.5 left-1.5 rounded-md bg-primary-base px-1.5 py-0.5 text-subheading-xs text-white'>
                      Главная
                    </span>
                  ) : (
                    <button
                      type='button'
                      onClick={() => handleMakePrimary(i)}
                      className='absolute bottom-1.5 left-1.5 rounded-md bg-bg-white-0/80 px-1.5 py-0.5 text-subheading-xs text-text-sub-600 opacity-0 transition-opacity group-hover:opacity-100'
                    >
                      Сделать главной
                    </button>
                  )}
                  <CompactButton.Root
                    type='button'
                    variant='ghost'
                    size='medium'
                    className='absolute right-1 top-1 size-5 rounded-md bg-bg-white-0/80 opacity-0 transition-opacity group-hover:opacity-100'
                    onClick={() => handleRemovePhoto(i)}
                  >
                    <CompactButton.Icon as={RiCloseLine} />
                  </CompactButton.Root>
                  <div className='absolute left-1 top-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <RiDraggable className='size-4 text-white drop-shadow' />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-paragraph-sm text-text-soft-400 transition-colors',
              'border-stroke-soft-200 hover:border-primary-base hover:text-primary-base',
            )}
          >
            <RiImageAddLine className='size-4' />
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
          <Hint.Root>Перетащите фото для изменения порядка. Первое фото — главное. Поддерживаются JPG, PNG, WebP.</Hint.Root>
        </WidgetBox.Root>

        {/* Actions */}
        <div className='flex w-fit items-stretch gap-3 pt-2'>
          <Button.Root variant='neutral' mode='stroke' size='medium' className='h-10' asChild>
            <Link href='/properties'>Отмена</Link>
          </Button.Root>
          <FancyButton.Root
            type='submit'
            variant='primary'
            size='medium'
            className='h-10'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Создание...' : 'Создать объект'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
