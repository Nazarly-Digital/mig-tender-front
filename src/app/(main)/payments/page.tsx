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
        <div className='flex size-12 items-center justify-center rounded-xl bg-gray-50'>
          <RiWalletLine className='size-6 text-gray-400' />
        </div>
        <div className='text-center'>
          <div className='text-base font-semibold text-gray-900'>Скоро здесь появится история выплат</div>
          <div className='mt-1 max-w-[360px] text-sm text-gray-500'>
            Здесь будут отображаться ваши выплаты, комиссии и история транзакций
          </div>
        </div>
      </div>
    </div>
  );
}
