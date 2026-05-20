// Middleware: pathname для layout + защита admin API + закрытый режим сайта
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkAdminApiRequest } from '@/lib/admin-api-guard';
import type { AdminSessionUser } from '@/lib/admin-permissions';
import {
  isSitePreviewPublicPath,
  SITE_PREVIEW_COOKIE,
} from '@/lib/site-preview';
import { verifySitePreviewToken } from '@/lib/site-preview-auth';

let previewEnabledCache = { value: false, at: 0 };

async function isSitePreviewEnabled(req: NextRequest): Promise<boolean> {
  const now = Date.now();
  if (now - previewEnabledCache.at < 5000) {
    return previewEnabledCache.value;
  }
  try {
    const res = await fetch(new URL('/api/site-preview/status', req.url));
    const data = (await res.json()) as { enabled?: boolean };
    previewEnabledCache = { value: Boolean(data.enabled), at: now };
    return previewEnabledCache.value;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const adminUser: AdminSessionUser | null =
    token?.id && token.role
      ? {
          id: token.id as string,
          role: token.role as string,
          permissions: (token.permissions as AdminSessionUser['permissions']) ?? [],
        }
      : null;
  const isAdmin = Boolean(adminUser?.id);

  if (pathname.startsWith('/api/')) {
    const access = checkAdminApiRequest(pathname, req.method, adminUser);
    if (access === 'unauthorized') {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    if (access === 'forbidden') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    if (
      access === 'public' &&
      !isSitePreviewPublicPath(pathname) &&
      (await isSitePreviewEnabled(req)) &&
      !isAdmin
    ) {
      const previewCookie = req.cookies.get(SITE_PREVIEW_COOKIE)?.value;
      const previewUserId = previewCookie ? await verifySitePreviewToken(previewCookie) : null;
      if (!previewUserId) {
        return NextResponse.json({ error: 'Требуется доступ к сайту' }, { status: 401 });
      }
    }
  } else if (!isSitePreviewPublicPath(pathname) && (await isSitePreviewEnabled(req)) && !isAdmin) {
    const previewCookie = req.cookies.get(SITE_PREVIEW_COOKIE)?.value;
    const previewUserId = previewCookie ? await verifySitePreviewToken(previewCookie) : null;

    if (!previewUserId && pathname !== '/preview-login') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/preview-login';
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
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
