'use client';

import Link from 'next/link';
import {
  RiGroupLine,
  RiBuildingLine,
} from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as LinkButton from '@/shared/ui/link-button';
import { useRouter } from 'next/navigation';

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className='w-full max-w-[900px] px-4'>
      <div className='mb-8 text-center'>
        <h1 className='text-title-h4 lg:text-title-h3 font-semibold leading-tight'>Платформа закрытых аукционов недвижимости</h1>
        <p className='mt-2 text-paragraph-sm text-text-sub-600'>Выберите роль для регистрации</p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Broker Card */}
        <div className='flex flex-col items-center gap-6 rounded-20 bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
          <div className='flex flex-col items-center gap-3'>
            <div
              className={cn(
                'flex size-20 items-center justify-center rounded-full',
                'bg-primary-base/10',
              )}
            >
              <RiGroupLine className='size-10 text-primary-base' />
            </div>

            <div className='space-y-2 text-center'>
              <h2 className='text-title-h5'>Регистрация как Брокер</h2>
              <p className='text-paragraph-sm text-text-sub-600'>
                Участвуйте в аукционах и делайте ставки на объекты недвижимости
              </p>
            </div>
          </div>

          <ul className='flex w-full flex-col gap-2 text-paragraph-sm text-text-sub-600'>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-text-sub-600' />
              Просмотр активных аукционов
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-text-sub-600' />
              Размещение и повышение ставок
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-text-sub-600' />
              История участия и сделки
            </li>
          </ul>

          <FancyButton.Root
            variant='primary'
            size='medium'
            className='w-full'
            onClick={() => router.push('/register/broker')}
          >
            Зарегистрироваться как брокер
          </FancyButton.Root>
        </div>

        {/* Developer Card */}
        <div className='flex flex-col items-center gap-6 rounded-20 bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8'>
          <div className='flex flex-col items-center gap-3'>
            <div
              className={cn(
                'flex size-20 items-center justify-center rounded-full',
                'bg-green-500/10',
              )}
            >
              <RiBuildingLine className='size-10 text-green-600' />
            </div>

            <div className='space-y-2 text-center'>
              <h2 className='text-title-h5'>Регистрация как Девелопер</h2>
              <p className='text-paragraph-sm text-text-sub-600'>
                Создавайте аукционы и управляйте продажей своих объектов
              </p>
            </div>
          </div>

          <ul className='flex w-full flex-col gap-2 text-paragraph-sm text-text-sub-600'>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-text-sub-600' />
              Создание объектов и аукционов
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-text-sub-600' />
              Просмотр результатов торгов
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-text-sub-600' />
              Контроль сроков и цен
            </li>
          </ul>

          <FancyButton.Root
            variant='basic'
            size='medium'
            className='w-full'
            onClick={() => router.push('/register/developer')}
          >
            Зарегистрироваться как девелопер
          </FancyButton.Root>
        </div>
      </div>

      <div className='mt-6 flex items-center justify-center gap-1.5'>
        <span className='text-paragraph-sm text-text-sub-600'>Уже есть аккаунт?</span>
        <LinkButton.Root variant='primary' size='medium' underline asChild>
          <Link href='/login'>Войти</Link>
        </LinkButton.Root>
      </div>
    </div>
  );
}
