'use client';

import { RiWalletLine } from '@remixicon/react';
import { PageHeader } from '@/shared/components/page-header';

export default function PaymentsPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Выплаты и история'
        description='История выплат и транзакций'
        icon={RiWalletLine}
      />

      <div className='flex flex-1 flex-col items-center justify-center gap-4 py-20'>
        <div className='flex size-12 items-center justify-center rounded-xl bg-[#F9FAFB]'>
          <RiWalletLine className='size-6 text-[#9CA3AF]' />
        </div>
        <div className='text-center'>
          <div className='text-[16px] font-semibold text-[#111827]'>Скоро здесь появится история выплат</div>
          <div className='mt-1 max-w-[360px] text-[14px] text-[#6B7280]'>
            Здесь будут отображаться ваши выплаты, комиссии и история транзакций
          </div>
        </div>
      </div>
    </div>
  );
}
