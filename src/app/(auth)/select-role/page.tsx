'use client';

import Link from 'next/link';
import { RiGroupLine } from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as LinkButton from '@/shared/ui/link-button';
import { useRouter } from 'next/navigation';

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className='w-full max-w-[480px] px-4'>
      <div className='mb-8 text-center'>
        <h1 className='text-xl font-bold tracking-tight text-gray-900 lg:text-2xl'>Платформа закрытых аукционов недвижимости</h1>
        <p className='mt-2 text-sm text-gray-500'>Регистрация для брокеров</p>
      </div>

      <div className='flex flex-col items-center gap-6 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6 transition-all duration-150 hover:border-blue-200 md:p-8'>
        <div className='flex flex-col items-center gap-3'>
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-xl',
              'bg-blue-50',
            )}
          >
            <RiGroupLine className='size-8 text-blue-600' />
          </div>

          <div className='space-y-2 text-center'>
            <h2 className='text-lg font-semibold text-gray-900'>Я Брокер</h2>
            <p className='text-sm text-gray-500'>
              Участвуйте в аукционах и забирайте объекты по лучшим ценам
            </p>
          </div>
        </div>

        <ul className='flex w-full flex-col gap-2 text-sm text-gray-500'>
          <li className='flex items-center gap-2'>
            <span className='size-1.5 shrink-0 rounded-full bg-gray-400' />
            Просмотр активных аукционов
          </li>
          <li className='flex items-center gap-2'>
            <span className='size-1.5 shrink-0 rounded-full bg-gray-400' />
            Размещение и повышение ставок
          </li>
          <li className='flex items-center gap-2'>
            <span className='size-1.5 shrink-0 rounded-full bg-gray-400' />
            История участия и сделки
          </li>
        </ul>

        <FancyButton.Root
          variant='primary'
          size='medium'
          className='w-full'
          onClick={() => router.push('/register/broker')}
        >
          Зарегистрироваться
        </FancyButton.Root>
      </div>

      <p className='mt-4 text-center text-[12px] text-gray-400'>
        Аккаунты девелоперов создаются администратором платформы.
      </p>

      <div className='mt-6 flex items-center justify-center gap-1.5'>
        <span className='text-sm text-gray-500'>Уже есть аккаунт?</span>
        <LinkButton.Root variant='primary' size='medium' underline asChild>
          <Link href='/login'>Войти</Link>
        </LinkButton.Root>
      </div>
    </div>
  );
}
