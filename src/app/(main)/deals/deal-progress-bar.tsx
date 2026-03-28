'use client';

import { cn } from '@/shared/lib/cn';

type Step = {
  label: string;
  key: string;
};

const DEAL_STEPS: Step[] = [
  { label: 'Документы', key: 'awaiting_documents' },
  { label: 'Проверка админа', key: 'admin_review' },
  { label: 'ОК девелопера', key: 'developer_review' },
  { label: 'Подтверждена', key: 'confirmed' },
];

type DealProgressBarProps = {
  currentStep: string;
  isOverdue?: boolean;
  // Allow customizing step labels per role
  stepLabels?: Partial<Record<string, string>>;
};

function getStepIndex(step: string): number {
  const idx = DEAL_STEPS.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : 0;
}

export function DealProgressBar({ currentStep, isOverdue, stepLabels }: DealProgressBarProps) {
  const activeIndex = currentStep === 'confirmed' ? DEAL_STEPS.length - 1 : getStepIndex(currentStep);

  return (
    <div className="mt-4">
      {/* Progress line */}
      <div className="flex items-center gap-0">
        {DEAL_STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          const isLast = i === DEAL_STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Segment line */}
              <div className="relative flex-1 h-1 rounded-full">
                <div
                  className={cn(
                    'absolute inset-0 rounded-full',
                    isOverdue && (isCompleted || isActive)
                      ? 'bg-red-400'
                      : isCompleted
                        ? currentStep === 'confirmed' ? 'bg-emerald-500' : 'bg-blue-500'
                        : isActive
                          ? currentStep === 'confirmed' ? 'bg-emerald-500' : 'bg-blue-500'
                          : 'bg-gray-200'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex mt-1.5">
        {DEAL_STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          const label = stepLabels?.[step.key] || step.label;

          return (
            <div key={step.key} className="flex-1">
              <span
                className={cn(
                  'text-[11px]',
                  isOverdue && (isCompleted || isActive)
                    ? 'text-red-600 font-medium'
                    : isActive
                      ? currentStep === 'confirmed'
                        ? 'text-emerald-600 font-medium'
                        : 'text-blue-600 font-medium'
                      : isCompleted
                        ? 'text-gray-500'
                        : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
