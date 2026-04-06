'use client';

import * as React from 'react';
import * as Input from '@/shared/ui/input';

const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
const DADATA_TOKEN = process.env.NEXT_PUBLIC_DADATA_TOKEN ?? '';

type DadataSuggestion = {
  value: string;
  unrestricted_value: string;
  data: Record<string, unknown>;
};

type AddressInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hasError?: boolean;
};

export function AddressInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder = 'Введите адрес',
  hasError,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = React.useState<DadataSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = React.useCallback(async (query: string) => {
    if (!query.trim() || !DADATA_TOKEN) {
      setSuggestions([]);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(DADATA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${DADATA_TOKEN}`,
        },
        body: JSON.stringify({ query, count: 7 }),
        signal: controller.signal,
      });

      if (!res.ok) return;

      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setOpen(true);
    } catch {
      // Ignore abort errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleSelect = (suggestion: DadataSuggestion) => {
    onChange(suggestion.value);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className='relative'>
      <Input.Root hasError={hasError}>
        <Input.Wrapper>
          <Input.Input
            id={id}
            type='text'
            autoComplete='off'
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            onBlur={onBlur}
          />
          {loading && (
            <div className='shrink-0 size-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
          )}
        </Input.Wrapper>
      </Input.Root>

      {open && suggestions.length > 0 && (
        <div className='absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto'>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type='button'
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className='w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer'
            >
              {s.value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
