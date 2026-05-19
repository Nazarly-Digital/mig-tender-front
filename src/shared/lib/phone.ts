import { AsYouType } from 'libphonenumber-js';

// Default seed shown in empty phone inputs — primes the +7 (Russia/KZ) mask so
// the user only has to type digits.
export const PHONE_INPUT_DEFAULT = '+7 (';

// Format an international phone number progressively. For +7 (Russia/Kazakhstan)
// we apply an explicit "+7 (XXX) XXX-XX-XX" mask so the open paren stays visible
// from the very first character. For everything else we defer to libphonenumber's
// AsYouType and post-process to wrap the first 3-digit group in parens.
export function formatPhoneInput(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return hasPlus ? '+' : '';

  // Russia / Kazakhstan: explicit mask, including the bare "+7 (" intermediate.
  if (digits.startsWith('7')) {
    const rest = digits.slice(1);
    if (rest.length === 0) return '+7 (';
    if (rest.length <= 3) return `+7 (${rest}`;
    if (rest.length <= 6) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
    if (rest.length <= 8)
      return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
    return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
  }

  const formatted = new AsYouType().input((hasPlus ? '+' : '') + digits);
  return formatted.replace(/^(\+\d{1,3}) (\d{3})(?=$| )/, '$1 ($2)');
}

// Like formatPhoneInput, but the "+7 (" prefix is undeletable — clearing the
// field or backspacing past the prefix collapses back to "+7 (". Use this for
// the broker registration UX where the country code is fixed.
export function formatPhoneInputLocked(value: string): string {
  const digits = (value || '').replace(/\D/g, '');
  // The locked "+7 (" prefix means the leading 7 in the digit stream is always
  // the country code, so peel it off before treating the rest as the subscriber
  // body. (Edge case: a user typing a fresh first character of "7" loses that
  // one keystroke, which is acceptable for RU/KZ where subscriber numbers
  // don't start with 7.)
  const body = (digits.startsWith('7') ? digits.slice(1) : digits).slice(0, 10);
  if (body.length === 0) return '+7 (';
  if (body.length <= 3) return `+7 (${body}`;
  if (body.length <= 6) return `+7 (${body.slice(0, 3)}) ${body.slice(3)}`;
  if (body.length <= 8)
    return `+7 (${body.slice(0, 3)}) ${body.slice(3, 6)}-${body.slice(6)}`;
  return `+7 (${body.slice(0, 3)}) ${body.slice(3, 6)}-${body.slice(6, 8)}-${body.slice(8, 10)}`;
}

// Strip the display formatting back down to E.164 ("+73743443433") for the
// backend. Returns "" for empty input so PATCH callers can detect "unset".
export function toE164(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return digits ? '+' + digits : '';
}

/**
 * Единое правило валидации телефона — для регистрации И личного
 * кабинета (порт с бэка apps/users/validators.py, фидбек 2026-05-19
 * «распространить правила валидации»). Возвращает текст ошибки или
 * null если номер корректен:
 *  - 10–15 цифр (8XXXXXXXXXX → 7XXXXXXXXXX);
 *  - минимум 3 разные цифры — отсекает «+7 (700) 000-00-00» и т.п.
 */
export function validatePhoneNumber(value: string): string | null {
  let digits = (value ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }
  if (digits.length < 10 || digits.length > 15) {
    return 'Введите корректный номер телефона.';
  }
  if (new Set(digits).size < 3) {
    return 'Введите корректный номер телефона.';
  }
  return null;
}
