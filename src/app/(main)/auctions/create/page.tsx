'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { auctionSchema, type AuctionFormData } from '@/shared/lib/validations';
import * as Button from '@/shared/ui/button';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Hint from '@/shared/ui/hint';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import * as WidgetBox from '@/shared/components/widget-box';
import { PageHeader } from '@/shared/components/page-header';
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
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Новый аукцион'
        description='Создайте аукцион для вашего объекта недвижимости'
        backHref='/auctions'
      />

      <form onSubmit={handleSubmit(onSubmit)} className='flex w-full max-w-[640px] flex-col gap-5'>
        {/* Section: Property select */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Выбор объекта</WidgetBox.Header>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='auction-property'>
              Объект <Label.Asterisk />
            </Label.Root>
            {propertiesLoading ? (
              <div className='text-paragraph-sm text-text-soft-400'>Загрузка объектов...</div>
            ) : properties.length === 0 ? (
              <div className='text-paragraph-sm text-text-soft-400'>
                Нет доступных объектов. Сначала создайте объект.
              </div>
            ) : (
              <Controller
                control={control}
                name='property_id'
                render={({ field }) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger id='auction-property'>
                      <Select.Value placeholder='Выберите объект' />
                    </Select.Trigger>
                    <Select.Content>
                      {properties.map((p) => (
                        <Select.Item key={p.id} value={String(p.id)}>
                          {p.address} ({p.area} м²)
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            )}
            {errors.property_id && <p className='text-paragraph-xs text-error-base'>{errors.property_id.message}</p>}
            <Hint.Root>Выберите объект, который будет выставлен на аукцион</Hint.Root>
          </div>
        </WidgetBox.Root>

        {/* Section: Auction params */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Параметры аукциона</WidgetBox.Header>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='auction-mode'>
              Тип аукциона <Label.Asterisk />
            </Label.Root>
            <Controller
              control={control}
              name='mode'
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger id='auction-mode'>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {(Object.entries(MODE_LABELS) as [AuctionMode, string][]).map(
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
            {errors.mode && <p className='text-paragraph-xs text-error-base'>{errors.mode.message}</p>}
          </div>

          <div className='space-y-1.5'>
            <Label.Root htmlFor='auction-min-price'>
              Минимальная цена <Label.Asterisk />
            </Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='auction-min-price'
                  type='number'
                  step='0.01'
                  placeholder='10000000'
                  {...register('min_price')}
                />
              </Input.Wrapper>
            </Input.Root>
            {errors.min_price && <p className='text-paragraph-xs text-error-base'>{errors.min_price.message}</p>}
            <Hint.Root>Минимальная стартовая цена для ставок</Hint.Root>
          </div>
        </WidgetBox.Root>

        {/* Section: Dates */}
        <WidgetBox.Root className='space-y-5'>
          <WidgetBox.Header>Сроки проведения</WidgetBox.Header>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-start'>
                Дата начала <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='auction-start'
                    type='datetime-local'
                    {...register('start_date')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.start_date && <p className='text-paragraph-xs text-error-base'>{errors.start_date.message}</p>}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-end'>
                Дата окончания <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='auction-end'
                    type='datetime-local'
                    {...register('end_date')}
                  />
                </Input.Wrapper>
              </Input.Root>
              {errors.end_date && <p className='text-paragraph-xs text-error-base'>{errors.end_date.message}</p>}
            </div>
          </div>
        </WidgetBox.Root>

        {/* Actions */}
        <div className='flex items-center gap-3 pt-2'>
          <Link href='/auctions'>
            <Button.Root variant='neutral' mode='stroke'>
              Отмена
            </Button.Root>
          </Link>
          <FancyButton.Root
            type='submit'
            variant='primary'
            disabled={createMutation.isPending || properties.length === 0}
          >
            {createMutation.isPending ? 'Создание...' : 'Создать аукцион'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
