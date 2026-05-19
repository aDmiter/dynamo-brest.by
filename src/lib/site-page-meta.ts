import type { Metadata } from 'next';
import { cache } from 'react';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { resolveSitePageTemplatePath } from '@/config/site-page-templates';
import { prisma } from '@/lib/prisma';

type SitePageMetaRow = {
  title: string | null;
  description: string | null;
  defaultTitle: string | null;
  defaultDescription: string | null;
  redirectTo: string | null;
  isTemplate: boolean;
};

type SitePageMetaDelegate = {
  findUnique: (args: { where: { path: string } }) => Promise<SitePageMetaRow | null>;
  update: (args: {
    where: { path: string };
    data: { visitCount: { increment: number } };
  }) => Promise<unknown>;
};

export function hasSitePageMetaTable(): boolean {
  return sitePageMetaClient() !== null;
}

function sitePageMetaClient(): SitePageMetaDelegate | null {
  const delegate = (prisma as unknown as { sitePageMeta?: SitePageMetaDelegate }).sitePageMeta;
  if (!delegate?.findUnique) return null;
  return delegate;
}

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

async function fetchSitePageMetaRow(path: string): Promise<SitePageMetaRow | null> {
  const client = sitePageMetaClient();
  if (!client) return null;
  try {
    return await client.findUnique({ where: { path } });
  } catch {
    return null;
  }
}

/** Точное совпадение path в БД */
export const getSitePageMeta = cache(async (pathname: string) => {
  return fetchSitePageMetaRow(normalizeSitePath(pathname));
});

/** Точный path или шаблон (/team/player/[slug] для /team/player/ivanov) */
export const getSitePageMetaForUrl = cache(async (pathname: string) => {
  const path = normalizeSitePath(pathname);
  const exact = await fetchSitePageMetaRow(path);
  if (exact) return { row: exact, fromTemplate: false };

  const templatePath = resolveSitePageTemplatePath(path);
  if (!templatePath) return null;

  const template = await fetchSitePageMetaRow(templatePath);
  if (!template) return null;

  return { row: template, fromTemplate: true };
});

export type MetaTemplateVars = Record<string, string | number | null | undefined>;

export function applyMetaTemplate(
  template: string,
  vars: MetaTemplateVars
): string {
  return template
    .replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = vars[key];
      if (value === null || value === undefined) return '';
      return String(value);
    })
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+-\s+-\s+/g, ' - ')
    .trim();
}

function pickMetaField(
  row: SitePageMetaRow,
  field: 'title' | 'description',
  vars: MetaTemplateVars | undefined,
  fallback: string | undefined
): string | undefined {
  const custom = field === 'title' ? row.title : row.description;
  const defaultVal = field === 'title' ? row.defaultTitle : row.defaultDescription;
  const raw = custom?.trim() || defaultVal?.trim();
  if (!raw) return fallback;
  if (!vars || !raw.includes('{')) return raw;
  return applyMetaTemplate(raw, vars) || fallback;
}

function metadataFromRow(
  row: SitePageMetaRow,
  vars: MetaTemplateVars | undefined,
  fallback: Metadata
): Metadata {
  const fbTitle = typeof fallback.title === 'string' ? fallback.title : DEFAULT_METADATA.title;
  const fbDesc =
    typeof fallback.description === 'string'
      ? fallback.description
      : DEFAULT_METADATA.description;

  return {
    ...fallback,
    title: pickMetaField(row, 'title', vars, fbTitle as string),
    description: pickMetaField(row, 'description', vars, fbDesc as string),
  };
}

/** Layout: только точные path; шаблоны задаёт страница через resolveContextualSiteMetadata */
export async function resolveSiteMetadata(
  pathname: string,
  fallback: Metadata = DEFAULT_METADATA
): Promise<Metadata> {
  const resolved = await getSitePageMetaForUrl(pathname);
  if (!resolved || resolved.fromTemplate) return fallback;
  return metadataFromRow(resolved.row, undefined, fallback);
}

/** Страницы с подстановками (игрок, новость и т.д.) */
export async function resolveContextualSiteMetadata(
  pathname: string,
  vars: MetaTemplateVars,
  fallback: Metadata = DEFAULT_METADATA
): Promise<Metadata> {
  const path = normalizeSitePath(pathname);
  const exact = await fetchSitePageMetaRow(path);
  const templatePath = resolveSitePageTemplatePath(path);
  const template = templatePath ? await fetchSitePageMetaRow(templatePath) : null;

  const hasCustomSeo = Boolean(exact?.title?.trim() || exact?.description?.trim());
  const row = hasCustomSeo ? exact : template ?? exact;
  if (!row) return fallback;

  return metadataFromRow(row, vars, fallback);
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

  try {
    await prisma.sitePageMeta.updateMany({
      where: { path, isTemplate: false },
      data: { visitCount: { increment: 1 } },
    });
  } catch {
    /* таблица sitePageMeta ещё не создана */
  }
}

export { DEFAULT_METADATA };
