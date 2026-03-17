import type { InputHTMLAttributes } from 'react';

export type DigitInputState = 'default' | 'hover' | 'active' | 'filled' | 'danger' | 'disabled';

export interface DigitInputV2Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  state?: DigitInputState;
  className?: string;
}
