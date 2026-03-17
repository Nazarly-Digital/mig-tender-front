'use client';

import * as React from 'react';
import { RiBuilding2Line } from '@remixicon/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import * as Modal from '@/shared/ui/modal';
import * as Button from '@/shared/ui/button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import type {
  Property,
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
    onSubmit({ ...data, deadline: data.deadline || null });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          icon={RiBuilding2Line}
          title={isEdit ? 'Редактировать объект' : 'Новый объект'}
          description={
            isEdit
              ? 'Измените параметры объекта недвижимости'
              : 'Заполните информацию о новом объекте'
          }
        />
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Modal.Body className='space-y-4'>
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
              {errors.type && <p className='text-paragraph-xs text-error-base'>{errors.type.message}</p>}
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
              {errors.address && <p className='text-paragraph-xs text-error-base'>{errors.address.message}</p>}
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
                {errors.property_class && <p className='text-paragraph-xs text-error-base'>{errors.property_class.message}</p>}
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
                {errors.currency && <p className='text-paragraph-xs text-error-base'>{errors.currency.message}</p>}
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
                {errors.status && <p className='text-paragraph-xs text-error-base'>{errors.status.message}</p>}
              </div>
            </div>
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
