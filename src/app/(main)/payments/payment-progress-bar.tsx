'use client';

import { cn } from '@/shared/lib/cn';

type PaymentStep = {
  label: string;
  key: string;
};

const PAYMENT_STEPS: PaymentStep[] = [
  { label: 'Ожидание', key: 'pending' },
  { label: 'Подтверждена', key: 'confirmed' },
  { label: 'Выплачена', key: 'paid' },
];

type PaymentProgressBarProps = {
  currentStep: string;
};

function getStepIndex(step: string): number {
  const idx = PAYMENT_STEPS.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : 0;
}

export function PaymentProgressBar({ currentStep }: PaymentProgressBarProps) {
  const activeIndex = getStepIndex(currentStep);

  return (
    <div className="mt-4">
      {/* Step numbers + line */}
      <div className="flex items-center">
        {PAYMENT_STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          const isLast = i === PAYMENT_STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Number circle */}
              <div
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                  isCompleted || isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500',
                )}
              >
                {i + 1}
              </div>
              {/* Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-200',
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex mt-1.5">
        {PAYMENT_STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;

          return (
            <div key={step.key} className="flex-1">
              <span
                className={cn(
                  'text-[11px]',
                  isActive
                    ? 'text-emerald-600 font-medium'
                    : isCompleted
                      ? 'text-gray-500'
                      : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
