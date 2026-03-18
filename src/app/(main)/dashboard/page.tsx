'use client';

import Link from 'next/link';
import {
  RiAddLine,
  RiArrowRightLine,
  RiAuctionLine,
  RiBuilding2Line,
  RiEyeLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as LinkButton from '@/shared/ui/link-button';
import * as WidgetBox from '@/shared/components/widget-box';
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
  icon: Icon,
  href,
  action,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  action: string;
}) {
  return (
    <div className='flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4'>
      <div className='flex items-center justify-between'>
        <span className='text-[13px] text-neutral-500'>{label}</span>
        <Icon className='size-4 text-neutral-300' />
      </div>
      <div className='mt-3 text-[28px] font-semibold leading-tight tracking-tight text-neutral-900'>
        {value}
      </div>
      <div className='mt-3'>
        <Link href={href}>
          <LinkButton.Root variant='primary' size='small'>
            {action}
            <LinkButton.Icon as={RiArrowRightLine} />
          </LinkButton.Root>
        </Link>
      </div>
    </div>
  );
}

function QuickActionCard({ isDeveloper }: { isDeveloper: boolean }) {
  return (
    <div className='flex flex-col items-start justify-between rounded-xl border border-neutral-200/80 bg-white p-4'>
      <div>
        <div className='text-[13px] font-medium text-neutral-900'>Быстрое действие</div>
        <p className='mt-0.5 text-[12px] text-neutral-500'>
          {isDeveloper ? 'Создайте новый объект или аукцион' : 'Просмотрите доступные аукционы'}
        </p>
      </div>
      <Link href={isDeveloper ? '/properties/create' : '/auctions'} className='mt-4'>
        <FancyButton.Root variant='primary' size='small'>
          <FancyButton.Icon as={isDeveloper ? RiAddLine : RiEyeLine} />
          {isDeveloper ? 'Создать объект' : 'Смотреть аукционы'}
        </FancyButton.Root>
      </Link>
    </div>
  );
}

function RecentPropertyItem({ property }: { property: Property }) {
  return (
    <div className='flex items-center justify-between gap-3 py-2.5'>
      <div className='min-w-0 flex-1'>
        <div className='truncate text-[13px] font-medium text-neutral-900'>
          {property.address}
        </div>
        <div className='mt-0.5 flex items-center gap-1.5 text-[12px] text-neutral-500'>
          <span>{TYPE_LABELS[property.type]}</span>
          <span className='text-neutral-300'>·</span>
          <span>{formatPrice(property.price)} {property.currency}</span>
        </div>
      </div>
      <Badge.Root
        variant='light'
        size='small'
        color={property.status === 'published' ? 'green' : property.status === 'draft' ? 'orange' : 'gray'}
      >
        {STATUS_LABELS[property.status]}
      </Badge.Root>
    </div>
  );
}

function RecentAuctionItem({ auction }: { auction: Auction }) {
  const statusColor = auction.status === 'active' ? 'green' : auction.status === 'finished' ? 'blue' : 'gray';
  const statusLabel = auction.status === 'active' ? 'Активный' : auction.status === 'finished' ? 'Завершён' : auction.status === 'draft' ? 'Черновик' : 'Отменён';

  return (
    <div className='flex items-center justify-between gap-3 py-2.5'>
      <div className='min-w-0 flex-1'>
        <div className='truncate text-[13px] font-medium text-neutral-900'>
          Аукцион #{auction.id}
        </div>
        <div className='mt-0.5 flex items-center gap-1.5 text-[12px] text-neutral-500'>
          <span>от {formatPrice(auction.min_price)}</span>
          <span className='text-neutral-300'>·</span>
          <span>{formatDateShort(auction.end_date)}</span>
        </div>
      </div>
      <Badge.Root variant='light' size='small' color={statusColor}>
        {statusLabel}
      </Badge.Root>
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
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <div>
        <h1 className='text-lg font-semibold text-neutral-900'>{greeting}</h1>
        <p className='mt-0.5 text-[13px] text-neutral-500'>
          Вот последние данные вашей панели управления.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {isDeveloper ? (
          <StatCard label='Мои объекты' value={propertiesCount} icon={RiBuilding2Line} href='/properties' action='Все объекты' />
        ) : (
          <>
            <StatCard label='Каталог объектов' value={propertiesCount} icon={RiBuilding2Line} href='/catalog' action='Открыть каталог' />
            <StatCard label='Доступные аукционы' value={auctionsCount} icon={RiAuctionLine} href='/auctions' action='Все аукционы' />
          </>
        )}
        {isDeveloper && (
          <StatCard label='Мои аукционы' value={auctionsCount} icon={RiAuctionLine} href='/auctions' action='Подробнее' />
        )}
        <QuickActionCard isDeveloper={isDeveloper} />
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        {isDeveloper && (
          <WidgetBox.Root>
            <WidgetBox.Header>
              <WidgetBox.HeaderIcon as={RiBuilding2Line} />
              Последние объекты
            </WidgetBox.Header>
            {recentProperties.length === 0 ? (
              <div className='py-6 text-center text-[13px] text-neutral-400'>Нет объектов</div>
            ) : (
              <div className='flex flex-col'>
                {recentProperties.map((property, i) => (
                  <div key={property.id}>
                    {i > 0 && <Divider.Root variant='line' />}
                    <RecentPropertyItem property={property} />
                  </div>
                ))}
              </div>
            )}
            <div className='mt-3 pt-3 border-t border-neutral-200/80'>
              <Link href='/properties'>
                <LinkButton.Root variant='primary' size='small'>
                  Все объекты
                  <LinkButton.Icon as={RiArrowRightLine} />
                </LinkButton.Root>
              </Link>
            </div>
          </WidgetBox.Root>
        )}

        <WidgetBox.Root>
          <WidgetBox.Header>
            <WidgetBox.HeaderIcon as={RiAuctionLine} />
            {isDeveloper ? 'Мои аукционы' : 'Доступные аукционы'}
          </WidgetBox.Header>
          {recentAuctions.length === 0 ? (
            <div className='py-6 text-center text-[13px] text-neutral-400'>Нет аукционов</div>
          ) : (
            <div className='flex flex-col'>
              {recentAuctions.map((auction, i) => (
                <div key={auction.id}>
                  {i > 0 && <Divider.Root variant='line' />}
                  <RecentAuctionItem auction={auction} />
                </div>
              ))}
            </div>
          )}
          <div className='mt-3 pt-3 border-t border-neutral-200/80'>
            <Link href='/auctions'>
              <LinkButton.Root variant='primary' size='small'>
                Все аукционы
                <LinkButton.Icon as={RiArrowRightLine} />
              </LinkButton.Root>
            </Link>
          </div>
        </WidgetBox.Root>
      </div>
    </div>
  );
}
