'use client';

import {
  RiAddLine,
  RiDropFill,
  RiFireFill,
  RiFlashlightLine,
  RiHandHeartFill,
} from '@remixicon/react';

import { cnExt } from '@/shared/lib/cn';
import { ButtonV2 } from '@/shared/ui/button-v2';
import * as Divider from '@/shared/ui/divider';
import IllustrationEmptySavedActions from '@/shared/components/empty-state-illustrations/saved-actions';
import { SavedAction, SavedActionItem } from '@/shared/components/saved-action-item';
import * as WidgetBox from '@/shared/components/widget-box';

const savedActions: (SavedAction & { id: string })[] = [
  {
    id: 'c26021a3',
    name: 'Rent Payment',
    description: 'Monthly rent payment.',
    transaction: 900,
    type: 'water',
    icon: RiDropFill,
  },
  {
    id: '19238ccd',
    name: "Natalia's Tuition",
    description: "Nat's university fee.",
    transaction: 750,
    avatar: '/images/avatar/illustration/natalia.png',
  },
  {
    id: '6e7be0a2',
    name: 'Donation to TEMA',
    description: 'In the name of our family.',
    transaction: 100,
    type: 'donate',
    icon: RiHandHeartFill,
  },
  {
    id: '7b04b90d',
    name: 'Gas Bill Payment',
    description: 'Monthly gas bill payment.',
    transaction: 20,
    type: 'gas',
    icon: RiFireFill,
  },
];

export default function WidgetSavedActions({
  ...rest
}: React.ComponentPropsWithoutRef<typeof WidgetBox.Root>) {
  return (
    <WidgetBox.Root {...rest}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiFlashlightLine} />
        Saved Actions
        <ButtonV2 variant='outline' size='sm'>
          See All
        </ButtonV2>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <Divider.Root />

        <div className='w-full pb-1'>
          <div className='flex flex-col gap-0.5'>
            {savedActions.map(({ id, ...rest }) => (
              <SavedActionItem key={id} {...rest} />
            ))}
          </div>

          <ButtonV2 variant='outline' size='lg' className='mt-3.5 w-full'>
            <RiAddLine className='size-4' />
            Save a New Action
          </ButtonV2>
        </div>
      </div>
    </WidgetBox.Root>
  );
}

export function WidgetSavedActionsEmpty({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <WidgetBox.Root
      className={cnExt('flex flex-col self-stretch', className)}
      {...rest}
    >
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiFlashlightLine} />
        Saved Actions
      </WidgetBox.Header>

      <div className='flex flex-1 flex-col gap-4'>
        <Divider.Root />
        <div className='flex flex-1 flex-col items-center justify-center gap-5 p-5'>
          <IllustrationEmptySavedActions className='size-[108px]' />
          <div className='text-center text-paragraph-sm text-text-soft-400'>
            You do not have any saved actions.
            <br />
            Feel free to save one.
          </div>
          <ButtonV2 variant='outline' size='sm'>
            <RiAddLine className='size-4' />
            Save a New Action
          </ButtonV2>
        </div>
      </div>
    </WidgetBox.Root>
  );
}
