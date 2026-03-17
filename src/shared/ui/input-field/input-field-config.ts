import type { InputFieldSize, InputFieldState } from './input-field-types';

export const sizeConfig: Record<InputFieldSize, {
  cellHeight: string;
  cellPadding: string;
  cornerRadius: number;
  ringRadius: string;
  textSize: string;
  lineHeight: string;
  innerGap: string;
  innerPx: string;
  leftGap: string;
}> = {
  md: {
    cellHeight: 'h-[32px] min-h-[32px]',
    cellPadding: 'px-[8px] py-[4px]',
    cornerRadius: 8,
    ringRadius: 'rounded-[8px]',
    textSize: 'text-[length:var(--size-body-1,13px)]',
    lineHeight: 'leading-[var(--lh-body-1,24px)]',
    innerGap: 'gap-[4px]',
    innerPx: 'px-[2px]',
    leftGap: 'gap-[4px]',
  },
  lg: {
    cellHeight: 'h-[36px] min-h-[36px]',
    cellPadding: 'px-[10px] py-[4px]',
    cornerRadius: 10,
    ringRadius: 'rounded-[10px]',
    textSize: 'text-[length:var(--size-body-1,13px)]',
    lineHeight: 'leading-[var(--lh-body-1,24px)]',
    innerGap: 'gap-[4px]',
    innerPx: 'px-[2px]',
    leftGap: 'gap-[6px]',
  },
  xl: {
    cellHeight: 'h-[44px] min-h-[44px]',
    cellPadding: 'px-[12px] py-[8px]',
    cornerRadius: 12,
    ringRadius: 'rounded-[12px]',
    textSize: 'text-[length:var(--size-body-2,15px)]',
    lineHeight: 'leading-[var(--lh-body-2,24px)]',
    innerGap: 'gap-[4px]',
    innerPx: 'px-[4px]',
    leftGap: 'gap-[6px]',
  },
};

export const stateRing: Record<InputFieldState, string> = {
  default: '',
  active: 'shadow-[0px_0px_0px_3px_var(--outline-primary,rgba(99,102,241,0.22))]',
  danger: 'shadow-[0px_0px_0px_3px_var(--outline-danger,rgba(239,68,68,0.22))]',
  disabled: '',
};
