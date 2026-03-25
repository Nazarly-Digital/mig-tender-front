'use client';

import { Controller, type Control } from 'react-hook-form';
import * as Input from '@/shared/ui/input';
import { formatPriceInput, stripPriceFormat, limitDecimal } from '@/shared/lib/formatters';

type FieldProps = {
  control: Control<any>;
  id?: string;
  hasError?: boolean;
  size?: 'small' | 'medium';
};

export function AreaField({ control, id = 'property-area', hasError, size }: FieldProps) {
  return (
    <Controller
      name='area'
      control={control}
      render={({ field }) => (
        <Input.Root size={size} hasError={hasError}>
          <Input.Wrapper>
            <Input.Input
              id={id}
              type='text'
              inputMode='decimal'
              placeholder='120.5'
              value={field.value}
              onChange={(e) => field.onChange(limitDecimal(e.target.value))}
              onBlur={field.onBlur}
            />
          </Input.Wrapper>
        </Input.Root>
      )}
    />
  );
}

export function PriceField({ control, id = 'property-price', hasError, size }: FieldProps) {
  return (
    <Controller
      name='price'
      control={control}
      render={({ field }) => (
        <Input.Root size={size} hasError={hasError}>
          <Input.Wrapper>
            <Input.Input
              id={id}
              type='text'
              inputMode='decimal'
              placeholder='150 000'
              value={formatPriceInput(field.value)}
              onChange={(e) => field.onChange(limitDecimal(stripPriceFormat(e.target.value)))}
              onBlur={field.onBlur}
            />
          </Input.Wrapper>
        </Input.Root>
      )}
    />
  );
}
