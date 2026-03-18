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
        <div className='flex size-12 items-center justify-center rounded-xl bg-[#F9FAFB]'>
          <RiHandCoinLine className='size-6 text-[#9CA3AF]' />
        </div>
        <div className='text-center'>
          <div className='text-[16px] font-semibold text-[#111827]'>Скоро здесь появятся сделки</div>
          <div className='mt-1 max-w-[360px] text-[14px] text-[#6B7280]'>
            Здесь будут отображаться ваши сделки, загрузка ДДУ и подтверждение оплаты
          </div>
        </div>
      </div>
    </div>
  );
}
