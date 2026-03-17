'use client';

import { RiArrowRightUpLine } from '@remixicon/react';

import { ButtonV2 } from '@/shared/ui/button-v2';

export function MoveMoneyButton({ className }: { className?: string }) {
  return (
    <ButtonV2 className={className}>
      Move Money
      <RiArrowRightUpLine className='size-4' />
    </ButtonV2>
  );
}
