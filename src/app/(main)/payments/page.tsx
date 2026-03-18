'use client';

import { RiWalletLine } from '@remixicon/react';
import { PageHeader } from '@/shared/components/page-header';

export default function PaymentsPage() {
  return (
    <div className='flex flex-1 flex-col gap-8 px-6 py-8 lg:px-10'>
      <PageHeader
        title='Выплаты и история'
        description='История выплат и транзакций'
        icon={RiWalletLine}
      />

      <div className='flex flex-1 flex-col items-center justify-center gap-4 py-20'>
        <div className='flex size-16 items-center justify-center rounded-full bg-bg-weak-50'>
          <RiWalletLine className='size-8 text-text-soft-400' />
        </div>
        <div className='text-center'>
          <div className='text-label-md text-text-strong-950'>Скоро здесь появится история выплат</div>
          <div className='mt-1 max-w-sm text-paragraph-sm text-text-sub-600'>
            Здесь будут отображаться ваши выплаты, комиссии и история транзакций
          </div>
        </div>
      </div>
    </div>
  );
}
