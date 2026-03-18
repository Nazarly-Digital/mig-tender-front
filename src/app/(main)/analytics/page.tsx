'use client';

import { RiBarChartBoxLine } from '@remixicon/react';
import { PageHeader } from '@/shared/components/page-header';

export default function AnalyticsPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Аналитика и история'
        description='Статистика и аналитика по вашим аукционам'
        icon={RiBarChartBoxLine}
      />

      <div className='flex flex-1 flex-col items-center justify-center gap-4 py-20'>
        <div className='flex size-12 items-center justify-center rounded-xl bg-gray-50'>
          <RiBarChartBoxLine className='size-6 text-gray-400' />
        </div>
        <div className='text-center'>
          <div className='text-base font-semibold text-gray-900'>Скоро здесь появится аналитика</div>
          <div className='mt-1 max-w-[360px] text-sm text-gray-500'>
            Здесь будет статистика по аукционам, объектам и сделкам
          </div>
        </div>
      </div>
    </div>
  );
}
