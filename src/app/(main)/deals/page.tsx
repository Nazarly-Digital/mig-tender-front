'use client';

import { RiHandCoinLine } from '@remixicon/react';
import { PageHeader } from '@/shared/components/page-header';

export default function DealsPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title='Сделки'
        description='Управление сделками и документами'
        icon={RiHandCoinLine}
      />

      <div className='flex flex-1 flex-col items-center justify-center gap-4 py-20'>
        <div className='flex size-16 items-center justify-center rounded-full bg-bg-weak-50'>
          <RiHandCoinLine className='size-8 text-text-soft-400' />
        </div>
        <div className='text-center'>
          <div className='text-label-md text-text-strong-950'>Скоро здесь появятся сделки</div>
          <div className='mt-1 max-w-sm text-paragraph-sm text-text-sub-600'>
            Здесь будут отображаться ваши сделки, загрузка ДДУ и подтверждение оплаты
          </div>
        </div>
      </div>
    </div>
  );
}
