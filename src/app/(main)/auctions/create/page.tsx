'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { auctionSchema, type AuctionFormData } from '@/shared/lib/validations';
import { formatPriceInput, stripPriceFormat, formatPrice } from '@/shared/lib/formatters';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import { useMyAvailableProperties } from '@/features/properties';
import { useCreateAuction, useCompatibleProperties } from '@/features/auctions';
import type { AuctionMode } from '@/shared/types/auctions';

const MODE_LABELS: Record<AuctionMode, string> = {
  open: 'Открытый',
  closed: 'Закрытый',
};

export default function CreateAuctionPage() {
  const router = useRouter();
  const createMutation = useCreateAuction();

  const { data: propertiesData, isLoading: propertiesLoading } = useMyAvailableProperties({
    ordering: '-created_at',
    page_size: 100,
  });
  const properties = propertiesData?.results ?? [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AuctionFormData>({
    resolver: zodResolver(auctionSchema),
    mode: 'onSubmit',
    defaultValues: {
      propertyIds: [],
      mode: 'closed',
      min_price: '',
      min_bid_increment: '',
      start_date: '',
      end_date: '',
    },
  });

  const selectedMode = watch('mode');
  const selectedPropertyIds = watch('propertyIds');

  // For CLOSED mode: load compatible properties based on first selected property
  const referencePropertyId = selectedMode === 'closed' && selectedPropertyIds.length > 0
    ? Number(selectedPropertyIds[0])
    : 0;
  const { data: compatibleProperties } = useCompatibleProperties(referencePropertyId, {
    enabled: selectedMode === 'closed' && referencePropertyId > 0,
  });

  // Properties available for selection in CLOSED mode
  const closedAvailableProperties = React.useMemo(() => {
    if (selectedMode !== 'closed') return properties;
    // No reference selected yet — show all properties
    if (!compatibleProperties || selectedPropertyIds.length === 0) return properties;
    // Show compatible properties
    const compatibleIds = new Set(compatibleProperties.map((p) => p.id));
    return properties.filter((p) => compatibleIds.has(p.id));
  }, [selectedMode, properties, compatibleProperties, selectedPropertyIds]);

  const handlePropertyToggle = (propertyId: string) => {
    const current = selectedPropertyIds;
    if (current.includes(propertyId)) {
      const next = current.filter((id) => id !== propertyId);
      setValue('propertyIds', next, { shouldValidate: true });
    } else {
      setValue('propertyIds', [...current, propertyId], { shouldValidate: true });
    }
  };

  const onSubmit = (data: AuctionFormData) => {
    const isOpen = data.mode === 'open';
    createMutation.mutate(
      {
        propertyIds: data.propertyIds.map(Number),
        mode: data.mode as AuctionMode,
        min_price: data.min_price,
        ...(isOpen && data.min_bid_increment ? { min_bid_increment: data.min_bid_increment } : {}),
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Аукцион успешно создан');
          router.push('/auctions');
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { error?: string; propertyIds?: string } } };
          toast.error(err.response?.data?.propertyIds ?? err.response?.data?.error ?? 'Ошибка при создании аукциона');
        },
      },
    );
  };

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link
          href='/auctions'
          className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors'
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color='currentColor' strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Новый аукцион</h1>
          <p className='mt-1 text-sm text-gray-500'>Создайте аукцион для вашего объекта недвижимости</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='mt-6 w-full'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Left — Object & Params */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
            <div className='text-[14px] font-semibold text-gray-900'>Объект и параметры</div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='auction-mode'>Тип <Label.Asterisk /></Label.Root>
                <Controller control={control} name='mode' render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={(v) => {
                    field.onChange(v);
                    if (v === 'closed') setValue('min_bid_increment', '');
                    // Reset property selection when switching modes
                    setValue('propertyIds', [], { shouldValidate: true });
                  }}>
                    <Select.Trigger id='auction-mode'><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {(Object.entries(MODE_LABELS) as [AuctionMode, string][]).map(([v, l]) => (
                        <Select.Item key={v} value={v}>{l}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )} />
                {errors.mode && <p className='text-xs text-red-500'>{errors.mode.message}</p>}
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='auction-min-price'>Мин. цена <Label.Asterisk /></Label.Root>
                <Controller control={control} name='min_price' render={({ field }) => (
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id='auction-min-price'
                        type='text'
                        inputMode='decimal'
                        placeholder='10 000 000 ₽'
                        value={formatPriceInput(field.value)}
                        onChange={(e) => field.onChange(stripPriceFormat(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                )} />
                {errors.min_price && <p className='text-xs text-red-500'>{errors.min_price.message}</p>}
              </div>
            </div>

            {/* Property selection */}
            <div className='space-y-1.5'>
              <Label.Root>
                {selectedMode === 'open' ? 'Объект' : 'Объекты лота'} <Label.Asterisk />
              </Label.Root>
              {propertiesLoading ? (
                <div className='text-sm text-gray-400'>Загрузка...</div>
              ) : properties.length === 0 ? (
                <div className='text-sm text-gray-400'>Нет объектов. Сначала создайте объект.</div>
              ) : selectedMode === 'open' ? (
                /* OPEN mode: single select */
                <Controller control={control} name='propertyIds' render={({ field }) => (
                  <Select.Root
                    value={field.value[0] ?? ''}
                    onValueChange={(v) => field.onChange([v])}
                  >
                    <Select.Trigger id='auction-property'><Select.Value placeholder='Выберите объект' /></Select.Trigger>
                    <Select.Content>
                      {properties.map((p) => (
                        <Select.Item key={p.id} value={String(p.id)}>{p.address} ({p.area} м²)</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )} />
              ) : (
                /* CLOSED mode: checkbox list */
                <div className='max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100'>
                  {closedAvailableProperties.length === 0 ? (
                    <div className='px-3 py-4 text-sm text-gray-400 text-center'>
                      Нет совместимых объектов
                    </div>
                  ) : (
                    closedAvailableProperties.map((p) => {
                      const isSelected = selectedPropertyIds.includes(String(p.id));
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && (
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color='white' strokeWidth={2} />
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='text-sm text-gray-900 truncate'>{p.address}</div>
                            <div className='text-xs text-gray-500'>{p.area} м² &middot; {formatPrice(p.price)}</div>
                          </div>
                          <input
                            type='checkbox'
                            className='sr-only'
                            checked={isSelected}
                            onChange={() => handlePropertyToggle(String(p.id))}
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              )}
              {selectedMode === 'closed' && selectedPropertyIds.length > 0 && (() => {
                const totalPrice = selectedPropertyIds.reduce((sum, id) => {
                  const prop = properties.find((p) => String(p.id) === id);
                  return sum + (prop ? Number(prop.price) : 0);
                }, 0);
                const count = selectedPropertyIds.length;
                return (
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>
                      Выбрано: {count} {count === 1 ? 'объект' : count < 5 ? 'объекта' : 'объектов'}
                    </span>
                    <span className='font-medium text-gray-700'>
                      Сумма: {formatPrice(String(totalPrice))}
                    </span>
                  </div>
                );
              })()}
              {errors.propertyIds && <p className='text-xs text-red-500'>{errors.propertyIds.message}</p>}
            </div>

            {selectedMode === 'open' && (
              <div className='space-y-1.5'>
                <Label.Root htmlFor='auction-min-bid-increment'>Мин. шаг ставки <Label.Asterisk /></Label.Root>
                <Controller control={control} name='min_bid_increment' render={({ field }) => (
                  <Input.Root hasError={!!errors.min_bid_increment}>
                    <Input.Wrapper>
                      <Input.Input
                        id='auction-min-bid-increment'
                        type='text'
                        inputMode='decimal'
                        placeholder='150 000 ₽'
                        value={formatPriceInput(field.value ?? '')}
                        onChange={(e) => field.onChange(stripPriceFormat(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                )} />
                {errors.min_bid_increment ? (
                  <p className='text-xs text-red-500'>{errors.min_bid_increment.message}</p>
                ) : (
                  <p className='text-xs text-gray-400'>Минимальная сумма повышения ставки</p>
                )}
              </div>
            )}
          </div>

          {/* Right — Dates */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4 self-start'>
            <div className='text-[14px] font-semibold text-gray-900'>Сроки проведения</div>

            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-start'>Дата начала <Label.Asterisk /></Label.Root>
              <Input.Root hasError={!!errors.start_date}>
                <Input.Wrapper>
                  <Input.Input
                    id='auction-start'
                    type='datetime-local'
                    {...register('start_date')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.start_date ? (
                <p className='text-xs text-red-500'>{errors.start_date.message}</p>
              ) : (
                <p className='text-xs text-gray-400'>Минимум через 1 час от текущего времени</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-end'>Дата окончания <Label.Asterisk /></Label.Root>
              <Input.Root hasError={!!errors.end_date}>
                <Input.Wrapper>
                  <Input.Input
                    id='auction-end'
                    type='datetime-local'
                    {...register('end_date')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.end_date ? (
                <p className='text-xs text-red-500'>{errors.end_date.message}</p>
              ) : (
                <p className='text-xs text-gray-400'>Минимум на 1 час позже даты начала</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='mt-5 flex items-center gap-3'>
          <Link href='/auctions'>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Link>
          <FancyButton.Root
            variant='primary'
            size='small'
            type='submit'
            disabled={createMutation.isPending || properties.length === 0}
          >
            {createMutation.isPending ? 'Создание...' : 'Создать аукцион'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
