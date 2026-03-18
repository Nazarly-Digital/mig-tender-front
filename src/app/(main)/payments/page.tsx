'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet01Icon } from '@hugeicons/core-free-icons';
import { PageHeader } from '@/shared/components/page-header';

export default function PaymentsPage() {
  return (
    <div className='w-full px-8 py-8'>
      <PageHeader
        title='Выплаты и история'
        description='История выплат и транзакций'
      />

      <div className='flex flex-1 items-center justify-center py-32'>
        <div className='flex flex-col items-center text-center'>
          <HugeiconsIcon icon={Wallet01Icon} size={24} color='currentColor' strokeWidth={1.5} className='text-gray-300' />
          <p className='text-[14px] font-medium text-gray-900 mt-3'>Скоро здесь появится история выплат</p>
          <p className='text-[13px] text-gray-400 mt-1 max-w-sm text-center'>
            Здесь будут отображаться ваши выплаты, комиссии и история транзакций
          </p>
        </div>
      </div>
    </div>
  );
}
