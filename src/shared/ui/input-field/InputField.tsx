'use client';

import { useId } from 'react';
import { useSquircle } from '@/shared/lib/use-squircle';
import { InputLabel } from '@/shared/ui/input-label';
import { HintLabel } from '@/shared/ui/hint-label';
import type { InputFieldProps, InputFieldState } from './input-field-types';
import { sizeConfig, stateRing } from './input-field-config';

export function InputField({
  label, labelSupportText, labelIcon,
  hint, hintSupportText, hintIcon,
  leftImage, leftIcon, rightIcon,
  size = 'md', state = 'default',
  className, disabled, id: externalId,
  ...inputProps
}: InputFieldProps) {
  const autoId = useId();
  const id = externalId ?? autoId;
  const sz = sizeConfig[size];
  const effectiveState: InputFieldState = disabled ? 'disabled' : state;
  const labelSize = size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm';

  const { ref: bgRef, style: squircleStyle } = useSquircle<HTMLDivElement>(sz.cornerRadius, 0.8);

  return (
    <div className={`flex flex-col gap-[var(--space-xs,4px)] items-start w-full ${className ?? ''}`}>
      {label && (
        <InputLabel label={label} supportText={labelSupportText} icon={labelIcon} size={labelSize} />
      )}

      <div className={[
        'relative shrink-0 w-full',
        sz.cellHeight,
        sz.ringRadius,
        stateRing[effectiveState],
        effectiveState === 'disabled' ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        'transition-shadow duration-150',
      ].join(' ')}>
        <div ref={bgRef} style={squircleStyle} className="absolute inset-0 bg-[var(--surface-s2,#f2f2f4)]" />

        <div className={`relative z-10 flex items-center w-full h-full gap-[var(--space-xs,4px)] ${sz.cellPadding}`}>
          {(leftImage || leftIcon) && (
            <div className={`flex ${sz.leftGap} items-center justify-center shrink-0`}>
              {leftImage && (
                <div className="relative rounded-full shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.03)] shrink-0 size-6 overflow-hidden">
                  <img src={leftImage} alt="" className="absolute inset-0 size-full object-cover pointer-events-none" />
                </div>
              )}
              {leftIcon && (
                <span className="overflow-clip relative shrink-0 size-6 flex items-center justify-center">
                  {leftIcon}
                </span>
              )}
            </div>
          )}

          <div className={`flex flex-1 min-w-0 items-center ${sz.innerGap} ${sz.innerPx} ${sz.lineHeight} ${sz.textSize} not-italic tracking-[var(--ls-none,0px)]`}>
            <input
              id={id}
              disabled={disabled || effectiveState === 'disabled'}
              className="font-body font-semibold flex-1 min-w-0 bg-transparent border-none outline-none text-[color:var(--text-med,#5b616d)] placeholder:text-[color:var(--text-low,#8c929c)] placeholder:font-medium"
              {...inputProps}
            />
          </div>

          {rightIcon && (
            <div className="flex items-center justify-center shrink-0">
              <span className="overflow-clip relative shrink-0 size-6 flex items-center justify-center">
                {rightIcon}
              </span>
            </div>
          )}
        </div>
      </div>

      {hint && (
        <HintLabel
          hint={hint} supportText={hintSupportText} icon={hintIcon}
          size={labelSize} variant={state === 'danger' ? 'danger' : 'default'}
        />
      )}
    </div>
  );
}
