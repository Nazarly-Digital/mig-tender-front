'use client';

import * as React from 'react';
import { RiBuilding2Line } from '@remixicon/react';

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

  const [type, setType] = React.useState<PropertyType>('apartment');
  const [address, setAddress] = React.useState('');
  const [area, setArea] = React.useState('');
  const [propertyClass, setPropertyClass] = React.useState<PropertyClass>('comfort');
  const [price, setPrice] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [deadline, setDeadline] = React.useState('');
  const [status, setStatus] = React.useState<PropertyStatus>('draft');

  React.useEffect(() => {
    if (property) {
      setType(property.type);
      setAddress(property.address);
      setArea(property.area);
      setPropertyClass(property.property_class);
      setPrice(property.price);
      setCurrency(property.currency);
      setDeadline(property.deadline || '');
      setStatus(property.status);
    } else {
      setType('apartment');
      setAddress('');
      setArea('');
      setPropertyClass('comfort');
      setPrice('');
      setCurrency('USD');
      setDeadline('');
      setStatus('draft');
    }
  }, [property, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      address,
      area,
      property_class: propertyClass,
      price,
      currency,
      deadline: deadline || null,
      status,
    });
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
        <form onSubmit={handleSubmit}>
          <Modal.Body className='space-y-4'>
            {/* Type */}
            <div className='space-y-1.5'>
              <Label.Root htmlFor='property-type'>
                Тип <Label.Asterisk />
              </Label.Root>
              <Select.Root
                size='small'
                value={type}
                onValueChange={(v) => setType(v as PropertyType)}
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
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
                  size='small'
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
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-currency'>Валюта</Label.Root>
                <Select.Root
                  size='small'
                  value={currency}
                  onValueChange={setCurrency}
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
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-status'>Статус</Label.Root>
                <Select.Root
                  size='small'
                  value={status}
                  onValueChange={(v) => setStatus(v as PropertyStatus)}
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
