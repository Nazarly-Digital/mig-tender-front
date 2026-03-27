const ruNumberFormatter = new Intl.NumberFormat('ru-RU');

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  TRY: '₺',
};

export function formatPrice(value: string, _currency?: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return ruNumberFormatter.format(num) + ' ₽';
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Format number string with spaces for display: "10000000" → "10 000 000" */
export function formatPriceInput(value: string): string {
  const clean = value.replace(/[^0-9.]/g, '');
  const [integer, decimal] = clean.split('.');
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (decimal !== undefined) {
    return `${formatted}.${decimal.slice(0, 2)}`;
  }
  return formatted;
}

/** Strip spaces from formatted price: "10 000 000" → "10000000" */
export function stripPriceFormat(value: string): string {
  return value.replace(/\s/g, '');
}

/** Limit decimal input to max 2 digits after dot/comma */
export function limitDecimal(value: string): string {
  const clean = value.replace(/[^0-9.]/g, '');
  const [integer, decimal] = clean.split('.');
  if (decimal !== undefined) {
    return `${integer}.${decimal.slice(0, 2)}`;
  }
  return clean;
}

export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
