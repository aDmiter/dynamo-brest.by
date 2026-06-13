import type { Metadata } from 'next';
import { cache } from 'react';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CODED_MENU_ROUTES } from '@/config/coded-menu-routes';
import { resolveMainMenuTextPageUrl } from '@/lib/cms-text-page-paths';
import { SITE_ICONS } from '@/lib/site-icons';
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
  icons: SITE_ICONS,
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

type SitePageAliasMaps = {
  aliasToPath: Map<string, string>;
  pathToPublic: Map<string, string>;
};

export const getSitePageAliasMaps = cache(async (): Promise<SitePageAliasMaps> => {
  if (!hasSitePageMetaTable()) {
    return { aliasToPath: new Map(), pathToPublic: new Map() };
  }

  try {
    const rows = await prisma.sitePageMeta.findMany({
      where: { redirectTo: { not: null }, isTemplate: false },
      select: { path: true, redirectTo: true },
    });

    const aliasToPath = new Map<string, string>();
    const pathToPublic = new Map<string, string>();

    for (const row of rows) {
      const internalPath = normalizeSitePath(row.path);
      const publicPath = normalizeSitePath(row.redirectTo!.trim());
      if (internalPath === publicPath || !publicPath.startsWith('/')) continue;
      aliasToPath.set(publicPath, internalPath);
      pathToPublic.set(internalPath, publicPath);
    }

    return { aliasToPath, pathToPublic };
  } catch {
    return { aliasToPath: new Map(), pathToPublic: new Map() };
  }
});

export async function resolveSitePageRegistryPath(pathname: string): Promise<string> {
  const path = normalizeSitePath(pathname);
  const { aliasToPath } = await getSitePageAliasMaps();
  return aliasToPath.get(path) ?? path;
}

/** Публичный URL страницы с учётом SEO-редиректа (для меню и ссылок). */
export async function resolvePublicSitePath(pathname: string): Promise<string> {
  const path = normalizeSitePath(pathname);
  const { pathToPublic } = await getSitePageAliasMaps();
  return pathToPublic.get(path) ?? path;
}

export type SitePageRoutingAction = 'none' | 'redirect' | 'rewrite';

export type SitePageRouting = {
  action: SitePageRoutingAction;
  target?: string;
};

/** Редирект со старого URL или внутренний rewrite на новый публичный адрес. */
export async function resolveSitePageRouting(pathname: string): Promise<SitePageRouting> {
  const path = normalizeSitePath(pathname);
  const row = await fetchSitePageMetaRow(path);

  if (row?.redirectTo?.trim()) {
    const target = row.redirectTo.trim();
    if (normalizeSitePath(target) !== path) {
      return { action: 'redirect', target };
    }
  }

  const { aliasToPath } = await getSitePageAliasMaps();
  const internalPath = aliasToPath.get(path);
  if (internalPath) {
    return { action: 'rewrite', target: internalPath };
  }

  return { action: 'none' };
}

/** Точный path или шаблон (/team/player/[slug] для /team/player/ivanov) */
export const getSitePageMetaForUrl = cache(async (pathname: string) => {
  const path = normalizeSitePath(pathname);
  const registryPath = await resolveSitePageRegistryPath(path);
  const exact = await fetchSitePageMetaRow(registryPath);
  if (exact) return { row: exact, fromTemplate: false };

  const templatePath = resolveSitePageTemplatePath(registryPath);
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
  const registryPath = await resolveSitePageRegistryPath(pathname);
  const exact = await fetchSitePageMetaRow(registryPath);
  const templatePath = resolveSitePageTemplatePath(registryPath);
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
  const routing = await resolveSitePageRouting(pathname);
  return routing.action === 'redirect' ? routing.target ?? null : null;
}

/** Канонический внутренний URL пункта меню (без SEO-алиаса). */
export function resolveMenuItemInternalUrl(item: {
  type: string;
  slug: string;
  linkUrl: string | null;
}): string {
  if (item.type === 'page') {
    return resolveMainMenuTextPageUrl(item.slug);
  }
  if (item.slug in CODED_MENU_ROUTES) {
    return CODED_MENU_ROUTES[item.slug];
  }
  if (item.linkUrl) {
    return item.linkUrl;
  }
  return '#';
}

async function resolveStalePublicMenuPath(publicPath: string): Promise<string | null> {
  const { aliasToPath } = await getSitePageAliasMaps();
  if (aliasToPath.has(publicPath)) {
    return aliasToPath.get(publicPath)!;
  }

  const segment = publicPath.split('/').filter(Boolean).pop();
  if (!segment || !hasSitePageMetaTable()) return null;

  try {
    const candidates = await prisma.sitePageMeta.findMany({
      where: {
        redirectTo: null,
        isTemplate: false,
        path: { endsWith: `/${segment}` },
      },
      select: { path: true },
    });
    if (candidates.length === 1 && candidates[0].path !== publicPath) {
      return candidates[0].path;
    }
  } catch {
    return null;
  }

  return null;
}

export async function resolveMenuItemPublicUrl(item: {
  type: string;
  slug: string;
  linkUrl: string | null;
}): Promise<string> {
  if (item.type === 'page') {
    return resolvePublicSitePath(resolveMainMenuTextPageUrl(item.slug));
  }

  if (item.slug in CODED_MENU_ROUTES) {
    return resolvePublicSitePath(CODED_MENU_ROUTES[item.slug]);
  }

  if (item.linkUrl) {
    const linkPath = normalizeSitePath(item.linkUrl);
    const staleInternal = await resolveStalePublicMenuPath(linkPath);
    const internalUrl = staleInternal ?? linkPath;
    return resolvePublicSitePath(internalUrl);
  }

  return '#';
}

export async function syncMenuLinksForSitePageRedirect(
  fromPath: string,
  toPath: string
): Promise<void> {
  if (!toPath.startsWith('/')) return;

  await prisma.menuitem.updateMany({
    where: { linkUrl: fromPath },
    data: { linkUrl: toPath },
  });
  await prisma.footermenuitem.updateMany({
    where: { linkUrl: fromPath },
    data: { linkUrl: toPath },
  });
}

export async function recordSitePageVisit(pathname: string): Promise<void> {
  const path = await resolveSitePageRegistryPath(pathname);
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
