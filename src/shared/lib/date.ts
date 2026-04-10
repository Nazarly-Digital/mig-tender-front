import type { FormEvent } from 'react';
import { format, isThisYear } from 'date-fns';

export function formatRelativeDate(date: Date | string): string {
  const formatString = isThisYear(date) ? 'MMM dd' : 'MMMM dd, yyyy';
  return format(date, formatString);
}

export function formatRelativeDateShortMonth(date: Date | string): string {
  const formatString = isThisYear(date) ? 'MMM dd' : 'MMMM dd, yyyy';
  return format(date, formatString);
}

// Truncates year segment to 4 digits while user is typing.
// Using onInput — runs on every keystroke.
export function clampDateInputYear(e: FormEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  const match = el.value.match(/^(\d+)(.*)$/);
  if (!match) return;
  const year = match[1];
  if (year.length > 4) {
    el.value = year.slice(0, 4) + match[2];
  }
}

// Forces year >= current year once the user finishes editing.
// Using onBlur — so it doesn't fight the user mid-typing.
export function enforceNotPastYearOnBlur(e: FormEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  const match = el.value.match(/^(\d{4})(.*)$/);
  if (!match) return;
  const currentYear = new Date().getFullYear();
  const year = parseInt(match[1], 10);
  if (year < currentYear) {
    const next = String(currentYear) + match[2];
    if (next !== el.value) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      setter?.call(el, next);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}
