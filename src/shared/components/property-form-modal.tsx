'use client';

import * as React from 'react';
import {
  RiBuilding2Line,
  RiImageAddLine,
  RiCloseLine,
  RiCheckLine,
} from '@remixicon/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import toast from 'react-hot-toast';

import * as Modal from '@/shared/ui/modal';
import * as Button from '@/shared/ui/button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import { cn } from '@/shared/lib/cn';
import { formatPriceInput, stripPriceFormat } from '@/shared/lib/formatters';
import {
  usePropertyImages,
  useAddPropertyImage,
  useDeletePropertyImage,
} from '@/features/properties';
import type {
  Property,
  PropertyImage,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyType,
  PropertyClass,
  PropertyStatus,
} from '@/shared/types/properties';
import {
  TYPE_LABELS,
  CLASS_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import { propertySchema, type PropertyFormData } from '@/shared/lib/validations';

type PropertyFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
  onSubmit: (data: PropertyCreateRequest | PropertyUpdateRequest) => void;
  isPending?: boolean;
};

function ImageUploadSection({ propertyId }: { propertyId: number }) {
  const { data: images = [] } = usePropertyImages(propertyId);
  const addImage = useAddPropertyImage();
  const deleteImage = useDeletePropertyImage();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFiles = async (files: FileList | null) => {
    if (!files || uploading) return;
    setUploading(true);
    const arr = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`Файл «${f.name}» превышает 5MB`);
        return false;
      }
      return true;
    });
    for (let i = 0; i < arr.length; i++) {
      try {
        await addImage.mutateAsync({
          propertyId,
          data: { image: arr[i] },
        });
      } catch {
        // continue uploading remaining files even if one fails
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className='space-y-2'>
      <Label.Root>Фотографии</Label.Root>

      {images.length > 0 && (
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {images.map((img: PropertyImage) => (
            <div key={img.id} className='group relative shrink-0'>
              <img
                src={img.url || img.external_url || ''}
                alt=''
                className='h-20 w-20 rounded-lg border border-gray-200 object-cover'
              />
              {img.is_primary && (
                <span className='absolute bottom-1 left-1 flex size-4 items-center justify-center rounded-full bg-blue-600'>
                  <RiCheckLine className='size-2.5 text-white' />
                </span>
              )}
              <button
                type='button'
                className='absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-white/80 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => deleteImage.mutate({ propertyId, imageId: img.id })}
              >
                <RiCloseLine className='size-3 text-gray-900' />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type='button'
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm transition-all duration-150',
          uploading
            ? 'cursor-not-allowed border-gray-200 text-gray-400 opacity-60'
            : 'border-gray-200 text-gray-400 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600',
        )}
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

export function PropertyFormModal({
  open,
  onOpenChange,
  property,
  onSubmit,
  isPending,
}: PropertyFormModalProps) {
  const isEdit = !!property;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'apartment',
      address: '',
      area: '',
      property_class: 'comfort',
      price: '',
      currency: 'USD',
      deadline: '',
      status: 'draft',
    },
  });

  React.useEffect(() => {
    if (property) {
      reset({
        type: property.type,
        address: property.address,
        area: property.area,
        property_class: property.property_class,
        price: property.price,
        currency: property.currency,
        deadline: property.deadline || '',
        status: property.status,
      });
    } else {
      reset({
        type: 'apartment',
        address: '',
        area: '',
        property_class: 'comfort',
        price: '',
        currency: 'USD',
        deadline: '',
        status: 'draft',
      });
    }
  }, [property, open, reset]);

  const onFormSubmit = (data: PropertyFormData) => {
    onSubmit({ ...data, type: data.type as PropertyType, property_class: data.property_class as PropertyClass, status: data.status as PropertyStatus, deadline: data.deadline || null } as PropertyCreateRequest | PropertyUpdateRequest);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='flex max-h-[90vh] max-w-[480px] flex-col'>
        <Modal.Header
          icon={RiBuilding2Line}
          title={isEdit ? 'Редактировать объект' : 'Новый объект'}
          description={
            isEdit
              ? 'Измените параметры объекта недвижимости'
              : 'Заполните информацию о новом объекте'
          }
        />
        <form onSubmit={handleSubmit(onFormSubmit)} className='flex min-h-0 flex-1 flex-col'>
          <Modal.Body className='flex-1 space-y-4 overflow-y-auto'>
            {/* Type */}
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-type'>
                Тип <Label.Asterisk />
              </Label.Root>
              <Controller
                name='type'
                control={control}
                render={({ field }) => (
                  <Select.Root
                    size='small'
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger id='property-type'>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {(
                        Object.entries(TYPE_LABELS) as [PropertyType, string][]
                      ).map(([value, label]) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.type && <p className='text-xs text-red-500'>{errors.type.message}</p>}
            </div>

            {/* Address */}
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-address'>
                Адрес <Label.Asterisk />
              </Label.Root>
              <Input.Root size='small'>
                <Input.Wrapper>
                  <Input.Input
                    id='property-address'
                    placeholder='ул. Примерная, д. 1'
                    {...register('address')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.address && <p className='text-xs text-red-500'>{errors.address.message}</p>}
            </div>

            {/* Area + Class */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-area'>
                  Площадь (м²) <Label.Asterisk />
                </Label.Root>
                <Input.Root size='small'>
                  <Input.Wrapper>
                    <Input.Input
                      id='property-area'
                      type='number'
                      step='0.01'
                      placeholder='120.5'
                      {...register('area')}
                    />
                  </Input.Wrapper>
                </Input.Root>
                {errors.area && <p className='text-xs text-red-500'>{errors.area.message}</p>}
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
                      size='small'
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
                {errors.property_class && <p className='text-xs text-red-500'>{errors.property_class.message}</p>}
              </div>
            </div>

            {/* Price + Currency */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-price'>
                  Цена <Label.Asterisk />
                </Label.Root>
                <Input.Root size='small'>
                  <Input.Wrapper>
                    <Controller name='price' control={control} render={({ field }) => (
                      <Input.Input
                        id='property-price'
                        type='text'
                        inputMode='decimal'
                        placeholder='150 000'
                        value={formatPriceInput(field.value)}
                        onChange={(e) => field.onChange(stripPriceFormat(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    )} />
                  </Input.Wrapper>
                </Input.Root>
                {errors.price && <p className='text-xs text-red-500'>{errors.price.message}</p>}
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-currency'>Валюта</Label.Root>
                <Controller
                  name='currency'
                  control={control}
                  render={({ field }) => (
                    <Select.Root
                      size='small'
                      value={field.value}
                      onValueChange={field.onChange}
                    >
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
                {errors.currency && <p className='text-xs text-red-500'>{errors.currency.message}</p>}
              </div>
            </div>

            {/* Deadline + Status */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-deadline'>Срок сдачи</Label.Root>
                <Input.Root size='small'>
                  <Input.Wrapper>
                    <Input.Input
                      id='property-deadline'
                      type='date'
                      {...register('deadline')}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-status'>Статус</Label.Root>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select.Root
                      size='small'
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger id='property-status'>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {(
                          Object.entries(STATUS_LABELS) as [
                            PropertyStatus,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <Select.Item key={value} value={value}>
                            {label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.status && <p className='text-xs text-red-500'>{errors.status.message}</p>}
              </div>
            </div>

            {/* Images — only for existing properties */}
            {isEdit && property && (
              <ImageUploadSection propertyId={property.id} />
            )}
          </Modal.Body>

          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root variant='neutral' mode='stroke' size='small'>
                Отмена
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' size='small' disabled={isPending}>
              {isPending
                ? 'Сохранение...'
                : isEdit
                  ? 'Сохранить'
                  : 'Создать'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
