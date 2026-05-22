'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ImageAdd01Icon,
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Hint from '@/shared/ui/hint';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Modal from '@/shared/ui/modal';
import * as Select from '@/shared/ui/select';
import { AreaField, PriceField } from '@/shared/components/property-fields';
import { AddressInput } from '@/shared/components/address-input';
import { useSessionStore } from '@/entities/auth/model/store';
import { useCreateProperty } from '@/features/properties';
import { propertiesService } from '@/entities/properties';
import {
  TYPE_LABELS,
  CLASS_LABELS,
  FORM_CLASS_VALUES,
  COMMERCIAL_SUBTYPE_LABELS,
} from '@/shared/components/properties-table';
import type {
  PropertyType,
  PropertyClass,
  PropertyStatus,
  CommercialSubtype,
  PropertyCreateRequest,
} from '@/shared/types/properties';
import { propertySchema, propertyDraftSchema, type PropertyFormData } from '@/shared/lib/validations';
import { DatePicker } from '@/shared/ui/date-picker';

export default function CreatePropertyPage() {
  const router = useRouter();
  const createMutation = useCreateProperty();
  const companyName = useSessionStore((s) => s.user?.developer?.company_name ?? '');
  // ТЗ от 2026-05-15 (фикс): неверифицированный девелопер не может
  // ПУБЛИКОВАТЬ объект (бэк теперь это тоже проверяет). На фронте
  // вместо disabled-кнопки — кликабельная кнопка которая показывает
  // модалку с пояснением, чтобы UX был понятный.
  const verificationStatus = useSessionStore(
    (s) => s.user?.developer?.verification_status ?? 'not_submitted',
  );
  const isDeveloperVerified = verificationStatus === 'accepted';
  const [verifyBlockOpen, setVerifyBlockOpen] = React.useState(false);

  // Tracks which submit button was clicked: 'published' or 'draft'.
  // Объявлено до useForm — resolver ниже выбирает схему по этому ref'у.
  const submitStatusRef = React.useRef<PropertyStatus>('published');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    // Для черновика — мягкая propertyDraftSchema (не требует
    // developer_name/project/commission_rate), для публикации —
    // строгая propertySchema. Тот же приём, что в форме создания
    // аукциона (auctionDraftSchema / auctionSchema). Фидбек 2026-05-22.
    resolver: ((values: PropertyFormData, ctx: unknown, opts: unknown) => {
      const schema =
        submitStatusRef.current === 'draft' ? propertyDraftSchema : propertySchema;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (zodResolver(schema) as any)(values, ctx, opts);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
    defaultValues: {
      type: 'apartment',
      property_class: 'comfort',
      currency: 'RUB',
      status: 'published',
      show_price_to_brokers: true,
      address: '',
      area: '',
      price: '',
      deadline: '',
      commission_rate: '',
      floor: '',
      developer_name: companyName,
      project: '',
      project_comment: '',
      commercial_subtype: '',
      land_number: '',
      house_number: '',
    },
  });

  const selectedType = watch('type');
  const isLand = selectedType === 'land';
  const isCommercial = selectedType === 'commercial';
  // Townhouse показывает только этаж — номера дома у него нет (юнит
  // адресуется этажом внутри секции). House — наоборот, номер дома без
  // этажа. Apartment/commercial — этаж в многоквартирном доме.
  const hasFloor =
    selectedType === 'apartment' ||
    selectedType === 'commercial' ||
    selectedType === 'townhouse';
  const hasHouseNumber = selectedType === 'house';

  // Sync company name after zustand persist rehydration
  React.useEffect(() => {
    if (companyName) setValue('developer_name', companyName);
  }, [companyName, setValue]);

  // Clear property_class when switching to land
  React.useEffect(() => {
    if (isLand) setValue('property_class', '', { shouldValidate: false });
  }, [isLand, setValue]);

  // Clear commercial_subtype when switching away from commercial
  React.useEffect(() => {
    if (!isCommercial) setValue('commercial_subtype', '', { shouldValidate: false });
  }, [isCommercial, setValue]);

  // Photo-related state
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragIndex = React.useRef<number | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`Файл \u00AB${f.name}\u00BB превышает 5MB`);
        return false;
      }
      return true;
    });
    setPhotos((prev) => [...prev, ...arr]);
    arr.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => [...prev, url]);
    });
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Revoke any remaining blob URLs on unmount to prevent memory leaks when
  // the user navigates away without submitting.
  const previewsRef = React.useRef(previews);
  previewsRef.current = previews;
  React.useEffect(() => () => {
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDrop = (dropIndex: number) => {
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    dragIndex.current = null;
    movePhoto(from, dropIndex);
  };

  const movePhoto = (from: number, to: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (data: PropertyFormData) => {
    setSubmitting(true);
    try {
      const type = data.type as PropertyType;
      const needsFloor =
        type === 'apartment' || type === 'commercial' || type === 'townhouse';
      const needsHouseNumber = type === 'house';
      // Override status with the value chosen by the clicked button.
      data = { ...data, status: submitStatusRef.current };

      const payload: PropertyCreateRequest = {
        type,
        address: data.address,
        area: data.area,
        property_class: data.property_class
          ? (data.property_class as PropertyClass)
          : null,
        price: data.price,
        currency: data.currency,
        deadline: data.deadline || null,
        commission_rate: data.commission_rate || null,
        status: data.status as PropertyStatus,
        show_price_to_brokers: data.show_price_to_brokers ?? true,
        floor: needsFloor && data.floor ? parseInt(data.floor, 10) : null,
        developer_name: data.developer_name,
        project: data.project,
        project_comment: data.project_comment ?? '',
        commercial_subtype:
          type === 'commercial' && data.commercial_subtype
            ? (data.commercial_subtype as CommercialSubtype)
            : null,
        land_number: type === 'land' && data.land_number ? data.land_number : null,
        house_number:
          needsHouseNumber && data.house_number ? data.house_number : null,
      };

      const property = await createMutation.mutateAsync(payload);

      for (let i = 0; i < photos.length; i++) {
        try {
          await propertiesService.addImage(property.id, {
            image: photos[i],
            sort_order: i,
            is_primary: i === 0,
          });
        } catch {
          toast.error(`Ошибка загрузки фото ${i + 1}`);
        }
      }
      toast.success('Объект успешно создан');
      router.push('/properties');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string | string[] } } })
        ?.response?.data?.detail;
      const text = Array.isArray(detail) ? detail[0] : detail;
      toast.error(text || 'Ошибка при создании объекта');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='w-full px-8 py-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link
          href='/properties'
          className='flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors'
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Новый объект</h1>
          <p className='mt-1 text-sm text-gray-500'>Заполните информацию о новом объекте недвижимости</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 w-full'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Left column */}
          <div className='flex flex-col gap-4'>
            {/* Basic info */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
              <div className='text-[14px] font-semibold text-gray-900'>Основная информация</div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-type'>Тип <Label.Asterisk /></Label.Root>
                  <Controller name='type' control={control} render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger id='property-type' className='cursor-pointer'><Select.Value /></Select.Trigger>
                      <Select.Content>
                        {(Object.entries(TYPE_LABELS) as [PropertyType, string][]).map(([v, l]) => (
                          <Select.Item key={v} value={v}>{l}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )} />
                  {errors.type && <p className='text-xs text-red-500'>{errors.type.message}</p>}
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-class'>Класс {!isLand && <Label.Asterisk />}</Label.Root>
                  <Controller name='property_class' control={control} render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange} disabled={isLand}>
                      <Select.Trigger id='property-class' className='cursor-pointer'><Select.Value placeholder={isLand ? '—' : undefined} /></Select.Trigger>
                      <Select.Content>
                        {FORM_CLASS_VALUES.map((v) => (
                          <Select.Item key={v} value={v}>{CLASS_LABELS[v]}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )} />
                  {errors.property_class && <p className='text-xs text-red-500'>{errors.property_class.message}</p>}
                </div>
              </div>
              {isCommercial && (
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-commercial-subtype'>Подтип коммерции <Label.Asterisk /></Label.Root>
                  <Controller name='commercial_subtype' control={control} render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger id='property-commercial-subtype' className='cursor-pointer'><Select.Value placeholder='Выберите подтип' /></Select.Trigger>
                      <Select.Content>
                        {(Object.entries(COMMERCIAL_SUBTYPE_LABELS) as [CommercialSubtype, string][]).map(([v, l]) => (
                          <Select.Item key={v} value={v}>{l}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )} />
                  {errors.commercial_subtype && <p className='text-xs text-red-500'>{errors.commercial_subtype.message}</p>}
                </div>
              )}
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-address'>Адрес <Label.Asterisk /></Label.Root>
                <Controller
                  name='address'
                  control={control}
                  render={({ field }) => (
                    <AddressInput
                      id='property-address'
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder='ул. Примерная, д. 1'
                      hasError={!!errors.address}
                    />
                  )}
                />
                {errors.address && (
                  <p className='text-xs text-red-500'>{errors.address.message}</p>
                ) }
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-developer-name'>Застройщик <Label.Asterisk /></Label.Root>
                  {/* Если company_name есть в профиле — поле заблокировано
                      и автозаполнено названием компании. Если профиль ещё
                      без company_name (новый девелопер) — разблокируем,
                      чтобы пользователь мог ввести застройщика вручную и
                      не застрять с пустым disabled-полем (фидбек 2026-05-22). */}
                  <Input.Root hasError={!!errors.developer_name}>
                    <Input.Wrapper>
                      <Input.Input
                        id='property-developer-name'
                        type='text'
                        disabled={!!companyName}
                        placeholder={companyName ? undefined : 'Название застройщика'}
                        className='disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
                        {...register('developer_name')}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.developer_name && (
                    <p className='text-xs text-red-500'>{errors.developer_name.message}</p>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-project'>Название проекта <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.project}>
                    <Input.Wrapper>
                      <Input.Input id='property-project' type='text' placeholder='Название проекта' {...register('project')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.project && <p className='text-xs text-red-500'>{errors.project.message}</p>}
                </div>
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-project-comment'>Комментарий к проекту</Label.Root>
                <textarea
                  id='property-project-comment'
                  rows={3}
                  placeholder='Например: первая очередь, вид на парк'
                  className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none'
                  {...register('project_comment')}
                />
              </div>
              <div className='space-y-1.5'>
                <Label.Root htmlFor='property-area'>Площадь ({isLand ? 'сот' : 'м²'}) <Label.Asterisk /></Label.Root>
                <AreaField control={control} hasError={!!errors.area} />
                {errors.area && <p className='text-xs text-red-500'>{errors.area.message}</p>}
              </div>
              {hasFloor && (
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-floor'>Этаж <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.floor}>
                    <Input.Wrapper>
                      <Input.Input
                        id='property-floor'
                        type='text'
                        inputMode='numeric'
                        placeholder='5'
                        {...register('floor', {
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            const filtered = e.target.value.replace(/\D/g, '');
                            setValue('floor', filtered, { shouldValidate: true });
                          },
                        })}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.floor && <p className='text-xs text-red-500'>{errors.floor.message}</p>}
                </div>
              )}
              {isLand && (
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-land-number'>Номер участка <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.land_number}>
                    <Input.Wrapper>
                      <Input.Input id='property-land-number' type='text' placeholder='12А' {...register('land_number')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.land_number && <p className='text-xs text-red-500'>{errors.land_number.message}</p>}
                </div>
              )}
              {hasHouseNumber && (
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-house-number'>Номер дома <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.house_number}>
                    <Input.Wrapper>
                      <Input.Input id='property-house-number' type='text' placeholder='15' {...register('house_number')} />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.house_number && <p className='text-xs text-red-500'>{errors.house_number.message}</p>}
                </div>
              )}
            </div>

            {/* Price & Status */}
            <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4'>
              <div className='text-[14px] font-semibold text-gray-900'>Стоимость и сроки</div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-price'>Прайсовая цена <Label.Asterisk /></Label.Root>
                  <PriceField control={control} hasError={!!errors.price} />
                  {errors.price && <p className='text-xs text-red-500'>{errors.price.message}</p>}
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-deadline'>Срок сдачи</Label.Root>
                  <Controller
                    name='deadline'
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        id='property-deadline'
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <Hint.Root>Если неизвестен — пусто</Hint.Root>
                </div>
                <div className='space-y-1.5'>
                  <Label.Root htmlFor='property-commission'>Комиссия брокера (%) <Label.Asterisk /></Label.Root>
                  <Input.Root hasError={!!errors.commission_rate}>
                    <Input.Wrapper>
                      <Input.Input
                        id='property-commission'
                        type='text'
                        inputMode='decimal'
                        placeholder='3'
                        {...register('commission_rate', {
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            // Allow digits + a single dot only.
                            let v = e.target.value.replace(/[^\d.]/g, '');
                            const firstDot = v.indexOf('.');
                            if (firstDot !== -1) {
                              v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
                            }
                            setValue('commission_rate', v, { shouldValidate: true });
                          },
                        })}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.commission_rate && (
                    <p className='text-xs text-red-500'>{errors.commission_rate.message}</p>
                  ) }
                </div>
              </div>

              {/* Visibility */}
              <Controller
                name='show_price_to_brokers'
                control={control}
                render={({ field }) => (
                  <label className='flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5'>
                    <input
                      type='checkbox'
                      checked={field.value !== false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className='mt-0.5 size-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <div className='flex flex-col'>
                      <span className='text-[13px] font-medium text-gray-900'>Показывать прайсовую цену брокерам</span>
                      <span className='text-[11px] text-gray-500'>Если выключено — цена будет скрыта в каталоге и в открытом аукционе</span>
                    </div>
                  </label>
                )}
              />
            </div>
          </div>

          {/* Right column — Photos */}
          <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-4 self-start'>
            <div className='text-[14px] font-semibold text-gray-900'>Фотографии</div>

            {previews.length > 0 && (
              <div className='space-y-2'>
                {previews.map((src, i) => (
                  <div
                    key={src}
                    className='group flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5 cursor-grab active:cursor-grabbing'
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                  >
                    <img
                      src={src}
                      alt=''
                      className='h-14 w-14 flex-shrink-0 rounded-md object-cover'
                    />
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='truncate text-xs text-gray-500'>#{i + 1}</span>
                      {i === 0 && (
                        <span className='inline-flex w-fit items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700'>
                          Главная
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-0.5'>
                      <button
                        type='button'
                        disabled={i === 0}
                        onClick={() => movePhoto(i, i - 1)}
                        className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30'
                        title='Переместить выше'
                      >
                        <HugeiconsIcon icon={ArrowUp01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                      </button>
                      <button
                        type='button'
                        disabled={i === previews.length - 1}
                        onClick={() => movePhoto(i, i + 1)}
                        className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30'
                        title='Переместить ниже'
                      >
                        <HugeiconsIcon icon={ArrowDown01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                      </button>
                      <button
                        type='button'
                        onClick={() => handleRemovePhoto(i)}
                        className='flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600'
                        title='Удалить'
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={12} color='currentColor' strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type='button'
              onClick={() => inputRef.current?.click()}
              className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/30 px-4 py-8 text-sm text-gray-400 transition-colors hover:border-blue-200 hover:text-gray-600'
            >
              <HugeiconsIcon icon={ImageAdd01Icon} size={16} />
              Добавить фотографии
            </button>
            <input
              ref={inputRef}
              type='file'
              multiple
              accept='image/*'
              className='hidden'
              onChange={(e) => handleAddPhotos(e.target.files)}
            />
            <p className='text-[11px] text-gray-400'>Перетащите для порядка. Первая фотография – главная</p>
          </div>
        </div>

        {/* Actions */}
        <div className='mt-5 flex items-center gap-3'>
          <Link href='/properties'>
            <FancyButton.Root variant='basic' size='small'>
              Отмена
            </FancyButton.Root>
          </Link>
          <FancyButton.Root
            variant='basic'
            size='small'
            type='submit'
            disabled={submitting}
            onClick={() => { submitStatusRef.current = 'draft'; }}
          >
            {submitting && submitStatusRef.current === 'draft' ? 'Сохранение...' : 'Сохранить как черновик'}
          </FancyButton.Root>
          <FancyButton.Root
            variant='primary'
            size='small'
            // Не делаем disabled — иначе пользователь не понимает почему
            // кнопка серая. Делаем кликабельной и при non-accepted
            // показываем модалку.
            type={isDeveloperVerified ? 'submit' : 'button'}
            disabled={submitting}
            onClick={(e) => {
              if (!isDeveloperVerified) {
                e.preventDefault();
                setVerifyBlockOpen(true);
                return;
              }
              submitStatusRef.current = 'published';
            }}
          >
            {submitting && submitStatusRef.current === 'published' ? 'Публикация...' : 'Опубликовать'}
          </FancyButton.Root>
        </div>
      </form>

      {/* Модалка-объяснение для неверифицированного девелопера. */}
      <Modal.Root open={verifyBlockOpen} onOpenChange={setVerifyBlockOpen}>
        <Modal.Content className='max-w-[440px]'>
          <Modal.Header
            title='Объект пока нельзя опубликовать'
            description={
              verificationStatus === 'in_review'
                ? 'Ваш профиль на проверке у администратора. Опубликовать объект можно сразу после верификации — мы пришлём уведомление.'
                : 'Чтобы публиковать объекты, заполните профиль и отправьте его на проверку администратору в Личном кабинете.'
            }
          />
          <Modal.Body>
            <p className='text-[13px] text-gray-500'>
              Сейчас вы можете сохранить объект как черновик — после верификации его получится опубликовать одним кликом.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='basic' size='small'>
                Закрыть
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              variant='primary'
              size='small'
              onClick={() => {
                setVerifyBlockOpen(false);
                router.push('/cabinet');
              }}
            >
              Перейти в кабинет
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
