// Middleware: pathname для layout + защита admin API (без auth() на каждый RSC-запрос)
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkAdminApiRequest } from '@/lib/admin-api-guard';
import type { AdminSessionUser } from '@/lib/admin-permissions';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  if (pathname.startsWith('/api/')) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const user: AdminSessionUser | null =
      token?.id && token.role
        ? {
            id: token.id as string,
            role: token.role as string,
            permissions: (token.permissions as AdminSessionUser['permissions']) ?? [],
          }
        : null;

    const access = checkAdminApiRequest(pathname, req.method, user);
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
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
