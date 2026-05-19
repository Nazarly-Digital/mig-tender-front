'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  ArrowRight01Icon,
  Building03Icon,
  Award01Icon,
  SecurityCheckIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';

import * as FancyButton from '@/shared/ui/fancy-button';
import { useMyProperties, useProperties } from '@/features/properties';
import { useMyAuctions, useAuctions } from '@/features/auctions';
import { usePendingProperties } from '@/features/admin';
import { useSettlements } from '@/features/payments';
import { useConfirmedDealsTotal } from '@/features/deals';
import { useSessionStore, isUserDeveloper, isUserAdmin } from '@/entities/auth/model/store';
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

function BrokerEarningsCard() {
  const { data } = useSettlements();
  const settlements = data ?? [];
  const paid = settlements
    .filter((s) => s.paid_to_broker)
    .reduce((acc, s) => acc + parseFloat(s.broker_amount || '0'), 0);
  const pending = settlements
    .filter((s) => !s.paid_to_broker)
    .reduce((acc, s) => acc + parseFloat(s.broker_amount || '0'), 0);

  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-blue-50'>
          <HugeiconsIcon icon={Wallet01Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-blue-600' />
        </div>
        <span className='text-[12px] font-semibold text-gray-500'>Заработано</span>
      </div>
      <span className='mt-3 block text-2xl font-bold tracking-tight text-gray-900'>
        {formatPrice(String(paid), 'RUB')}
      </span>
      <div className='mt-1 text-[12px] text-gray-500'>
        В ожидании: <span className='font-semibold text-amber-600'>{formatPrice(String(pending), 'RUB')}</span>
      </div>
      <div className='mt-4 border-t border-blue-50 pt-3'>
        <Link
          href='/payments'
          className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-blue-600'
        >
          Все выплаты
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} color='currentColor' strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

function DeveloperSalesCard() {
  const { data } = useConfirmedDealsTotal();
  const totalSold = data?.totalAmount ?? 0;
  const dealsCount = data?.count ?? 0;

  return (
    <div className='group rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-blue-50'>
          <HugeiconsIcon icon={Wallet01Icon} size={16} color='currentColor' strokeWidth={1.5} className='text-blue-600' />
        </div>
        <span className='text-[12px] font-semibold text-gray-500'>Продано на сумму</span>
      </div>
      <span className='mt-3 block text-2xl font-bold tracking-tight text-gray-900'>
        {formatPrice(String(totalSold), 'RUB')}
      </span>
      <div className='mt-1 text-[12px] text-gray-500'>
        Завершённых сделок: <span className='font-semibold text-gray-700'>{dealsCount}</span>
      </div>
      <div className='mt-4 border-t border-blue-50 pt-3'>
        <Link
          href='/deals'
          className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-blue-600'
        >
          Все сделки
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
        <span className='text-[14px] font-semibold text-gray-900'>
          {isDeveloper ? 'Создать аукцион' : 'Быстрое действие'}
        </span>
        <p className='mt-1 text-[13px] text-gray-400'>
          {isDeveloper ? 'Запустите новый аукцион' : 'Просмотрите доступные аукционы'}
        </p>
      </div>
      <Link href={isDeveloper ? '/auctions/create' : '/auctions?tab=active'} className='mt-4'>
        <FancyButton.Root variant='primary' size='small'>
          <HugeiconsIcon
            icon={isDeveloper ? Add01Icon : Award01Icon}
            size={16}
            color='currentColor'
            strokeWidth={1.5}
          />
          {isDeveloper ? 'Создать аукцион' : 'Смотреть аукционы'}
        </FancyButton.Root>
      </Link>
    </div>
  );
}

function RecentPropertyItem({ property }: { property: Property }) {
  const statusStyles: Record<string, string> = {
    published: 'bg-emerald-50 text-emerald-700',
    draft: 'bg-amber-50 text-amber-700',
    sold: 'bg-blue-50 text-blue-700',
    archived: 'bg-amber-50 text-amber-700',
  };

  return (
    <Link href={`/properties/${property.id}`} className='flex items-center gap-3 px-5 py-3 border-b border-blue-50 last:border-0 transition-colors hover:bg-blue-50/20'>
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
          <span>{property.price == null ? 'Скрыта' : formatPrice(property.price, property.currency)}</span>
        </span>
      </div>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[property.status] ?? 'bg-gray-100 text-gray-500'}`}>
        {STATUS_LABELS[property.status]}
      </span>
    </Link>
  );
}

function RecentAuctionItem({ auction }: { auction: Auction }) {
  const statusMap: Record<string, { label: string; style: string }> = {
    active: { label: 'Активный', style: 'bg-emerald-50 text-emerald-700' },
    finished: { label: 'Завершён', style: 'bg-gray-50 text-gray-600' },
    draft: { label: 'Черновик', style: 'bg-amber-50 text-amber-700' },
    cancelled: { label: 'Отменён', style: 'bg-red-50 text-red-700' },
    scheduled: { label: 'Запланирован', style: 'bg-blue-50 text-blue-700' },
    pending: { label: 'Ожидает старта', style: 'bg-amber-50 text-amber-700' },
    failed: { label: 'Не состоялся', style: 'bg-gray-50 text-gray-600' },
  };
  const status = statusMap[auction.status] ?? { label: auction.status, style: 'bg-gray-100 text-gray-500' };

  return (
    <Link href={`/auctions/${auction.id}`} className='flex items-center gap-3 px-5 py-3 border-b border-blue-50 last:border-0 transition-colors hover:bg-blue-50/20'>
      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50'>
        <HugeiconsIcon icon={Award01Icon} size={15} color='currentColor' strokeWidth={1.5} className='text-blue-500' />
      </div>
      <div className='min-w-0 flex-1'>
        <span className='block truncate text-[13px] font-medium text-gray-900'>
          Аукцион #{auction.id}
        </span>
        <span className='mt-0.5 flex items-center gap-1.5 text-[12px] text-gray-400'>
          {auction.mode === 'closed' || auction.min_price == null ? (
            <span>Закрытый</span>
          ) : (
            <>
              <span>от {formatPrice(auction.min_price, 'RUB')}</span>
              <span className='text-gray-300'>·</span>
            </>
          )}
          <span>{formatDateShort(auction.end_date)}</span>
        </span>
      </div>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${status.style}`}>
        {status.label}
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useSessionStore((s) => s.user);
  const isDeveloper = isUserDeveloper(user);
  const isAdmin = isUserAdmin(user);

  const isBroker = !isDeveloper && !isAdmin;
  const { data: propertiesData } = useMyProperties({ page_size: 5, ordering: '-created_at' });
  const { data: allPropertiesData } = useProperties({ page_size: 1 }, { enabled: isAdmin });
  const { data: catalogData } = useProperties({ page_size: 1 }, { enabled: isBroker });
  // Endpoint /admin/properties/ возвращает все объекты с поддержкой
  // фильтра по moderation_status. Без явного 'pending' счётчик
  // «Объекты на модерации» считал total (включая approved/rejected) —
  // в админке висели сотни вместо реальных пары неподтверждённых.
  const { data: pendingData } = usePendingProperties(
    { page_size: 1, moderation_status: 'pending' },
    { enabled: isAdmin },
  );
  const myAuctions = useMyAuctions(isDeveloper ? { page_size: 5, ordering: '-created_at' } : undefined);
  const allAuctions = useAuctions(!isDeveloper ? { page_size: 5, ordering: '-created_at' } : undefined);
  const activeAuctions = useAuctions({ status: 'active', page_size: 1 }, { enabled: isBroker });

  const auctionsData = isDeveloper ? myAuctions.data : allAuctions.data;

  const allPropertiesCount = allPropertiesData?.count ?? 0;
  const pendingCount = Array.isArray(pendingData) ? pendingData.length : pendingData?.count ?? 0;
  const propertiesCount = isBroker ? (catalogData?.count ?? 0) : (propertiesData?.count ?? 0);
  const auctionsCount = isBroker ? (activeAuctions.data?.count ?? 0) : (auctionsData?.count ?? 0);
  const recentProperties = propertiesData?.results ?? [];
  const recentAuctions = auctionsData?.results ?? [];

  const greeting = user?.first_name ? `Добрый день, ${user.first_name}` : 'Добро пожаловать';

  return (
    <div className='w-full px-8 py-8'>
      <div className='flex flex-col gap-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>{greeting}</h1>
          <p className='mt-1 text-[13px] text-gray-500'>
            Вот последние данные вашей панели управления.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 2xl:grid-cols-4'>
          {isAdmin ? (
            <>
              <StatCard label='Все объекты' value={allPropertiesCount} href='/objects' action='Открыть объекты' icon={Building03Icon} />
              <StatCard label='Объекты на модерации' value={pendingCount} href='/objects?moderation=pending' action='Модерация' icon={SecurityCheckIcon} />
            </>
          ) : isDeveloper ? (
            <StatCard label='Мои объекты' value={propertiesCount} href='/properties' action='Все объекты' icon={Building03Icon} />
          ) : (
            <>
              <StatCard label='Каталог объектов' value={propertiesCount} href='/objects' action='Открыть каталог' icon={Building03Icon} />
              <StatCard label='Активные аукционы' value={auctionsCount} href='/auctions?tab=active' action='Все аукционы' icon={Award01Icon} />
              <BrokerEarningsCard />
            </>
          )}
          {isDeveloper && (
            <>
              <StatCard label='Мои аукционы' value={auctionsCount} href='/auctions' action='Подробнее' icon={Award01Icon} />
              <DeveloperSalesCard />
            </>
          )}
          {!isAdmin && <QuickActionCard isDeveloper={isDeveloper} />}
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
                {isDeveloper ? 'Мои аукционы' : 'Последние аукционы'}
              </span>
              <Link href='/auctions' className='inline-flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-blue-600'>
                Смотреть аукционы <HugeiconsIcon icon={ArrowRight01Icon} size={12} color='currentColor' strokeWidth={1.5} />
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
