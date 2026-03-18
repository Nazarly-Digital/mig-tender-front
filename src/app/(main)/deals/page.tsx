'use client';

import { RiHandCoinLine } from '@remixicon/react';
import { PageHeader } from '@/shared/components/page-header';

export default function DealsPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Сделки'
        description='Управление сделками и документами'
        icon={RiHandCoinLine}
      />

      <div className='flex flex-1 flex-col items-center justify-center gap-4 py-20'>
        <div className='flex size-12 items-center justify-center rounded-xl bg-gray-50'>
          <RiHandCoinLine className='size-6 text-gray-400' />
        </div>
        <div className='text-center'>
          <div className='text-base font-semibold text-gray-900'>Скоро здесь появятся сделки</div>
          <div className='mt-1 max-w-[360px] text-sm text-gray-500'>
            Здесь будут отображаться ваши сделки, загрузка ДДУ и подтверждение оплаты
          </div>
        </div>
      </div>
    </div>
  );
}
