'use client';

import { cn } from '@/shared/lib/cn';
import type { DealStatus } from '@/shared/types/deals';

type Step = {
  label: string;
  key: string;
};

const DEAL_STEPS: Step[] = [
  { label: 'Загрузка документов', key: 'pending_documents' },
  { label: 'Проверка документов', key: 'admin_review' },
  { label: 'Мое подтверждение', key: 'developer_confirm' },
  { label: 'Сделка подтверждена', key: 'confirmed' },
];

type DealProgressBarProps = {
  currentStep: DealStatus;
  isOverdue?: boolean;
  stepLabels?: Partial<Record<string, string>>;
};

function getStepIndex(step: string): number {
  const idx = DEAL_STEPS.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : 0;
}

export function DealProgressBar({ currentStep, isOverdue, stepLabels }: DealProgressBarProps) {
  const isFailed = currentStep === 'failed';
  const isDeclined = currentStep === 'declined';
  const isTerminal = isFailed || isDeclined;
  const activeIndex = currentStep === 'confirmed' ? DEAL_STEPS.length - 1 : getStepIndex(currentStep);

  if (isTerminal) {
    return (
      <div className="mt-4">
        {/* All segments red/gray for failed or declined */}
        <div className="flex items-center gap-1">
          {DEAL_STEPS.map((step) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="relative flex-1 h-1 rounded-full">
                <div className="absolute inset-0 rounded-full bg-red-300" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1.5">
          <span className="text-[11px] text-red-600 font-medium">
            {isDeclined ? 'Отклонена девелопером' : 'Несостоявшаяся'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Progress line */}
      <div className="flex items-center gap-1">
        {DEAL_STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
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
