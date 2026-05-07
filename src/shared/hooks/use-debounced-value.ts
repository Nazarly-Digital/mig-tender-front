'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a value that lags behind `value` by `delayMs`. Each new
 * `value` resets the timer; once the user stops typing for `delayMs`
 * the debounced value catches up.
 *
 * Used for free-text search fields where firing a network request
 * on every keystroke would be wasteful.
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
