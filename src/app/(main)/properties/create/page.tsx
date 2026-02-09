'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import * as FancyButton from '@/shared/ui/fancy-button';
import { useCreateProperty } from '@/features/properties';
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

  const [type, setType] = React.useState<PropertyType>('apartment');
  const [address, setAddress] = React.useState('');
  const [area, setArea] = React.useState('');
  const [propertyClass, setPropertyClass] = React.useState<PropertyClass>('comfort');
  const [price, setPrice] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [deadline, setDeadline] = React.useState('');
  const [status, setStatus] = React.useState<PropertyStatus>('draft');

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
        onSuccess: () => {
          toast.success('Объект успешно создан');
          router.push('/properties');
        },
      },
    );
  };

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      {/* Header */}
      <div>
        <div className='text-label-xl font-semibold text-text-strong-950'>
          Новый объект
        </div>
        <div className='mt-1 text-paragraph-s text-text-sub-600'>
          Заполните информацию о новом объекте недвижимости
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-[560px] space-y-6 rounded-20 bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'
      >
        {/* Type */}
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

        {/* Address */}
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
        </div>

        {/* Area + Class */}
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

        {/* Price + Currency */}
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

        {/* Deadline + Status */}
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

        {/* Actions */}
        <div className='pt-2'>
          <FancyButton.Root
            type='submit'
            variant='primary'
            className='w-full'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Создание...' : 'Создать объект'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
