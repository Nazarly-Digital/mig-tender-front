'use client';

import Link from 'next/link';
import {
  RiAddLine,
  RiArrowRightLine,
  RiAuctionLine,
  RiBuilding2Line,
  RiDashboardLine,
  RiEyeLine,
} from '@remixicon/react';

import * as Badge from '@/shared/ui/badge';
import * as Divider from '@/shared/ui/divider';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as LinkButton from '@/shared/ui/link-button';
import * as WidgetBox from '@/shared/components/widget-box';
import { PageHeader } from '@/shared/components/page-header';
import { useMyProperties } from '@/features/properties';
import { useMyAuctions, useAuctions } from '@/features/auctions';
import { useSessionStore } from '@/entities/auth/model/store';
import {
  TYPE_LABELS,
  STATUS_LABELS,
} from '@/shared/components/properties-table';
import type { Property } from '@/shared/types/properties';
import type { Auction } from '@/shared/types/auctions';

function formatPrice(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU').format(num);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

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
    <WidgetBox.Root className='flex flex-col gap-3'>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-weak-50'>
          <Icon className='size-5 text-text-sub-600' />
        </div>
        <div className='text-subheading-2xs uppercase text-text-soft-400'>
          {label}
        </div>
      </div>
      <div className='text-title-h2 text-text-strong-950'>{value}</div>
      <Link href={href}>
        <LinkButton.Root variant='primary' size='small'>
          {action}
          <LinkButton.Icon as={RiArrowRightLine} />
        </LinkButton.Root>
      </Link>
    </WidgetBox.Root>
  );
}

function QuickActionCard({
  isDeveloper,
}: {
  isDeveloper: boolean;
}) {
  return (
    <WidgetBox.Root className='flex flex-col items-start justify-between gap-4'>
      <div>
        <div className='text-label-sm text-text-strong-950'>Быстрое действие</div>
        <div className='mt-1 text-paragraph-xs text-text-sub-600'>
          {isDeveloper
            ? 'Создайте новый объект или аукцион'
            : 'Просмотрите доступные аукционы'}
        </div>
      </div>
      <Link href={isDeveloper ? '/properties/create' : '/auctions'}>
        <FancyButton.Root variant='primary' size='small'>
          <FancyButton.Icon as={isDeveloper ? RiAddLine : RiEyeLine} />
          {isDeveloper ? 'Создать объект' : 'Смотреть аукционы'}
        </FancyButton.Root>
      </Link>
    </WidgetBox.Root>
  );
}

function RecentPropertyItem({ property }: { property: Property }) {
  return (
    <div className='flex items-center justify-between gap-3 py-2.5'>
      <div className='min-w-0 flex-1'>
        <div className='truncate text-label-sm text-text-strong-950'>
          {property.address}
        </div>
        <div className='mt-0.5 flex items-center gap-2 text-paragraph-xs text-text-sub-600'>
          <span>{TYPE_LABELS[property.type]}</span>
          <span>·</span>
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
        <div className='truncate text-label-sm text-text-strong-950'>
          Аукцион #{auction.id}
        </div>
        <div className='mt-0.5 flex items-center gap-2 text-paragraph-xs text-text-sub-600'>
          <span>от {formatPrice(auction.min_price)}</span>
          <span>·</span>
          <span>{formatDate(auction.end_date)}</span>
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

  const { data: propertiesData } = useMyProperties({ page_size: 3, ordering: '-created_at' });
  const myAuctions = useMyAuctions(isDeveloper ? { page_size: 3, ordering: '-created_at' } : undefined);
  const allAuctions = useAuctions(!isDeveloper ? { page_size: 3, ordering: '-created_at' } : undefined);

  const auctionsData = isDeveloper ? myAuctions.data : allAuctions.data;

  const propertiesCount = propertiesData?.count ?? 0;
  const auctionsCount = auctionsData?.count ?? 0;
  const recentProperties = propertiesData?.results ?? [];
  const recentAuctions = auctionsData?.results ?? [];

  const greeting = user?.first_name ? `Привет, ${user.first_name}!` : 'Добро пожаловать!';

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title={greeting}
        description='Панель управления'
        icon={RiDashboardLine}
      />

      {/* Stat cards */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {isDeveloper ? (
          <StatCard
            label='Мои объекты'
            value={propertiesCount}
            icon={RiBuilding2Line}
            href='/properties'
            action='Все объекты'
          />
        ) : (
          <>
            <StatCard
              label='Каталог объектов'
              value={propertiesCount}
              icon={RiBuilding2Line}
              href='/catalog'
              action='Открыть каталог'
            />
            <StatCard
              label='Доступные аукционы'
              value={auctionsCount}
              icon={RiAuctionLine}
              href='/auctions'
              action='Все аукционы'
            />
          </>
        )}

        {isDeveloper && (
          <StatCard
            label='Мои аукционы'
            value={auctionsCount}
            icon={RiAuctionLine}
            href='/auctions'
            action='Подробнее'
          />
        )}

        <QuickActionCard isDeveloper={isDeveloper} />
      </div>

      {/* Recent items */}
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        {/* Recent Properties */}
        {isDeveloper && (
          <WidgetBox.Root>
            <WidgetBox.Header>
              <WidgetBox.HeaderIcon as={RiBuilding2Line} />
              Последние объекты
            </WidgetBox.Header>
            {recentProperties.length === 0 ? (
              <div className='py-6 text-center text-paragraph-sm text-text-soft-400'>
                Нет объектов
              </div>
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
            <div className='mt-3'>
              <Link href='/properties'>
                <LinkButton.Root variant='primary' size='small'>
                  Все объекты
                  <LinkButton.Icon as={RiArrowRightLine} />
                </LinkButton.Root>
              </Link>
            </div>
          </WidgetBox.Root>
        )}

        {/* Recent Auctions */}
        <WidgetBox.Root>
          <WidgetBox.Header>
            <WidgetBox.HeaderIcon as={RiAuctionLine} />
            {isDeveloper ? 'Мои аукционы' : 'Доступные аукционы'}
          </WidgetBox.Header>
          {recentAuctions.length === 0 ? (
            <div className='py-6 text-center text-paragraph-sm text-text-soft-400'>
              Нет аукционов
            </div>
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
          <div className='mt-3'>
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
