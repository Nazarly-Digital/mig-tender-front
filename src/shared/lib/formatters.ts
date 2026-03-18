const ruNumberFormatter = new Intl.NumberFormat('ru-RU');

export function formatPrice(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return ruNumberFormatter.format(num);
}

export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
