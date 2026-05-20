'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, CheckmarkCircle02Icon, Search01Icon, Cancel01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import { auctionSchema, auctionDraftSchema, type AuctionFormData } from '@/shared/lib/validations';
import { formatPriceInput, stripPriceFormat, formatPrice } from '@/shared/lib/formatters';
import { DateTimePicker } from '@/shared/ui/date-picker';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Select from '@/shared/ui/select';
import { useMyAvailableProperties, useProperty } from '@/features/properties';
import { useCreateAuction, useCompatibleProperties } from '@/features/auctions';
import type { AuctionMode } from '@/shared/types/auctions';
import type { Property } from '@/shared/types/properties';
import { CLASS_LABELS } from '@/shared/components/properties-table';

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
          <span className='text-[11px] font-medium text-blue-600 shrink-0'>{compatibleCount > 0 ? `${compatibleCount} подходящих объектов` : 'Нет подходящих объектов'}</span>
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
                  {TYPE_LABELS[p.type] ?? p.type} · {p.area} м²{p.property_class ? ` · ${CLASS_LABELS[p.property_class] ?? p.property_class}` : ''}
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
        <span className='block text-sm font-medium text-gray-900 truncate'>{property.address}</span>
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

function toLocalDT(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CreateAuctionPage() {
  const router = useRouter();
  const createMutation = useCreateAuction();

  const { data: propertiesData, isLoading: propertiesLoading } = useMyAvailableProperties({
    ordering: '-created_at',
    page_size: 100,
  });
  const properties = propertiesData?.results ?? [];

  // Tracks which submit button was clicked: 'draft' or 'publish'.
  const submitIntentRef = React.useRef<'draft' | 'publish'>('publish');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AuctionFormData>({
    // Pick a relaxed schema for draft submissions, strict one for publishing.
    // Schemas have slightly different shapes; the cast keeps RHF happy without
    // sacrificing field-level validation feedback at the UI layer.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: ((values: AuctionFormData, ctx: unknown, opts: unknown) => {
      const schema = submitIntentRef.current === 'draft' ? auctionDraftSchema : auctionSchema;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (zodResolver(schema) as any)(values, ctx, opts);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
    mode: 'onSubmit',
    defaultValues: {
      propertyIds: [],
      mode: 'closed',
      commission_rate: '',
      min_price: '',
      min_bid_increment: '',
      show_price_to_brokers: true,
      start_date: '',
      end_date: '',
    },
  });

  const selectedMode = watch('mode');
  const selectedPropertyIds = watch('propertyIds');
  const startDateValue = watch('start_date');

  const minStart = toLocalDT(new Date(Date.now() + 60 * 1000));
  const ONE_MINUTE_MS = 60 * 1000;
  const minEnd = startDateValue
    ? toLocalDT(new Date(new Date(startDateValue).getTime() + ONE_MINUTE_MS))
    : toLocalDT(new Date(Date.now() + ONE_MINUTE_MS));

  // Lot compatibility filter — temporarily disabled per business request.
  // Set this back to true to re-enable filtering "incompatible" properties
  // out of the closed-lot dropdown (and to re-show the reference banner).
  const ENABLE_LOT_COMPATIBILITY_FILTER = false;

  // For CLOSED mode: load compatible properties based on first selected property
  const referenceProperty = selectedMode === 'closed' && selectedPropertyIds.length > 0
    ? properties.find((p) => String(p.id) === selectedPropertyIds[0]) ?? null
    : null;
  const referencePropertyRefId = referenceProperty?.reference_id ?? '';
  const { data: compatibleProperties } = useCompatibleProperties(referencePropertyRefId, {
    enabled:
      ENABLE_LOT_COMPATIBILITY_FILTER &&
      selectedMode === 'closed' &&
      !!referencePropertyRefId,
  });

  // Properties available for selection in CLOSED mode
  const closedAvailableProperties = React.useMemo(() => {
    if (selectedMode !== 'closed') return properties;
    if (!ENABLE_LOT_COMPATIBILITY_FILTER) return properties;
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

  // Для лота из 1 объекта тянем полную карточку — нужен
  // commission_rate, чтобы автоматически подставить его при отправке.
  // Два источника на случай гонки/устаревшего бэка:
  //   1) selectedProps[0].commission_rate — синхронно из списка
  //      /properties/my/available/ (поле появилось в бэке 96d1f82,
  //      MyAvailablePropertySerializer);
  //   2) singlePropertyDetail.commission_rate — асинхронно из
  //      /properties/{id}/ (PropertyListSerializer возвращает поле
  //      давно, до 96d1f82 — это был единственный источник).
  // Если бэк 96d1f82 ещё не доехал, синхронный источник вернёт
  // undefined, и мы дождёмся детальной. Это закрывает гонку, когда
  // пользователь жмёт «Создать» раньше, чем useProperty успел
  // отыграть запрос. Фидбек 2026-05-20.
  const singlePropertyId =
    selectedPropertyIds.length === 1 ? Number(selectedPropertyIds[0]) : 0;
  const { data: singlePropertyDetail, isFetching: singleDetailLoading } =
    useProperty(singlePropertyId);

  const totalPrice = selectedProps.reduce((sum, p) => sum + (p.price ? Number(p.price) : 0), 0);

  // Эффективная комиссия для лота из 1 объекта — собираем из всех
  // доступных источников. Если null/undefined в обоих — бэк отобьёт
  // 400 «Укажите комиссию», поэтому это значение мы дополнительно
  // используем для блокировки сабмита (см. onSubmit ниже).
  const singleObjectCommission =
    selectedPropertyIds.length === 1
      ? (selectedProps[0]?.commission_rate ??
         singlePropertyDetail?.commission_rate ??
         null)
      : null;

  const onSubmit = (data: AuctionFormData) => {
    const isOpen = data.mode === 'open';
    const isDraft = submitIntentRef.current === 'draft';
    // Комиссия: для лота 2+ объектов — из поля «Комиссия лота». Для
    // одного объекта поле скрыто — используем уже разрешённую
    // singleObjectCommission (см. определение выше — оно покрывает
    // и список, и детальную, и race condition).
    const commissionRate =
      data.propertyIds.length > 1
        ? data.commission_rate
        : (singleObjectCommission ?? undefined);

    // Защита от гонки: пользователь мог нажать «Создать» раньше,
    // чем useProperty успел отдать данные, а в списке поля ещё нет
    // (старый бэк до 96d1f82). В этом случае мы НЕ можем отправить
    // commission_rate — бэк отобьёт 400 — поэтому показываем
    // понятный тост и просим повторить, вместо молчаливого сабмита.
    // Черновик пропускаем без проверки — бэк его примет без комиссии.
    if (
      !isDraft &&
      data.propertyIds.length === 1 &&
      !commissionRate
    ) {
      toast.error(
        singleDetailLoading
          ? 'Загружаем данные объекта, попробуйте ещё раз через секунду.'
          : 'У объекта не указана комиссия брокера. Откройте объект и заполните поле «Комиссия».',
      );
      return;
    }

    createMutation.mutate(
      {
        propertyIds: data.propertyIds.map(Number),
        mode: data.mode as AuctionMode,
        ...(commissionRate ? { commission_rate: commissionRate } : {}),
        // CLOSED-аукциону min_price не показывается в форме (sealed-bid
        // против собственной оценки брокера), бэк требует число — шлём 0.
        // schema сделал поле optional, поэтому coalesce на пустую строку
        // для open-mode (zod refine всё равно отсечёт пустое значение).
        min_price: isOpen ? (data.min_price ?? '') : '0',
        ...(isOpen && data.min_bid_increment ? { min_bid_increment: data.min_bid_increment } : {}),
        // `show_price_to_brokers` only applies to OPEN auctions — for
        // CLOSED skip the field entirely so a stale `false` left over
        // from an earlier mode toggle doesn't leak through.
        ...(isOpen ? { show_price_to_brokers: data.show_price_to_brokers ?? true } : {}),
        ...(data.start_date ? { start_date: new Date(data.start_date).toISOString() } : {}),
        ...(data.end_date ? { end_date: new Date(data.end_date).toISOString() } : {}),
        ...(isDraft ? { status: 'draft' as const } : {}),
      },
      {
        onSuccess: () => {
          toast.success(isDraft ? 'Черновик сохранён' : 'Аукцион успешно создан');
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 w-full'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Left — Object & Params */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
            <div className='text-[14px] font-semibold text-gray-900'>Объект и параметры</div>

            {/* Mode toggle */}
            <div className='space-y-1.5'>
              <Label.Root>Режим аукциона <Label.Asterisk /></Label.Root>
              <Controller control={control} name='mode' render={({ field }) => (
                <div className='grid grid-cols-2 gap-2'>
                  {([['closed', 'Закрытый', 'Один объект или несколько'], ['open', 'Открытый', 'Один объект']] as const).map(([v, label, desc]) => (
                    <button
                      key={v}
                      type='button'
                      onClick={() => {
                        field.onChange(v);
                        if (v === 'closed') setValue('min_bid_increment', '');
                        // Reset selection without re-running validation: errors should
                        // only appear after the user clicks "Создать аукцион".
                        setValue('propertyIds', [], { shouldValidate: false });
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

            {selectedMode === 'open' && (
              // CLOSED-mode не использует min_price (брокеры подают
              // запечатанные ставки против собственной оценки), поле
              // в спеке для них не показывается.
              <div className='space-y-1.5'>
                <Label.Root htmlFor='auction-min-price'>Стартовая цена <Label.Asterisk /></Label.Root>
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
            )}

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
                <div className='flex items-center gap-3 text-sm text-gray-400'>
                  Нет объектов.
                  <Link href='/properties/create'>
                    <FancyButton.Root variant='primary' size='xsmall'>Создать объект</FancyButton.Root>
                  </Link>
                </div>
              ) : (
                <div className='space-y-2'>
                  {/* Info banner (closed mode, reference selected).
                      Hidden while lot-compatibility filter is off — shown again
                      when ENABLE_LOT_COMPATIBILITY_FILTER is re-enabled above. */}
                  {ENABLE_LOT_COMPATIBILITY_FILTER && selectedMode === 'closed' && referenceProperty && (
                    <div className='flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5'>
                      <HugeiconsIcon icon={InformationCircleIcon} size={14} color='currentColor' strokeWidth={1.5} className='shrink-0 text-blue-600 mt-0.5' />
                      <span className='text-xs text-blue-700'>
                        Выберите один или несколько объектов. Если вы
                        выберите несколько похожих объектов, они будут
                        продаваться одним лотом.
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
                          isReference={selectedMode === 'closed' && i === 0}
                          onRemove={() => removeProperty(String(p.id))}
                        />
                      ))}
                    </div>
                  )}

                  {/* Search dropdown — hidden in open mode when 1 already selected */}
                  {!(selectedMode === 'open' && selectedPropertyIds.length >= 1) && (
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 min-w-0'>
                        <PropertySearchDropdown
                          properties={selectedMode === 'closed' ? closedAvailableProperties : properties}
                          selectedIds={selectedPropertyIds}
                          onSelect={(id) => {
                            if (selectedMode === 'open') {
                              setValue('propertyIds', [id], { shouldValidate: true });
                            } else {
                              addProperty(id);
                            }
                          }}
                          reference={selectedMode === 'closed' ? referenceProperty : null}
                        />
                      </div>
                      <Link href='/properties/create' className='shrink-0'>
                        <FancyButton.Root variant='primary' size='medium'>Создать объект</FancyButton.Root>
                      </Link>
                    </div>
                  )}

                  {/* Counter + total (closed mode, 1+ selected) */}
                  {selectedMode === 'closed' && selectedPropertyIds.length > 0 && (
                    <div className='flex items-center gap-1.5 text-xs'>
                      <span className='font-semibold text-blue-600'>
                        {selectedPropertyIds.length} {selectedPropertyIds.length === 1 ? 'объект выбран' : selectedPropertyIds.length < 5 ? 'объекта выбрано' : 'объектов выбрано'}
                      </span>
                      {selectedPropertyIds.length > 1 && (
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

            {/* Комиссия лота — поле ТОЛЬКО для лота из 2+ объектов
                (фидбек 2026-05-19). Для одного объекта (открытый
                аукцион или закрытый с 1 объектом) комиссия берётся со
                ставки самого объекта — поле не показываем. */}
            {selectedPropertyIds.length > 1 && (
            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-commission'>Комиссия брокера, % <Label.Asterisk /></Label.Root>
              <Controller control={control} name='commission_rate' render={({ field }) => (
                <Input.Root hasError={!!errors.commission_rate}>
                  <Input.Wrapper>
                    <Input.Input
                      id='auction-commission'
                      type='text'
                      inputMode='decimal'
                      placeholder='10'
                      value={field.value ?? ''}
                      onChange={(e) => {
                        // Только цифры и одна точка, максимум 2 знака после.
                        let v = e.target.value.replace(/[^\d.]/g, '');
                        const dot = v.indexOf('.');
                        if (dot !== -1) {
                          v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
                        }
                        v = v.replace(/^(\d*\.?\d{0,2}).*$/, '$1');
                        // Клиппинг к [0, 100] прямо в onChange: бэк
                        // валидирует MaxValueValidator(100), но zod
                        // refine срабатывает только на submit, поэтому
                        // без клиппинга поле молча принимает «5000000»
                        // и пользователь не понимает, что не так
                        // (фидбек 2026-05-20). Клипаем к 100, если
                        // значение явно превышает — частичные дробные
                        // правки («10.5», «99.99») продолжают работать.
                        if (v) {
                          const n = parseFloat(v);
                          if (Number.isFinite(n) && n > 100) {
                            v = '100';
                          }
                        }
                        field.onChange(v);
                      }}
                      onBlur={field.onBlur}
                    />
                  </Input.Wrapper>
                </Input.Root>
              )} />
              {errors.commission_rate ? (
                <p className='text-xs text-red-500'>{errors.commission_rate.message}</p>
              ) : (
                <p className='text-xs text-gray-400'>Единая ставка комиссии на весь лот, от 0 до 100%</p>
              )}
            </div>
            )}

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

            {/* Per spec the «Показывать прайсовую цену брокерам»
                toggle only applies to OPEN auctions — closed lots
                are sealed-bid by definition, brokers never see other
                bids or the developer's reference price either way.
                Hide the checkbox when mode === 'closed' so the form
                doesn't expose a knob that wouldn't do anything. */}
            {selectedMode === 'open' && (
              <Controller
                name='show_price_to_brokers'
                control={control}
                render={({ field }) => (
                  <label className='flex items-start gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className='mt-0.5 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20'
                    />
                    <span className='text-[13px] text-gray-700'>
                      Показывать прайсовую цену брокерам
                      <span className='block text-[11px] text-gray-400'>Если отключено, брокеры не увидят прайсовую цену</span>
                    </span>
                  </label>
                )}
              />
            )}
          </div>

          {/* Right — Dates */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4 self-start'>
            <div className='text-[14px] font-semibold text-gray-900'>Сроки проведения</div>

            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-start'>Дата начала <Label.Asterisk /></Label.Root>
              <Controller
                name='start_date'
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    id='auction-start'
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    min={minStart}
                    hasError={!!errors.start_date}
                  />
                )}
              />
              {errors.start_date && (
                <p className='text-xs text-red-500'>{errors.start_date.message}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label.Root htmlFor='auction-end'>Дата окончания <Label.Asterisk /></Label.Root>
              <Controller
                name='end_date'
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    id='auction-end'
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    min={minEnd}
                    hasError={!!errors.end_date}
                  />
                )}
              />
              {errors.end_date ? (
                <p className='text-xs text-red-500'>{errors.end_date.message}</p>
              ) : (
                <p className='text-xs text-gray-400'>Минимальная длительность аукциона — 1 минута</p>
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
            variant='basic'
            size='small'
            type='submit'
            disabled={createMutation.isPending || properties.length === 0}
            onClick={() => { submitIntentRef.current = 'draft'; }}
          >
            {createMutation.isPending && submitIntentRef.current === 'draft'
              ? 'Сохранение...'
              : 'Сохранить как черновик'}
          </FancyButton.Root>
          <FancyButton.Root
            variant='primary'
            size='small'
            type='submit'
            disabled={createMutation.isPending || properties.length === 0}
            onClick={() => { submitIntentRef.current = 'publish'; }}
          >
            {createMutation.isPending && submitIntentRef.current === 'publish'
              ? 'Создание...'
              : 'Создать аукцион'}
          </FancyButton.Root>
        </div>
      </form>
    </div>
  );
}
