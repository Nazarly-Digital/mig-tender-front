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
