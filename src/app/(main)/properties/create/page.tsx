'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Button from '@/shared/ui/button';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Hint from '@/shared/ui/hint';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import * as WidgetBox from '@/shared/components/widget-box';
import { PageHeader } from '@/shared/components/page-header';
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

  const onSubmit = (data: PropertyFormData) => {
    createMutation.mutate(
      { ...data, deadline: data.deadline || null },
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
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='property-address'
                  placeholder='ул. Примерная, д. 1'
                  {...register('address')}
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.address && <p className='text-paragraph-xs text-error-base'>{errors.address.message}</p>}
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
                    {...register('area')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.area && <p className='text-paragraph-xs text-error-base'>{errors.area.message}</p>}
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
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='property-price'
                    type='number'
                    step='0.01'
                    placeholder='150000'
                    {...register('price')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.price && <p className='text-paragraph-xs text-error-base'>{errors.price.message}</p>}
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
