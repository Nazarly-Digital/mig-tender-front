'use client';

import {
  RiBankLine,
  RiHomeSmileFill,
  RiLineChartLine,
  RiRefund2Line,
} from '@remixicon/react';

import { type Transaction } from '@/shared/lib/data/cards-data';
import { cnExt } from '@/shared/lib/cn';
import { ButtonV2 } from '@/shared/ui/button-v2';
import * as SegmentedControl from '@/shared/ui/segmented-control';
import IllustrationEmptyRecentTransactions from '@/shared/components/empty-state-illustrations/recent-transactions';
import { TransactionItem } from '@/shared/components/transaction-item';
import * as WidgetBox from '@/shared/components/widget-box';

const transactions: Transaction[] = [
  {
    id: '2441s347',
    type: 'other',
    name: 'Salary Deposit',
    description: 'Monthly salary from Apex Finance',
    transaction: 3500,
    date: new Date('09/18/2024'),
    icon: RiBankLine,
  },
  {
    id: '2421c347',
    type: 'other',
    name: 'Stock Dividend',
    description: 'Payment from stock investments.',
    transaction: 846.14,
    date: new Date('09/17/2024'),
    icon: RiLineChartLine,
  },
  {
    id: 'ab193fd6',
    type: 'rent',
    name: 'Rental Income',
    description: 'Rental payment from Mr. Dudley.',
    transaction: 100,
    date: new Date('09/15/2024'),
    icon: RiHomeSmileFill,
  },
  {
    id: '7a2dc594',
    type: 'other',
    name: 'Refund from Amazon',
    description: 'Refund of Order No #124235',
    transaction: 36.24,
    date: new Date('09/12/2024'),
    icon: '/images/major-brands/amazon.svg',
  },
];

export default function WidgetRecentTransactions({
  className,
  ...rest
}: React.ComponentPropsWithoutRef<typeof WidgetBox.Root>) {
  return (
    <WidgetBox.Root className={cnExt('pb-5', className)} {...rest}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiRefund2Line} />
        Recent Transactions
        <ButtonV2 variant='outline' size='sm'>
          See All
        </ButtonV2>
      </WidgetBox.Header>

      <SegmentedControl.Root defaultValue='incoming'>
        <SegmentedControl.List>
          <SegmentedControl.Trigger value='incoming'>
            Incoming
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='outgoing'>
            Outgoing
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='pending'>
            Pending
          </SegmentedControl.Trigger>
        </SegmentedControl.List>
      </SegmentedControl.Root>

      <div className='mt-3 flex flex-col gap-2'>
        {transactions.map((trx, i) => (
          <TransactionItem
            key={trx.id}
            name={trx.name}
            description={trx.description}
            transaction={trx.transaction}
            date={trx.date}
            icon={trx.icon}
            type={trx.type}
          />
        ))}
      </div>
    </WidgetBox.Root>
  );
}

export function WidgetRecentTransactionsEmpty({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <WidgetBox.Root
      className={cnExt('flex flex-col self-stretch', className)}
      {...rest}
    >
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiRefund2Line} />
        Recent Transactions
      </WidgetBox.Header>

      <SegmentedControl.Root>
        <SegmentedControl.List>
          <SegmentedControl.Trigger value='incoming'>
            Incoming
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='outgoing'>
            Outgoing
          </SegmentedControl.Trigger>
          <SegmentedControl.Trigger value='pending'>
            Pending
          </SegmentedControl.Trigger>
        </SegmentedControl.List>
      </SegmentedControl.Root>

      <div className='flex flex-1 flex-col items-center justify-center gap-5 p-5'>
        <IllustrationEmptyRecentTransactions className='size-[108px]' />
        <div className='text-center text-paragraph-sm text-text-soft-400'>
          No records of transactions yet.
          <br />
          Please check back later.
        </div>
      </div>
    </WidgetBox.Root>
  );
}
