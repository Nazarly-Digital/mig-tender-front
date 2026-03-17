import type { ReactNode } from 'react';

export type SelectFieldState = 'default' | 'hover' | 'focus' | 'primary_light' | 'active' | 'danger' | 'disabled';

export interface SelectFieldProps {
  label?: string;
  labelSupportText?: string;
  hint?: string;
  hintSupportText?: string;
  hintIcon?: ReactNode;
  leftImage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  primaryText?: string;
  secondaryText?: string;
  state?: SelectFieldState;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  id?: string;
}
