import type { Metadata } from 'next';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { prisma } from '@/lib/prisma';

const DEFAULT_METADATA: Metadata = {
  title: 'Официальный сайт футбольного клуба «Динамо-Брест»',
  description: 'Официальный сайт футбольного клуба «Динамо-Брест»',
};

export function normalizeSitePath(pathname: string): string {
  if (!pathname || pathname === '') return '/';
  let path = pathname.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

export async function getSitePageMeta(pathname: string) {
  return prisma.sitePageMeta.findUnique({
    where: { path: normalizeSitePath(pathname) },
  });
}

export async function resolveSiteMetadata(
  pathname: string,
  fallback: Metadata = DEFAULT_METADATA
): Promise<Metadata> {
  const row = await getSitePageMeta(pathname);
  if (!row) return fallback;

  const fbTitle = typeof fallback.title === 'string' ? fallback.title : DEFAULT_METADATA.title;
  const fbDesc =
    typeof fallback.description === 'string'
      ? fallback.description
      : DEFAULT_METADATA.description;

  return {
    ...fallback,
    title: row.title?.trim() || row.defaultTitle?.trim() || fbTitle,
    description: row.description?.trim() || row.defaultDescription?.trim() || fbDesc,
  };
}

export function createCodedPageMetadata(slug: keyof typeof CODED_CMS_PAGES) {
  return async (): Promise<Metadata> => {
    const cfg = CODED_CMS_PAGES[slug];
    return resolveSiteMetadata(cfg.path, cfg.metadata);
  };
}

export async function getSitePageRedirect(pathname: string): Promise<string | null> {
  const row = await getSitePageMeta(pathname);
  if (!row?.redirectTo?.trim()) return null;
  const redirectTo = row.redirectTo.trim();
  const path = normalizeSitePath(pathname);
  if (normalizeSitePath(redirectTo) === path) return null;
  return redirectTo;
}

export async function recordSitePageVisit(pathname: string): Promise<void> {
  const path = normalizeSitePath(pathname);
  if (path.startsWith('/admin') || path.startsWith('/api')) return;

  const row = await prisma.sitePageMeta.findUnique({ where: { path } });
  if (!row || row.isTemplate) return;

  await prisma.sitePageMeta.update({
    where: { path },
    data: { visitCount: { increment: 1 } },
  });
}

export { DEFAULT_METADATA };
