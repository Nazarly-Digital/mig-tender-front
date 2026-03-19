'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { auctionSchema, type AuctionFormData } from '@/shared/lib/validations';
import { formatPriceInput, stripPriceFormat } from '@/shared/lib/formatters';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Hint from '@/shared/ui/hint';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import { useMyProperties } from '@/features/properties';
import { useCreateAuction } from '@/features/auctions';
import type { AuctionMode } from '@/shared/types/auctions';

const MODE_LABELS: Record<AuctionMode, string> = {
  open: 'Открытый',
  closed: 'Закрытый',
};

export default function CreateAuctionPage() {
  const router = useRouter();
  const createMutation = useCreateAuction();

  const { data: propertiesData, isLoading: propertiesLoading } = useMyProperties({
    ordering: '-created_at',
    page_size: 100,
  });
  const properties = propertiesData?.results ?? [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AuctionFormData>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      property_id: '',
      mode: 'closed',
      min_price: '',
      start_date: '',
      end_date: '',
    },
  });

  const onSubmit = (data: AuctionFormData) => {
    createMutation.mutate(
      {
        property_id: Number(data.property_id),
        mode: data.mode as AuctionMode,
        min_price: data.min_price,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Аукцион успешно создан');
          router.push('/auctions');
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { error?: string } } };
          toast.error(err.response?.data?.error ?? 'Ошибка при создании аукциона');
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

            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-property'>Объект <Label.Asterisk /></Label.Root>
              {propertiesLoading ? (
                <div className='text-sm text-gray-400'>Загрузка...</div>
              ) : properties.length === 0 ? (
                <div className='text-sm text-gray-400'>Нет объектов. Сначала создайте объект.</div>
              ) : (
                <Controller control={control} name='property_id' render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger id='auction-property'><Select.Value placeholder='Выберите объект' /></Select.Trigger>
                    <Select.Content>
                      {properties.map((p) => (
                        <Select.Item key={p.id} value={String(p.id)}>{p.address} ({p.area} м²)</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )} />
              )}
              {errors.property_id && <p className='text-xs text-red-500'>{errors.property_id.message}</p>}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='auction-mode'>Тип <Label.Asterisk /></Label.Root>
                <Controller control={control} name='mode' render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
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
                        placeholder='10 000 000'
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
          </div>

          {/* Right — Dates */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4 self-start'>
            <div className='text-[14px] font-semibold text-gray-900'>Сроки проведения</div>

            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-start'>Дата начала <Label.Asterisk /></Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input id='auction-start' type='datetime-local' {...register('start_date')} />
                </Input.Wrapper>
              </Input.Root>
              {errors.start_date && <p className='text-xs text-red-500'>{errors.start_date.message}</p>}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-end'>Дата окончания <Label.Asterisk /></Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='auction-end'
                    type='datetime-local'
                    min={watch('start_date') ? (() => {
                      const d = new Date(watch('start_date'));
                      d.setHours(d.getHours() + 1);
                      return d.toISOString().slice(0, 16);
                    })() : undefined}
                    {...register('end_date')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.end_date && <p className='text-xs text-red-500'>{errors.end_date.message}</p>}
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
