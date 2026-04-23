'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { ru } from 'react-day-picker/locale';
import { format, parse, isValid, startOfDay } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/shared/lib/cn';
import * as Input from '@/shared/ui/input';

const CALENDAR_CLASS_NAMES = {
  root: 'p-0',
  months: 'flex flex-col',
  month: 'space-y-3',
  month_caption: 'relative flex h-8 items-center justify-center',
  caption_label: 'text-[13px] font-semibold capitalize text-gray-900',
  nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
  button_previous:
    'inline-flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40',
  button_next:
    'inline-flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40',
  chevron: 'size-4',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday:
    'flex size-9 items-center justify-center text-[11px] font-medium uppercase tracking-wide text-gray-400',
  week: 'mt-0.5 flex',
  day: 'p-0',
  day_button:
    'flex size-9 items-center justify-center rounded-md text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30',
  today: '[&>button]:font-semibold [&>button]:text-blue-600',
  selected:
    '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700 [&>button]:hover:text-white',
  outside: '[&>button]:text-gray-300',
  disabled: '[&>button]:cursor-not-allowed [&>button]:text-gray-300 [&>button]:hover:bg-transparent [&>button]:hover:text-gray-300',
  hidden: 'invisible',
} as const;

function CalendarChevron({ orientation }: { orientation?: 'left' | 'right' | 'up' | 'down' }) {
  return (
    <HugeiconsIcon
      icon={orientation === 'right' ? ArrowRight01Icon : ArrowLeft01Icon}
      size={14}
      color='currentColor'
      strokeWidth={2}
    />
  );
}

type InputSize = 'medium' | 'small' | 'xsmall';

const SIZE_STYLES: Record<InputSize, string> = {
  medium: 'gap-2 px-3 h-10',
  small: 'gap-2 px-2.5 h-9',
  xsmall: 'gap-1.5 px-2 h-8',
};

function parseDateString(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  // accept 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm'
  const datePart = value.length >= 10 ? value.slice(0, 10) : value;
  const parsed = parse(datePart, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : undefined;
}

type CommonProps = {
  id?: string;
  hasError?: boolean;
  size?: InputSize;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
};

type DatePickerProps = CommonProps & {
  value?: string;
  onChange?: (value: string) => void;
  min?: Date | string;
  max?: Date | string;
};

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  hasError,
  size = 'medium',
  disabled,
  placeholder = 'дд.мм.гггг',
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = parseDateString(value);
  const displayText = selectedDate ? format(selectedDate, 'dd.MM.yyyy') : '';

  const minDate = parseDateString(min);
  const maxDate = parseDateString(max);

  const dayPickerDisabled = React.useMemo(() => {
    const rules: { before?: Date; after?: Date }[] = [];
    if (minDate) rules.push({ before: startOfDay(minDate) });
    if (maxDate) rules.push({ after: startOfDay(maxDate) });
    return rules.length ? rules : undefined;
  }, [minDate, maxDate]);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onBlur?.();
      }}
    >
      <Input.Root size={size} hasError={hasError}>
        <Popover.Trigger asChild>
          <button
            type='button'
            id={id}
            disabled={disabled}
            className={cn(
              'flex w-full cursor-pointer items-center bg-bg-white-0 text-sm text-text-strong-950 outline-none transition duration-200 ease-out',
              'hover:bg-bg-weak-50',
              'focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
              SIZE_STYLES[size],
            )}
          >
            <span
              className={cn(
                'flex-1 truncate text-left',
                !displayText && 'text-text-soft-400',
              )}
            >
              {displayText || placeholder}
            </span>
            <HugeiconsIcon
              icon={Calendar01Icon}
              size={18}
              color='currentColor'
              strokeWidth={1.5}
              className='size-5 shrink-0 text-text-sub-600'
            />
          </button>
        </Popover.Trigger>
      </Input.Root>
      <Popover.Portal>
        <Popover.Content
          className='z-50 rounded-xl border border-gray-200 bg-white p-3 shadow-lg'
          align='start'
          sideOffset={6}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DayPicker
            mode='single'
            locale={ru}
            selected={selectedDate}
            onSelect={(date) => {
              onChange?.(date ? format(date, 'yyyy-MM-dd') : '');
              setOpen(false);
            }}
            disabled={dayPickerDisabled}
            weekStartsOn={1}
            showOutsideDays
            classNames={CALENDAR_CLASS_NAMES}
            components={{ Chevron: CalendarChevron }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

type DateTimePickerProps = CommonProps & {
  value?: string;
  onChange?: (value: string) => void;
  min?: Date | string;
  max?: Date | string;
};

function padNumber(n: number) {
  return n.toString().padStart(2, '0');
}

function parseDateTimeString(value?: string | null): { date?: Date; hour: string; minute: string } {
  if (!value) return { hour: '', minute: '' };
  const datePart = value.slice(0, 10);
  const timePart = value.length >= 16 ? value.slice(11, 16) : '';
  const date = parseDateString(datePart);
  const [hour = '', minute = ''] = timePart.split(':');
  return { date, hour, minute };
}

function combineDateTime(date: Date | undefined, hour: string, minute: string): string {
  if (!date) return '';
  const h = hour === '' ? '00' : padNumber(Math.max(0, Math.min(23, parseInt(hour, 10) || 0)));
  const m = minute === '' ? '00' : padNumber(Math.max(0, Math.min(59, parseInt(minute, 10) || 0)));
  return `${format(date, 'yyyy-MM-dd')}T${h}:${m}`;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  hasError,
  size = 'medium',
  disabled,
  placeholder = 'дд.мм.гггг, --:--',
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const { date: selectedDate, hour: initHour, minute: initMinute } = parseDateTimeString(value);
  const [hourInput, setHourInput] = React.useState(initHour);
  const [minuteInput, setMinuteInput] = React.useState(initMinute);

  // Keep local time fields in sync with external value changes
  React.useEffect(() => {
    const parsed = parseDateTimeString(value);
    setHourInput(parsed.hour);
    setMinuteInput(parsed.minute);
  }, [value]);

  const displayText = selectedDate
    ? `${format(selectedDate, 'dd.MM.yyyy')}${hourInput && minuteInput ? `, ${padNumber(parseInt(hourInput, 10) || 0)}:${padNumber(parseInt(minuteInput, 10) || 0)}` : ''}`
    : '';

  const minDate = parseDateString(min);
  const maxDate = parseDateString(max);

  const dayPickerDisabled = React.useMemo(() => {
    const rules: { before?: Date; after?: Date }[] = [];
    if (minDate) rules.push({ before: startOfDay(minDate) });
    if (maxDate) rules.push({ after: startOfDay(maxDate) });
    return rules.length ? rules : undefined;
  }, [minDate, maxDate]);

  const emitChange = (date: Date | undefined, h: string, m: string) => {
    onChange?.(combineDateTime(date, h, m));
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onBlur?.();
      }}
    >
      <Input.Root size={size} hasError={hasError}>
        <Popover.Trigger asChild>
          <button
            type='button'
            id={id}
            disabled={disabled}
            className={cn(
              'flex w-full cursor-pointer items-center bg-bg-white-0 text-sm text-text-strong-950 outline-none transition duration-200 ease-out',
              'hover:bg-bg-weak-50',
              'focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
              SIZE_STYLES[size],
            )}
          >
            <span
              className={cn(
                'flex-1 truncate text-left',
                !displayText && 'text-text-soft-400',
              )}
            >
              {displayText || placeholder}
            </span>
            <HugeiconsIcon
              icon={Calendar01Icon}
              size={18}
              color='currentColor'
              strokeWidth={1.5}
              className='size-5 shrink-0 text-text-sub-600'
            />
          </button>
        </Popover.Trigger>
      </Input.Root>
      <Popover.Portal>
        <Popover.Content
          className='z-50 rounded-xl border border-gray-200 bg-white p-3 shadow-lg'
          align='start'
          sideOffset={6}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DayPicker
            mode='single'
            locale={ru}
            selected={selectedDate}
            onSelect={(date) => {
              const h = hourInput || '00';
              const m = minuteInput || '00';
              setHourInput(h);
              setMinuteInput(m);
              emitChange(date ?? undefined, h, m);
            }}
            disabled={dayPickerDisabled}
            weekStartsOn={1}
            showOutsideDays
            classNames={CALENDAR_CLASS_NAMES}
            components={{ Chevron: CalendarChevron }}
          />
          <div className='mt-3 flex items-center gap-2 border-t border-gray-200 pt-3'>
            <span className='text-xs font-medium text-gray-500'>Время</span>
            <input
              type='number'
              min={0}
              max={23}
              placeholder='чч'
              value={hourInput}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                setHourInput(v);
                emitChange(selectedDate, v, minuteInput);
              }}
              className='w-14 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            />
            <span className='text-sm text-gray-400'>:</span>
            <input
              type='number'
              min={0}
              max={59}
              placeholder='мм'
              value={minuteInput}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                setMinuteInput(v);
                emitChange(selectedDate, hourInput, v);
              }}
              className='w-14 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            />
            <button
              type='button'
              className='ml-auto rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700'
              onClick={() => setOpen(false)}
            >
              Готово
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
