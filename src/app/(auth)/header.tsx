'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import * as LinkButton from '@/shared/ui/link-button';

const actions = {
  '/login': {
    text: 'Нет аккаунта?',
    link: {
      label: 'Регистрация',
      href: '/register',
    },
  },
  '/register': {
    text: 'Уже есть аккаунт?',
    link: {
      label: 'Войти',
      href: '/login',
    },
  },
  '/reset-password': {
    text: 'Передумали?',
    link: {
      label: 'Назад',
      href: '/login',
    },
  },
  '/verification': {
    text: 'Передумали?',
    link: {
      label: 'Назад',
      href: '/login',
    },
  },
};

export default function AuthHeader() {
  const pathname = usePathname();

  const action = actions[pathname as keyof typeof actions];

  if (!action) return null;

  return (
    <div className='mx-auto flex w-full max-w-[1400px] items-center justify-between p-6'>
      <img
        src='/images/logo.svg'
        alt='MIG Tender'
        className='h-10 shrink-0'
      />

      <div className='flex items-center gap-1.5'>
        <div className='text-paragraph-sm text-text-sub-600'>{action.text}</div>
        <LinkButton.Root variant='primary' size='medium' underline asChild>
          <Link href={action.link.href}>{action.link.label}</Link>
        </LinkButton.Root>
      </div>
    </div>
  );
}
