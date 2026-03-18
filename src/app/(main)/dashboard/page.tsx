'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  EyeIcon,
  ArrowRight01Icon,
  Building03Icon,
  Award01Icon,
} from '@hugeicons/core-free-icons';

import { useMyProperties } from '@/features/properties';
import { useMyAuctions, useAuctions } from '@/features/auctions';
import { useSessionStore } from '@/entities/auth/model/store';
import {
  TYPE_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import type { Property } from '@/shared/types/properties';
import type { Auction } from '@/shared/types/auctions';

function StatCard({
  label,
  value,
  href,
  action,
  icon,
}: {
  label: string;
  value: number | string;
  href: string;
  action: string;
  icon: typeof Building03Icon;
}) {
  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-blue-50'>
          <HugeiconsIcon icon={icon} size={16} color='currentColor' strokeWidth={1.5} className='text-blue-600' />
        </div>
        <span className='text-[12px] font-semibold text-gray-500'>{label}</span>
      </div>
      <span className='mt-3 block text-2xl font-bold tracking-tight text-gray-900'>
        {value}
      </span>
      <div className='mt-4 border-t border-blue-50 pt-3'>
        <Link
          href={href}
          className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-blue-600'
        >
          {action}
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} color='currentColor' strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

function QuickActionCard({ isDeveloper }: { isDeveloper: boolean }) {
  return (
    <div className='group flex flex-col justify-between rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div>
        <span className='text-[14px] font-semibold text-gray-900'>Быстрое действие</span>
        <p className='mt-1 text-[13px] text-gray-400'>
          {isDeveloper ? 'Создайте новый объект или аукцион' : 'Просмотрите доступные аукционы'}
        </p>
      </div>
      <Link href={isDeveloper ? '/properties/create' : '/auctions'} className='mt-4'>
        <button
          type='button'
          className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue-700'
        >
          <HugeiconsIcon
            icon={isDeveloper ? Add01Icon : EyeIcon}
            size={16}
            color='currentColor'
            strokeWidth={1.5}
          />
          {isDeveloper ? 'Создать объект' : 'Смотреть аукционы'}
        </button>
      </Link>
    </div>
  );
}

function RecentPropertyItem({ property }: { property: Property }) {
  const statusStyles: Record<string, string> = {
    published: 'bg-emerald-50 text-emerald-700',
    draft: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className='flex items-center gap-3 px-5 py-3 border-b border-blue-50 last:border-0 transition-colors hover:bg-blue-50/20'>
      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50'>
        <HugeiconsIcon icon={Building03Icon} size={15} color='currentColor' strokeWidth={1.5} className='text-blue-500' />
      </div>
      <div className='min-w-0 flex-1'>
        <span className='block truncate text-[13px] font-medium text-gray-900'>
          {property.address}
        </span>
        <span className='mt-0.5 flex items-center gap-1.5 text-[12px] text-gray-400'>
          <span>{TYPE_LABELS[property.type]}</span>
          <span className='text-gray-300'>·</span>
          <span>{formatPrice(property.price)} {property.currency}</span>
        </span>
      </div>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[property.status] ?? 'bg-gray-100 text-gray-500'}`}>
        {STATUS_LABELS[property.status]}
      </span>
    </div>
  );
}

function RecentAuctionItem({ auction }: { auction: Auction }) {
  const statusMap: Record<string, { label: string; style: string }> = {
    active: { label: 'Активный', style: 'bg-emerald-50 text-emerald-700' },
    finished: { label: 'Завершён', style: 'bg-blue-50 text-blue-600' },
    draft: { label: 'Черновик', style: 'bg-amber-50 text-amber-700' },
    cancelled: { label: 'Отменён', style: 'bg-gray-100 text-gray-500' },
  };
  const status = statusMap[auction.status] ?? { label: auction.status, style: 'bg-gray-100 text-gray-500' };

  return (
    <div className='flex items-center gap-3 px-5 py-3 border-b border-blue-50 last:border-0 transition-colors hover:bg-blue-50/20'>
      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50'>
        <HugeiconsIcon icon={Award01Icon} size={15} color='currentColor' strokeWidth={1.5} className='text-blue-500' />
      </div>
      <div className='min-w-0 flex-1'>
        <span className='block truncate text-[13px] font-medium text-gray-900'>
          Аукцион #{auction.id}
        </span>
        <span className='mt-0.5 flex items-center gap-1.5 text-[12px] text-gray-400'>
          <span>от {formatPrice(auction.min_price)}</span>
          <span className='text-gray-300'>·</span>
          <span>{formatDateShort(auction.end_date)}</span>
        </span>
      </div>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${status.style}`}>
        {status.label}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const user = useSessionStore((s) => s.user);
  const isDeveloper = user?.role === 'developer';

  const { data: propertiesData } = useMyProperties({ page_size: 5, ordering: '-created_at' });
  const myAuctions = useMyAuctions(isDeveloper ? { page_size: 5, ordering: '-created_at' } : undefined);
  const allAuctions = useAuctions(!isDeveloper ? { page_size: 5, ordering: '-created_at' } : undefined);

  const auctionsData = isDeveloper ? myAuctions.data : allAuctions.data;

  const propertiesCount = propertiesData?.count ?? 0;
  const auctionsCount = auctionsData?.count ?? 0;
  const recentProperties = propertiesData?.results ?? [];
  const recentAuctions = auctionsData?.results ?? [];

  const greeting = user?.first_name ? `Привет, ${user.first_name}` : 'Добро пожаловать';

  return (
    <div className='w-full px-8 py-8'>
      <div className='flex flex-col gap-8'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight text-gray-900'>{greeting}</h1>
          <p className='mt-1 text-[13px] text-gray-500'>
            Вот последние данные вашей панели управления.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {isDeveloper ? (
            <StatCard label='Мои объекты' value={propertiesCount} href='/properties' action='Все объекты' icon={Building03Icon} />
          ) : (
            <>
              <StatCard label='Каталог объектов' value={propertiesCount} href='/catalog' action='Открыть каталог' icon={Building03Icon} />
              <StatCard label='Доступные аукционы' value={auctionsCount} href='/auctions' action='Все аукционы' icon={Award01Icon} />
            </>
          )}
          {isDeveloper && (
            <StatCard label='Мои аукционы' value={auctionsCount} href='/auctions' action='Подробнее' icon={Award01Icon} />
          )}
          <QuickActionCard isDeveloper={isDeveloper} />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {isDeveloper && (
            <div className='overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
              <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                <span className='text-[14px] font-semibold text-gray-900'>Последние объекты</span>
                <Link href='/properties' className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-blue-600'>
                  Все <HugeiconsIcon icon={ArrowRight01Icon} size={12} color='currentColor' strokeWidth={1.5} />
                </Link>
              </div>
              {recentProperties.length === 0 ? (
                <div className='py-10 text-center text-[13px] text-gray-400'>Нет объектов</div>
              ) : (
                <div>{recentProperties.map((p) => <RecentPropertyItem key={p.id} property={p} />)}</div>
              )}
            </div>
          )}

          <div className='overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
            <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
              <span className='text-[14px] font-semibold text-gray-900'>
                {isDeveloper ? 'Мои аукционы' : 'Доступные аукционы'}
              </span>
              <Link href='/auctions' className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-blue-600'>
                Все <HugeiconsIcon icon={ArrowRight01Icon} size={12} color='currentColor' strokeWidth={1.5} />
              </Link>
            </div>
            {recentAuctions.length === 0 ? (
              <div className='py-10 text-center text-[13px] text-gray-400'>Нет аукционов</div>
            ) : (
              <div>{recentAuctions.map((a) => <RecentAuctionItem key={a.id} auction={a} />)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
