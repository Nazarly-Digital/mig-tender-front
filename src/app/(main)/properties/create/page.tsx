'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiImageAddLine,
} from '@remixicon/react';
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
import { useCreateProperty, useAddPropertyImage } from '@/features/properties';
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

export default function CreatePropertyPage() {
  const router = useRouter();
  const createMutation = useCreateProperty();
  const addImage = useAddPropertyImage();

  const [type, setType] = React.useState<PropertyType>('apartment');
  const [address, setAddress] = React.useState('');
  const [area, setArea] = React.useState('');
  const [propertyClass, setPropertyClass] = React.useState<PropertyClass>('comfort');
  const [price, setPrice] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [deadline, setDeadline] = React.useState('');
  const [status, setStatus] = React.useState<PropertyStatus>('draft');
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        type,
        address,
        area,
        property_class: propertyClass,
        price,
        currency,
        deadline: deadline || null,
        status,
      },
      {
        onSuccess: (property) => {
          if (photos.length > 0) {
            photos.forEach((file, i) => {
              addImage.mutate({
                propertyId: property.id,
                data: { image: file, is_primary: i === 0 },
              });
            });
          }
          toast.success('Объект успешно создан');
          router.push('/properties');
        },
      },
    );
  };

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title='Новый объект'
        description='Заполните информацию о новом объекте недвижимости'
        backHref='/properties'
      />

      <form onSubmit={handleSubmit} className='flex w-full max-w-[640px] flex-col gap-5'>
        {/* Section: Basic info */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Основная информация</WidgetBox.Header>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='property-type'>
              Тип объекта <Label.Asterisk />
            </Label.Root>
            <Select.Root
              value={type}
              onValueChange={(v) => setType(v as PropertyType)}
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
          </div>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='property-address'>
              Адрес <Label.Asterisk />
            </Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='property-address'
                  placeholder='ул. Примерная, д. 1'
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Input.Wrapper>
            </Input.Root>
            <Hint.Root>Полный адрес объекта недвижимости</Hint.Root>
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
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='property-area'
                    type='number'
                    step='0.01'
                    placeholder='120.5'
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-class'>
                Класс <Label.Asterisk />
              </Label.Root>
              <Select.Root
                value={propertyClass}
                onValueChange={(v) => setPropertyClass(v as PropertyClass)}
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
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='property-price'
                    type='number'
                    step='0.01'
                    placeholder='150000'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-currency'>Валюта</Label.Root>
              <Select.Root value={currency} onValueChange={setCurrency}>
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
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
              <Hint.Root>Оставьте пустым, если срок неизвестен</Hint.Root>
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-status'>Статус</Label.Root>
              <Select.Root
                value={status}
                onValueChange={(v) => setStatus(v as PropertyStatus)}
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
            </div>
          </div>
        </WidgetBox.Root>

        {/* Section: Photos */}
        <WidgetBox.Root className='space-y-4'>
          <WidgetBox.Header>Фотографии</WidgetBox.Header>

          {previews.length > 0 && (
            <div className='flex flex-wrap gap-3'>
              {previews.map((src, i) => (
                <div key={i} className='group relative'>
                  <img
                    src={src}
                    alt=''
                    className='h-24 w-24 rounded-xl object-cover ring-1 ring-inset ring-stroke-soft-200'
                  />
                  {i === 0 && (
                    <span className='absolute bottom-1.5 left-1.5 rounded-md bg-primary-base px-1.5 py-0.5 text-subheading-xs text-white'>
                      Главная
                    </span>
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
          <Hint.Root>Первая фотография будет главной. Поддерживаются JPG, PNG, WebP.</Hint.Root>
        </WidgetBox.Root>

        {/* Actions */}
        <div className='flex items-center gap-3 pt-2'>
          <Link href='/properties'>
            <Button.Root variant='neutral' mode='stroke'>
              Отмена
            </Button.Root>
          </Link>
          <FancyButton.Root
            type='submit'
            variant='primary'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Создание...' : 'Создать объект'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
