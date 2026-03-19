const ruNumberFormatter = new Intl.NumberFormat('ru-RU');

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  TRY: '₺',
};

export function formatPrice(value: string, currency?: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? currency) : '';
  return ruNumberFormatter.format(num) + (symbol ? ` ${symbol}` : '');
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
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
}

/** Strip spaces from formatted price: "10 000 000" → "10000000" */
export function stripPriceFormat(value: string): string {
  return value.replace(/\s/g, '');
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
