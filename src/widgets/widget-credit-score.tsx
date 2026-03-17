'use client';

import { RiAddLine, RiSpeedUpLine } from '@remixicon/react';

import { ButtonV2 } from '@/shared/ui/button-v2';
import * as Divider from '@/shared/ui/divider';
import { ScoreTrackChart } from '@/shared/components/score-track-chart';
import * as WidgetBox from '@/shared/components/widget-box';

export default function WidgetCreditScore({
  ...rest
}: React.ComponentPropsWithoutRef<typeof WidgetBox.Root>) {
  return (
    <WidgetBox.Root {...rest}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiSpeedUpLine} />
        Credit Score
        <ButtonV2 variant='outline' size='sm'>
          Details
        </ButtonV2>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <Divider.Root />

        <div className='flex items-center gap-4'>
          <div className='flex-1'>
            <div className='text-paragraph-lg text-text-sub-600'>
              Your{' '}
              <span className='font-medium text-text-strong-950'>
                credit score
              </span>{' '}
              is <span className='font-medium text-text-strong-950'>710</span>
            </div>
            <div className='mt-1 text-paragraph-xs text-text-sub-600'>
              This score is considered to be Excellent.
            </div>
          </div>
          <div className='flex size-11 shrink-0 items-center justify-center rounded-full bg-warning-lighter'>
            😎
          </div>
        </div>

        <ScoreTrackChart value={72} />
      </div>
    </WidgetBox.Root>
  );
}

export function WidgetCreditScoreEmpty({
  ...rest
}: React.ComponentPropsWithoutRef<typeof WidgetBox.Root>) {
  return (
    <WidgetBox.Root {...rest}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiSpeedUpLine} />
        Credit Score
        <ButtonV2 variant='outline' size='sm'>
          <RiAddLine className='size-4' />
          Apply
        </ButtonV2>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <Divider.Root />

        <div className='flex items-center gap-4'>
          <div className='flex-1'>
            <div className='text-paragraph-lg text-text-soft-400'>
              Your{' '}
              <span className='font-medium text-text-sub-600'>
                credit score
              </span>{' '}
              is <span className='font-medium text-text-sub-600'>0</span>
            </div>
            <div className='mt-1 text-paragraph-xs text-text-soft-400'>
              Feel free to build your credit history to see your score.
            </div>
          </div>
        </div>

        <ScoreTrackChart value={0} />
      </div>
    </WidgetBox.Root>
  );
}
