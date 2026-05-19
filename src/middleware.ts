// Middleware: pathname для layout + защита admin API
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAdminApiRequest } from '@/lib/admin-api-guard';

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  if (pathname.startsWith('/api/')) {
    const access = checkAdminApiRequest(pathname, req.method, req.auth?.user ?? null);
    if (access === 'unauthorized') {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    if (access === 'forbidden') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
