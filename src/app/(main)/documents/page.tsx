'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';

import { PageHeader } from '@/shared/components/page-header';

export default function DocumentsPage() {
  return (
    <div className='w-full px-8 py-8'>
      <PageHeader
        title='Документы'
        description='Управляйте вашими документами'
      />

      <div className='flex flex-col items-center justify-center py-32'>
        <div className='flex size-11 items-center justify-center rounded-xl bg-gray-50'>
          <HugeiconsIcon icon={File01Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
        </div>
        <p className='mt-3 text-base font-semibold text-gray-900'>Раздел в разработке</p>
        <p className='mt-1 text-sm text-gray-500'>Загрузка документов скоро будет доступна</p>
      </div>
    </div>
  );
}
