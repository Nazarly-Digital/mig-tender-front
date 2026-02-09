'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
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

  const [propertyId, setPropertyId] = React.useState('');
  const [mode, setMode] = React.useState<AuctionMode>('closed');
  const [minPrice, setMinPrice] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!propertyId) {
      toast.error('Выберите объект');
      return;
    }

    createMutation.mutate(
      {
        property_id: Number(propertyId),
        mode,
        min_price: minPrice,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
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
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title='Новый аукцион'
        description='Создайте аукцион для вашего объекта недвижимости'
        backHref='/auctions'
      />

      <form onSubmit={handleSubmit} className='flex w-full max-w-[640px] flex-col gap-5'>
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
              <Select.Root
                value={propertyId}
                onValueChange={setPropertyId}
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
            <Select.Root
              value={mode}
              onValueChange={(v) => setMode(v as AuctionMode)}
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
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  required
                />
              </Input.Wrapper>
            </Input.Root>
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
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
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
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
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
