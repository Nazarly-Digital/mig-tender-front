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
        <div className='flex size-16 items-center justify-center rounded-full bg-[#F9FAFB]'>
          <RiBarChartBoxLine className='size-8 text-[#9CA3AF]' />
        </div>
        <div className='text-center'>
          <div className='text-[16px] font-semibold text-[#111827]'>Скоро здесь появится аналитика</div>
          <div className='mt-1 max-w-sm text-[14px] text-[#6B7280]'>
            Здесь будет статистика по аукционам, объектам и сделкам
          </div>
        </div>
      </div>
    </div>
  );
}
