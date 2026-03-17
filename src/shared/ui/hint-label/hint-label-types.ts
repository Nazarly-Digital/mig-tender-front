import type React from 'react';

export type HintLabelSize = 'sm' | 'md' | 'lg';
export type HintLabelVariant = 'default' | 'danger';

export type HintLabelProps = {
  hint: string;
  supportText?: string;
  icon?: React.ReactNode;
  size?: HintLabelSize;
  variant?: HintLabelVariant;
  className?: string;
};
