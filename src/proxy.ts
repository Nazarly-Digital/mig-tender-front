import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'has_session';

// Пути, доступные только без авторизации
const AUTH_ONLY_PATHS = ['/login', '/select-role', '/register'];

function isAuthOnlyPath(pathname: string) {
  return AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем запросы к статическим файлам (svg, png, jpg, ico и т.д.)
  if (/\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(AUTH_COOKIE);

  // Авторизован + пытается зайти на auth-страницу → на dashboard
  if (hasSession && isAuthOnlyPath(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Не авторизован + пытается зайти на защищённую страницу → на login
  if (!hasSession && !isAuthOnlyPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Запускать proxy на всех путях, кроме:
     * - _next/static (статика)
     * - _next/image (оптимизация изображений)
     * - favicon.ico
     * - api роуты
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/).*)',
  ],
};
