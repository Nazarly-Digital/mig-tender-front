import Image from 'next/image';

import AuthHeader from './header';
import AuthFooter from './footer';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex min-h-screen flex-col items-center'>
      <AuthHeader />
      <div className='relative isolate flex w-full flex-1 flex-col items-center justify-center'>
        <Image
          src='/images/auth-pattern.svg'
          alt=''
          width={824}
          height={318}
          className='pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full max-w-[1140px] -translate-x-1/2 -translate-y-1/2 object-contain'
          priority
        />
        {children}
      </div>
      <AuthFooter />
    </div>
  );
}
