/**
 * Клиентская валидация российского ИНН — портирована 1-в-1 из бэка
 * (apps/users/validators.py). Нужна чтобы ловить ошибку ИНН inline,
 * сразу после ввода 10/12 цифр, а не на сабмите (фидбек 2026-05-16).
 *
 *  - 10 цифр — юр.лицо (developer / компания)
 *  - 12 цифр — физлицо / ИП (broker)
 */

function checksum(digits: number[], weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += digits[i] * weights[i];
  }
  return (sum % 11) % 10;
}

/**
 * Возвращает текст ошибки или null если ИНН корректен.
 * `expectedLength` — если задана, дополнительно требует ровно
 * 10 или 12 цифр (по роли).
 */
export function validateInn(
  value: string,
  expectedLength?: 10 | 12,
): string | null {
  const inn = (value ?? '').trim();

  if (!/^\d+$/.test(inn)) {
    return 'ИНН должен содержать только цифры.';
  }
  if (inn.length !== 10 && inn.length !== 12) {
    return 'ИНН должен содержать ровно 10 или 12 цифр.';
  }
  if (expectedLength && inn.length !== expectedLength) {
    return `ИНН должен содержать ровно ${expectedLength} цифр.`;
  }

  const regionCode = parseInt(inn.slice(0, 2), 10);
  const taxOfficeCode = parseInt(inn.slice(2, 4), 10);
  if (regionCode < 1 || regionCode > 99) {
    return 'Некорректный ИНН: код региона должен быть в диапазоне 01–99.';
  }
  if (taxOfficeCode < 1 || taxOfficeCode > 99) {
    return 'Некорректный ИНН: код налоговой должен быть в диапазоне 01–99.';
  }

  const digits = inn.split('').map((c) => parseInt(c, 10));

  if (inn.length === 10) {
    const weights10 = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    if (checksum(digits.slice(0, 9), weights10) !== digits[9]) {
      return 'Некорректный ИНН: контрольная цифра не совпадает (10-значный ИНН).';
    }
    return null;
  }

  const weights11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  const weights12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  const control11 = checksum(digits.slice(0, 10), weights11);
  const control12 = checksum(digits.slice(0, 11), weights12);
  if (control11 !== digits[10] || control12 !== digits[11]) {
    return 'Некорректный ИНН: контрольная цифра не совпадает (12-значный ИНН).';
  }
  return null;
}
