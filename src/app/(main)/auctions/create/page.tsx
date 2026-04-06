'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, CheckmarkCircle02Icon, Search01Icon, Cancel01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import { auctionSchema, type AuctionFormData } from '@/shared/lib/validations';
import { formatPriceInput, stripPriceFormat, formatPrice } from '@/shared/lib/formatters';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import { useMyAvailableProperties } from '@/features/properties';
import { useCreateAuction, useCompatibleProperties } from '@/features/auctions';
import type { AuctionMode } from '@/shared/types/auctions';
import type { Property } from '@/shared/types/properties';

const MODE_LABELS: Record<AuctionMode, string> = {
  open: 'Открытый',
  closed: 'Закрытый',
};

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  townhouse: 'Таунхаус',
  commercial: 'Коммерция',
  land: 'Земля',
};

function PropertySearchDropdown({
  properties,
  selectedIds,
  onSelect,
  reference,
}: {
  properties: Property[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  reference: Property | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const available = React.useMemo(() => {
    let list = properties.filter((p) => !selectedIds.includes(String(p.id)));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          (TYPE_LABELS[p.type] ?? '').toLowerCase().includes(q),
      );
    }
    return list.slice(0, 50);
  }, [properties, selectedIds, query]);

  const compatibleCount = properties.filter((p) => !selectedIds.includes(String(p.id))).length;

  return (
    <div ref={containerRef} className='relative'>
      <div
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer bg-white transition-colors ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'
          }`}
      >
        <HugeiconsIcon icon={Search01Icon} size={15} color='currentColor' strokeWidth={1.5} className='shrink-0 text-gray-400' />
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selectedIds.length === 0 ? 'Поиск объекта по адресу...' : 'Добавить ещё объект...'}
            autoFocus
            className='flex-1 border-none outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400 p-0'
          />
        ) : (
          <span className='flex-1 text-sm text-gray-400'>
            {selectedIds.length === 0 ? 'Поиск объекта по адресу...' : 'Добавить ещё объект...'}
          </span>
        )}
        {reference && (
          <span className='text-[11px] font-medium text-blue-600 shrink-0'>{compatibleCount} совмест.</span>
        )}
      </div>

      {open && (
        <div className='absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg max-h-80 overflow-y-auto'>
          {available.length === 0 ? (
            <div className='px-4 py-5 text-center text-sm text-gray-400'>
              {query ? 'Ничего не найдено' : 'Нет совместимых объектов'}
            </div>
          ) : (
            available.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelect(String(p.id));
                  setQuery('');
                  setOpen(false);
                }}
                className='px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0'
              >
                <div className='flex items-baseline justify-between'>
                  <span className='text-sm font-medium text-gray-900 truncate'>{p.address}</span>
                  {p.price && parseFloat(p.price) > 0 && (
                    <span className='text-xs text-gray-500 shrink-0 ml-2'>{formatPrice(p.price)}</span>
                  )}
                </div>
                <p className='text-xs text-gray-400 mt-0.5'>
                  {TYPE_LABELS[p.type] ?? p.type} · {p.area} м²{p.property_class ? ` · ${p.property_class}` : ''}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SelectedPropertyTag({
  property,
  isReference,
  onRemove,
}: {
  property: Property;
  isReference: boolean;
  onRemove: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isReference ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
      }`}>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-1.5'>
          <span className='text-sm font-medium text-gray-900 truncate'>{property.address}</span>
          {isReference && (
            <span className='text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0'>эталон</span>
          )}
        </div>
        <p className='text-xs text-gray-400 mt-0.5'>
          {TYPE_LABELS[property.type] ?? property.type} · {property.area} м²
        </p>
      </div>
      {property.price && parseFloat(property.price) > 0 && (
        <span className='text-xs text-gray-500 shrink-0'>{formatPrice(property.price)}</span>
      )}
      <button
        type='button'
        onClick={onRemove}
        className='shrink-0 size-5 flex items-center justify-center rounded text-gray-400 hover:text-red-500 transition-colors cursor-pointer'
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} color='currentColor' strokeWidth={1.5} />
      </button>
    </div>
  );
}

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
  const referenceProperty = selectedMode === 'closed' && selectedPropertyIds.length > 0
    ? properties.find((p) => String(p.id) === selectedPropertyIds[0]) ?? null
    : null;
  const referencePropertyRefId = referenceProperty?.reference_id ?? '';
  const { data: compatibleProperties } = useCompatibleProperties(referencePropertyRefId, {
    enabled: selectedMode === 'closed' && !!referencePropertyRefId,
  });

  // Properties available for selection in CLOSED mode
  const closedAvailableProperties = React.useMemo(() => {
    if (selectedMode !== 'closed') return properties;
    // No reference selected yet — show all properties
    if (!compatibleProperties || selectedPropertyIds.length === 0) return properties;
    // Show compatible properties + always include the reference (first selected)
    const compatibleIds = new Set(compatibleProperties.map((p) => p.id));
    const refId = Number(selectedPropertyIds[0]);
    return properties.filter((p) => p.id === refId || compatibleIds.has(p.id));
  }, [selectedMode, properties, compatibleProperties, selectedPropertyIds]);

  const addProperty = (propertyId: string) => {
    if (!selectedPropertyIds.includes(propertyId)) {
      setValue('propertyIds', [...selectedPropertyIds, propertyId], { shouldValidate: true });
    }
  };

  const removeProperty = (propertyId: string) => {
    // If removing the reference (first), clear all
    if (selectedPropertyIds[0] === propertyId) {
      setValue('propertyIds', [], { shouldValidate: true });
    } else {
      setValue('propertyIds', selectedPropertyIds.filter((id) => id !== propertyId), { shouldValidate: true });
    }
  };

  const selectedProps = selectedPropertyIds
    .map((id) => properties.find((p) => String(p.id) === id))
    .filter(Boolean) as Property[];

  const totalPrice = selectedProps.reduce((sum, p) => sum + (p.price ? Number(p.price) : 0), 0);

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

            {/* Mode toggle */}
            <div className='space-y-1.5'>
              <Label.Root>Режим аукциона <Label.Asterisk /></Label.Root>
              <Controller control={control} name='mode' render={({ field }) => (
                <div className='grid grid-cols-2 gap-2'>
                  {([['closed', 'Закрытый', '1..N объектов'], ['open', 'Открытый', '1 объект']] as const).map(([v, label, desc]) => (
                    <button
                      key={v}
                      type='button'
                      onClick={() => {
                        field.onChange(v);
                        if (v === 'closed') setValue('min_bid_increment', '');
                        setValue('propertyIds', [], { shouldValidate: true });
                      }}
                      className={`flex flex-col items-start rounded-lg px-3.5 py-2.5 text-left transition-colors cursor-pointer ${field.value === v
                          ? 'border-[1.5px] border-blue-500 bg-blue-50/60'
                          : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <span className={`text-sm font-semibold ${field.value === v ? 'text-blue-700' : 'text-gray-900'}`}>{label}</span>
                      <span className={`text-xs ${field.value === v ? 'text-blue-500' : 'text-gray-400'}`}>{desc}</span>
                    </button>
                  ))}
                </div>
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

            {/* Property selection */}
            <div className='space-y-2'>
              <div className='flex items-baseline justify-between'>
                <Label.Root>
                  {selectedMode === 'open' ? 'Объект' : 'Объекты лота'} <Label.Asterisk />
                </Label.Root>
                {selectedMode === 'closed' && selectedPropertyIds.length > 0 && (
                  <button
                    type='button'
                    onClick={() => setValue('propertyIds', [], { shouldValidate: true })}
                    className='text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer'
                  >
                    Очистить
                  </button>
                )}
              </div>

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
                /* CLOSED mode: search dropdown + tags */
                <div className='space-y-2'>
                  {/* Info banner when reference selected */}
                  {referenceProperty && (
                    <div className='flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5'>
                      <HugeiconsIcon icon={InformationCircleIcon} size={14} color='currentColor' strokeWidth={1.5} className='shrink-0 text-blue-600 mt-0.5' />
                      <span className='text-xs text-blue-700'>
                        Первый объект - эталон. В списке только совместимые объекты ({TYPE_LABELS[referenceProperty.type] ?? referenceProperty.type}, {referenceProperty.area} м²).
                      </span>
                    </div>
                  )}

                  {/* Selected property tags */}
                  {selectedProps.length > 0 && (
                    <div className='flex flex-col gap-1.5'>
                      {selectedProps.map((p, i) => (
                        <SelectedPropertyTag
                          key={p.id}
                          property={p}
                          isReference={i === 0}
                          onRemove={() => removeProperty(String(p.id))}
                        />
                      ))}
                    </div>
                  )}

                  {/* Search dropdown */}
                  <PropertySearchDropdown
                    properties={closedAvailableProperties}
                    selectedIds={selectedPropertyIds}
                    onSelect={addProperty}
                    reference={referenceProperty}
                  />

                  {/* Counter + total */}
                  {selectedPropertyIds.length > 0 && (
                    <div className='flex items-center gap-1.5 text-xs'>
                      <span className='font-semibold text-blue-600'>
                        {selectedPropertyIds.length} {selectedPropertyIds.length === 1 ? 'объект выбран' : selectedPropertyIds.length < 5 ? 'объекта выбрано' : 'объектов выбрано'}
                      </span>
                      {selectedPropertyIds.length > 1 && totalPrice > 0 && (
                        <>
                          <span className='text-gray-300'>·</span>
                          <span className='text-gray-500'>суммарно: {formatPrice(String(totalPrice))}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
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
