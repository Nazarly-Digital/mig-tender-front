'use client';

import {
  RiUserLine,
  RiAuctionLine,
  RiTimeLine,
} from '@remixicon/react';
import Link from 'next/link';

import * as Badge from '@/shared/ui/badge';
import * as LinkButton from '@/shared/ui/link-button';
import * as WidgetBox from '@/shared/components/widget-box';
import { PageHeader } from '@/shared/components/page-header';
import { useAuctions } from '@/features/auctions';
import { formatPrice, formatDateShort } from '@/shared/lib/formatters';
import type { Auction } from '@/shared/types/auctions';

function AuctionItem({ auction }: { auction: Auction }) {
  const statusColor = auction.status === 'active' ? 'green' : auction.status === 'finished' ? 'blue' : 'gray';
  const statusLabel = auction.status === 'active' ? 'Активный' : auction.status === 'finished' ? 'Завершён' : 'Черновик';

  return (
    <Link href={`/auctions/${auction.id}`} className='block'>
      <div className='flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 hover:bg-[#F3F4F6]'>
        <div className='flex items-center gap-3'>
          <div className='flex size-8 items-center justify-center rounded-lg bg-[#F9FAFB]'>
            <RiAuctionLine className='size-4 text-[#6B7280]' />
          </div>
          <div>
            <div className='text-[14px] font-medium text-[#111827]'>Аукцион #{auction.id}</div>
            <div className='text-[13px] text-[#9CA3AF]'>
              от {formatPrice(auction.min_price)} · до {formatDateShort(auction.end_date)}
            </div>
          </div>
        </div>
        <Badge.Root variant='light' size='small' color={statusColor}>
          {statusLabel}
        </Badge.Root>
      </div>
    </Link>
  );
}

export default function CabinetPage() {
  const { data: activeData } = useAuctions({ status: 'active', page_size: 5 });
  const { data: finishedData } = useAuctions({ status: 'finished', page_size: 5 });

  const activeAuctions = activeData?.results ?? [];
  const finishedAuctions = finishedData?.results ?? [];

  return (
    <div className='flex flex-1 flex-col gap-6 p-6 lg:p-8'>
      <PageHeader
        title='Личный кабинет'
        description='Ваши аукционы и обязательства'
        icon={RiUserLine}
      />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* Active participations */}
        <WidgetBox.Root>
          <WidgetBox.Header>
            <WidgetBox.HeaderIcon as={RiTimeLine} />
            Активные аукционы
          </WidgetBox.Header>
          {activeAuctions.length === 0 ? (
            <div className='py-8 text-center text-[14px] text-[#9CA3AF]'>
              Нет активных аукционов
            </div>
          ) : (
            <div className='flex flex-col gap-1'>
              {activeAuctions.map((a) => (
                <AuctionItem key={a.id} auction={a} />
              ))}
            </div>
          )}
          <div className='mt-3 border-t border-[#E5E7EB] pt-3'>
            <Link href='/auctions'>
              <LinkButton.Root variant='primary' size='small'>
                Все аукционы
              </LinkButton.Root>
            </Link>
          </div>
        </WidgetBox.Root>

        {/* Finished */}
        <WidgetBox.Root>
          <WidgetBox.Header>
            <WidgetBox.HeaderIcon as={RiAuctionLine} />
            Завершённые аукционы
          </WidgetBox.Header>
          {finishedAuctions.length === 0 ? (
            <div className='py-8 text-center text-[14px] text-[#9CA3AF]'>
              Нет завершённых аукционов
            </div>
          ) : (
            <div className='flex flex-col gap-1'>
              {finishedAuctions.map((a) => (
                <AuctionItem key={a.id} auction={a} />
              ))}
            </div>
          )}
        </WidgetBox.Root>
      </div>
    </div>
  );
}
