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
import { SITE_LANG_COOKIE, parseSiteLang } from '@/lib/site-locale';
import type { SitePageRouting } from '@/lib/site-page-meta';

let previewEnabledCache = { value: false, at: 0 };

async function fetchSitePageRouting(pathname: string): Promise<SitePageRouting> {
  const port = process.env.PORT || '3000';
  const bases = [`http://127.0.0.1:${port}`, `http://localhost:${port}`];

  for (const base of bases) {
    try {
      const resolveUrl = new URL('/api/site-pages/resolve', base);
      resolveUrl.searchParams.set('path', pathname);
      const resolveRes = await fetch(resolveUrl, {
        cache: 'no-store',
        headers: { 'x-site-routing': '1' },
      });
      if (resolveRes.ok) {
        return (await resolveRes.json()) as SitePageRouting;
      }
    } catch {
      /* пробуем следующий origin */
    }
  }

  return { action: 'none' };
}

function isPartialNavigationRequest(req: NextRequest): boolean {
  return (
    req.headers.get('rsc') === '1' ||
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch'
  );
}

function isUploadedMediaPath(pathname: string): boolean {
  return (
    /^\/images\/(?:.+?\/)?upload-[^/]+$/i.test(pathname) ||
    /^\/club-history\/(?:.+?\/)?upload-[^/]+$/i.test(pathname)
  );
}

function isProxiedImagePath(pathname: string): boolean {
  return isUploadedMediaPath(pathname) || pathname.startsWith('/images/email/');
}

function isStaticMediaPath(pathname: string): boolean {
  return (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/club-history/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpe?g|gif|webp|avif|heic)$/i.test(pathname)
  );
}

function rewriteUploadedMedia(req: NextRequest, pathname: string): NextResponse {
  const apiPath = pathname.startsWith('/club-history/')
    ? `/api/serve-upload/club-history/${pathname.slice('/club-history/'.length)}`
    : `/api/serve-upload/${pathname.slice('/images/'.length)}`;
  return NextResponse.rewrite(new URL(apiPath, req.url));
}

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

function isSeoPublicFile(pathname: string): boolean {
  return pathname === '/robots.txt' || pathname === '/sitemap.xml';
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isSeoPublicFile(pathname)) {
    return NextResponse.next();
  }

  if (isProxiedImagePath(pathname)) {
    return rewriteUploadedMedia(req, pathname);
  }

  if (isStaticMediaPath(pathname)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-site-lang', parseSiteLang(req.cookies.get(SITE_LANG_COOKIE)?.value));

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: req.nextUrl.protocol === 'https:',
  });
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
  } else if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    try {
      const routing = await fetchSitePageRouting(pathname);
      if (
        routing.action === 'redirect' &&
        routing.target &&
        !isPartialNavigationRequest(req)
      ) {
        const target = routing.target.startsWith('/')
          ? new URL(routing.target, req.url)
          : routing.target;
        return NextResponse.redirect(target, 308);
      }
      if (routing.action === 'rewrite' && routing.target) {
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = routing.target;
        return NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        });
      }
    } catch {
      /* SEO-маршрутизация недоступна — сработает маршрут [seoSlug] */
    }
  }

  if (!isSitePreviewPublicPath(pathname) && (await isSitePreviewEnabled(req)) && !isAdmin) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
