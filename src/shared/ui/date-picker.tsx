'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import type { Matcher } from 'react-day-picker';
import { ru } from 'react-day-picker/locale';
import { format, parse, isValid, startOfDay, isSameDay } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/shared/lib/cn';
import * as Input from '@/shared/ui/input';

const CALENDAR_CLASS_NAMES = {
  root: 'p-0',
  months: 'flex flex-col',
  month: 'space-y-3',
  month_caption: 'relative flex h-8 items-center justify-center',
  caption_label: 'text-[13px] font-semibold capitalize text-gray-900',
  // captionLayout="dropdown" replaces the static caption_label with two
  // <select>-backed pickers (month + year). Style them like our other
  // inputs so they don't fall back to native chrome rendering.
  dropdowns: 'flex items-center justify-center gap-1.5',
  dropdown_root: 'relative inline-flex items-center',
  dropdown:
    'cursor-pointer appearance-none rounded-md border border-gray-200 bg-white pl-2 pr-6 py-1 text-[13px] font-medium capitalize text-gray-900 outline-none transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
  months_dropdown: '',
  years_dropdown: '',
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

// Dropdown range — anchor on min/max when supplied, otherwise default to a
// generous past (resale of decades-old buildings is a real catalog use case)
// and a sensible future. Using full Date objects so react-day-picker can
// derive the year list from `startMonth`/`endMonth`.
const DEFAULT_DROPDOWN_PAST_YEARS = 100;
const DEFAULT_DROPDOWN_FUTURE_YEARS = 30;

function dropdownBounds(
  minDate: Date | undefined,
  maxDate: Date | undefined,
): { startMonth: Date; endMonth: Date } {
  const now = new Date();
  const startMonth =
    minDate ??
    new Date(now.getFullYear() - DEFAULT_DROPDOWN_PAST_YEARS, 0, 1);
  const endMonth =
    maxDate ??
    new Date(now.getFullYear() + DEFAULT_DROPDOWN_FUTURE_YEARS, 11, 31);
  return { startMonth, endMonth };
}

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

// Parse a datetime bound: accepts Date, 'YYYY-MM-DD', or 'YYYY-MM-DDTHH:mm'.
// Unlike parseDateString this preserves the time portion when present — needed for
// time-of-day bounds (e.g. prevent picking 22:02 when min is today 22:22).
function parseDateTimeValue(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  if (value.length >= 16) {
    const parsed = parse(value.slice(0, 16), "yyyy-MM-dd'T'HH:mm", new Date());
    if (isValid(parsed)) return parsed;
  }
  const parsed = parse(value.slice(0, 10), 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : undefined;
}

// Returns the [min, max] total-minutes-of-day window for a given selected date,
// narrowed to min/max bounds only when selected date falls on the same day.
function computeTimeBounds(
  date: Date | undefined,
  minDT: Date | undefined,
  maxDT: Date | undefined,
): { minMinutes: number; maxMinutes: number } {
  let minMinutes = 0;
  let maxMinutes = 23 * 60 + 59;
  if (date && minDT && isSameDay(date, minDT)) {
    minMinutes = minDT.getHours() * 60 + minDT.getMinutes();
  }
  if (date && maxDT && isSameDay(date, maxDT)) {
    maxMinutes = maxDT.getHours() * 60 + maxDT.getMinutes();
  }
  // Guard against bad inputs where min > max (would otherwise trap clamp).
  if (minMinutes > maxMinutes) minMinutes = maxMinutes;
  return { minMinutes, maxMinutes };
}

// Clamps (hour, minute) as total minutes-of-day to the provided bounds.
// Empty inputs stay empty — preserve the "no time set" state.
function clampTimeToBounds(
  hour: string,
  minute: string,
  bounds: { minMinutes: number; maxMinutes: number },
): { hour: string; minute: string } {
  if (hour === '' && minute === '') return { hour: '', minute: '' };
  const h = Math.max(0, Math.min(23, parseInt(hour, 10) || 0));
  const m = Math.max(0, Math.min(59, parseInt(minute, 10) || 0));
  const total = h * 60 + m;
  const clamped = Math.max(bounds.minMinutes, Math.min(bounds.maxMinutes, total));
  return {
    hour: padNumber(Math.floor(clamped / 60)),
    minute: padNumber(clamped % 60),
  };
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
    const rules: Matcher[] = [];
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
              icon={Calendar03Icon}
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
            captionLayout='dropdown'
            startMonth={dropdownBounds(minDate, maxDate).startMonth}
            endMonth={dropdownBounds(minDate, maxDate).endMonth}
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

  // Sync local time fields from external value — but only while the popover is closed.
  // While the user is actively typing inside the popover, every keystroke round-trips
  // through emitChange → padded value → prop change; syncing mid-edit would clobber
  // partial input (e.g. typing "1" would immediately become "01", blocking "12"/"23").
  React.useEffect(() => {
    if (open) return;
    const parsed = parseDateTimeString(value);
    setHourInput(parsed.hour);
    setMinuteInput(parsed.minute);
  }, [value, open]);

  // Pre-fill with current local time when the popover opens with empty time fields,
  // so the user gets a sensible default to accept or tweak rather than typing from scratch.
  // Clamp the default to [min, max] — if now is 10:00 but min requires 14:36 today,
  // we pre-fill 14:36 so the user isn't handed an invalid starting value.
  React.useEffect(() => {
    if (!open) return;
    if (hourInput === '' && minuteInput === '') {
      const now = new Date();
      const { hour: h, minute: m } = clampTimeToBounds(
        padNumber(now.getHours()),
        padNumber(now.getMinutes()),
        timeBounds,
      );
      setHourInput(h);
      setMinuteInput(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const displayText = selectedDate
    ? `${format(selectedDate, 'dd.MM.yyyy')}${hourInput && minuteInput ? `, ${padNumber(parseInt(hourInput, 10) || 0)}:${padNumber(parseInt(minuteInput, 10) || 0)}` : ''}`
    : '';

  const minDate = parseDateString(min);
  const maxDate = parseDateString(max);
  // Full datetime bounds (preserves the time portion of min/max for same-day time validation).
  const minDateTime = parseDateTimeValue(min);
  const maxDateTime = parseDateTimeValue(max);

  const dayPickerDisabled = React.useMemo(() => {
    const rules: Matcher[] = [];
    if (minDate) rules.push({ before: startOfDay(minDate) });
    if (maxDate) rules.push({ after: startOfDay(maxDate) });
    return rules.length ? rules : undefined;
  }, [minDate, maxDate]);

  const timeBounds = computeTimeBounds(selectedDate, minDateTime, maxDateTime);

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
              icon={Calendar03Icon}
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
              // Re-clamp the current time against the bounds for the newly selected date —
              // switching from a future day to today (where min might be 22:22) must bump
              // an out-of-range time (e.g. 10:00) up to the new minimum.
              const nextBounds = computeTimeBounds(date ?? undefined, minDateTime, maxDateTime);
              const { hour: h, minute: m } = clampTimeToBounds(
                hourInput || '00',
                minuteInput || '00',
                nextBounds,
              );
              setHourInput(h);
              setMinuteInput(m);
              emitChange(date ?? undefined, h, m);
            }}
            disabled={dayPickerDisabled}
            weekStartsOn={1}
            showOutsideDays
            captionLayout='dropdown'
            startMonth={dropdownBounds(minDate, maxDate).startMonth}
            endMonth={dropdownBounds(minDate, maxDate).endMonth}
            classNames={CALENDAR_CLASS_NAMES}
            components={{ Chevron: CalendarChevron }}
          />
          <div className='mt-3 flex items-center gap-2 border-t border-gray-200 pt-3'>
            <span className='text-xs font-medium text-gray-500'>Время</span>
            <input
              type='text'
              inputMode='numeric'
              placeholder='чч'
              value={hourInput}
              onChange={(e) => {
                // Rolling window: keep the last 2 digits the user typed. Lets them append
                // on top of the existing value without needing to clear it first — and avoids
                // programmatic selection (which on macOS can trigger the system Look Up menu
                // on force-click / two-finger tap).
                const v = e.target.value.replace(/\D/g, '').slice(-2);
                setHourInput(v);
                emitChange(selectedDate, v, minuteInput);
              }}
              onBlur={() => {
                // Normalize against full time bounds (hour + minute combined) — this
                // catches invalid same-day times like "22:02" when min is today 22:22.
                const { hour: h, minute: m } = clampTimeToBounds(hourInput, minuteInput, timeBounds);
                if (h !== hourInput || m !== minuteInput) {
                  setHourInput(h);
                  setMinuteInput(m);
                  emitChange(selectedDate, h, m);
                }
              }}
              className='w-14 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            />
            <span className='text-sm text-gray-400'>:</span>
            <input
              type='text'
              inputMode='numeric'
              placeholder='мм'
              value={minuteInput}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(-2);
                setMinuteInput(v);
                emitChange(selectedDate, hourInput, v);
              }}
              onBlur={() => {
                const { hour: h, minute: m } = clampTimeToBounds(hourInput, minuteInput, timeBounds);
                if (h !== hourInput || m !== minuteInput) {
                  setHourInput(h);
                  setMinuteInput(m);
                  emitChange(selectedDate, h, m);
                }
              }}
              className='w-14 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            />
            <button
              type='button'
              className='ml-auto rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700'
              onClick={() => {
                // Commit current state on explicit confirm — clamped to bounds so closing
                // without first blurring an input can't escape validation.
                const { hour: h, minute: m } = clampTimeToBounds(hourInput, minuteInput, timeBounds);
                if (h !== hourInput) setHourInput(h);
                if (m !== minuteInput) setMinuteInput(m);
                emitChange(selectedDate, h, m);
                setOpen(false);
              }}
            >
              Готово
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
