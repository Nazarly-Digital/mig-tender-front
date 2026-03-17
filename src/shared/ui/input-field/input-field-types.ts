import type React from 'react';
import type { InputHTMLAttributes } from 'react';

export type InputFieldSize = 'md' | 'lg' | 'xl';
export type InputFieldState = 'default' | 'active' | 'danger' | 'disabled';

export type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  labelSupportText?: string;
  labelIcon?: React.ReactNode;
  hint?: string;
  hintSupportText?: string;
  hintIcon?: React.ReactNode;
  leftImage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: InputFieldSize;
  state?: InputFieldState;
  className?: string;
};
