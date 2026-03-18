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
        <h1 className='text-[24px] font-bold tracking-[-0.02em] text-[#111827] lg:text-[28px]'>Платформа закрытых аукционов недвижимости</h1>
        <p className='mt-2 text-[14px] text-[#6B7280]'>Выберите роль для регистрации</p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Broker Card */}
        <div className='flex flex-col items-center gap-6 rounded-xl border border-[#E5E7EB] bg-white p-6 transition-all duration-150 hover:border-[#D1D5DB] md:p-8'>
          <div className='flex flex-col items-center gap-3'>
            <div
              className={cn(
                'flex size-16 items-center justify-center rounded-xl',
                'bg-[#EFF6FF]',
              )}
            >
              <RiGroupLine className='size-8 text-[#2563EB]' />
            </div>

            <div className='space-y-2 text-center'>
              <h2 className='text-[18px] font-semibold text-[#111827]'>Регистрация как Брокер</h2>
              <p className='text-[14px] text-[#6B7280]'>
                Участвуйте в аукционах и делайте ставки на объекты недвижимости
              </p>
            </div>
          </div>

          <ul className='flex w-full flex-col gap-2 text-[14px] text-[#6B7280]'>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-[#9CA3AF]' />
              Просмотр активных аукционов
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-[#9CA3AF]' />
              Размещение и повышение ставок
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-[#9CA3AF]' />
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
        <div className='flex flex-col items-center gap-6 rounded-xl border border-[#E5E7EB] bg-white p-6 transition-all duration-150 hover:border-[#D1D5DB] md:p-8'>
          <div className='flex flex-col items-center gap-3'>
            <div
              className={cn(
                'flex size-16 items-center justify-center rounded-xl',
                'bg-[#ECFDF5]',
              )}
            >
              <RiBuildingLine className='size-8 text-green-600' />
            </div>

            <div className='space-y-2 text-center'>
              <h2 className='text-[18px] font-semibold text-[#111827]'>Регистрация как Девелопер</h2>
              <p className='text-[14px] text-[#6B7280]'>
                Создавайте аукционы и управляйте продажей своих объектов
              </p>
            </div>
          </div>

          <ul className='flex w-full flex-col gap-2 text-[14px] text-[#6B7280]'>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-[#9CA3AF]' />
              Создание объектов и аукционов
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-[#9CA3AF]' />
              Просмотр результатов торгов
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 shrink-0 rounded-full bg-[#9CA3AF]' />
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
        <span className='text-[14px] text-[#6B7280]'>Уже есть аккаунт?</span>
        <LinkButton.Root variant='primary' size='medium' underline asChild>
          <Link href='/login'>Войти</Link>
        </LinkButton.Root>
      </div>
    </div>
  );
}
