import type React from 'react';

export type InputLabelSize = 'sm' | 'md' | 'lg';

export type InputLabelProps = {
  label: string;
  supportText?: string;
  icon?: React.ReactNode;
  size?: InputLabelSize;
  className?: string;
};
