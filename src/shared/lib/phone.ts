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

// Strip the display formatting back down to E.164 ("+73743443433") for the
// backend. Returns "" for empty input so PATCH callers can detect "unset".
export function toE164(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return digits ? '+' + digits : '';
}
