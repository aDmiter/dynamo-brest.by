import type { Metadata } from 'next';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CODED_MENU_ROUTES } from '@/config/coded-menu-routes';
import { resolveFooterMenuTextPageUrl, resolveMainMenuTextPageUrl } from '@/lib/cms-text-page-paths';
import { prisma } from '@/lib/prisma';

export type SitePageRegistryEntry = {
  path: string;
  label: string;
  source: string;
  defaultTitle?: string;
  defaultDescription?: string;
  isTemplate?: boolean;
};

const TEAM_SLUGS = ['main', 'reserve', 'women'] as const;
const TEAM_SECTIONS = [
  { suffix: 'players', label: 'Состав' },
  { suffix: 'calendar', label: 'Календарь' },
  { suffix: 'results', label: 'Результаты' },
  { suffix: 'table', label: 'Таблица' },
  { suffix: 'coaches', label: 'Тренеры' },
] as const;

const TEAM_LABELS: Record<(typeof TEAM_SLUGS)[number], string> = {
  main: 'Основной состав',
  reserve: 'Дублирующий состав',
  women: 'Женская команда',
};

function metaStrings(metadata?: Metadata): { title?: string; description?: string } {
  if (!metadata) return {};
  const title = typeof metadata.title === 'string' ? metadata.title : undefined;
  const description =
    typeof metadata.description === 'string' ? metadata.description : undefined;
  return { title, description };
}

function staticPages(): SitePageRegistryEntry[] {
  const pages: SitePageRegistryEntry[] = [
    { path: '/', label: 'Главная', source: 'static' },
    { path: '/news', label: 'Новости', source: 'static' },
    { path: '/shop/catalog', label: 'Каталог магазина', source: 'static' },
    { path: '/shop/cart', label: 'Корзина', source: 'static' },
    { path: '/shop/checkout', label: 'Оформление заказа', source: 'static' },
    { path: '/shop/checkout/success', label: 'Заказ оформлен', source: 'static' },
    { path: '/club/history', label: 'История клуба', source: 'static' },
    { path: '/club/about', label: 'О клубе', source: 'static' },
    { path: '/club/administration', label: 'Администрация', source: 'static' },
    { path: '/page/tickets', label: 'Билеты', source: 'static' },
    { path: '/school/coaches', label: 'Тренеры школы', source: 'static' },
    {
      path: '/news/[slug]',
      label: 'Новость (шаблон)',
      source: 'template',
      isTemplate: true,
    },
    {
      path: '/shop/product/[slug]',
      label: 'Товар (шаблон)',
      source: 'template',
      isTemplate: true,
    },
    {
      path: '/team/player/[slug]',
      label: 'Игрок (шаблон)',
      source: 'template',
      isTemplate: true,
    },
    {
      path: '/page/[slug]',
      label: 'CMS-страница меню (шаблон)',
      source: 'template',
      isTemplate: true,
    },
    {
      path: '/legal/[slug]',
      label: 'Юридическая страница (шаблон)',
      source: 'template',
      isTemplate: true,
    },
  ];

  for (const [slug, cfg] of Object.entries(CODED_CMS_PAGES)) {
    const { title, description } = metaStrings(cfg.metadata);
    const label =
      (typeof cfg.metadata.title === 'string' ? cfg.metadata.title.split('|')[0]?.trim() : null) ||
      slug;
    pages.push({
      path: cfg.path,
      label,
      source: 'coded-cms',
      defaultTitle: title,
      defaultDescription: description,
    });
  }

  for (const [slug, path] of Object.entries(CODED_MENU_ROUTES)) {
    if (pages.some((p) => p.path === path)) continue;
    pages.push({
      path,
      label: slug,
      source: 'coded-link',
    });
  }

  for (const team of TEAM_SLUGS) {
    for (const section of TEAM_SECTIONS) {
      pages.push({
        path: `/team/${team}/${section.suffix}`,
        label: `${TEAM_LABELS[team]} — ${section.label}`,
        source: 'team',
      });
    }
  }

  return pages;
}

export async function collectSitePageRegistry(): Promise<SitePageRegistryEntry[]> {
  const map = new Map<string, SitePageRegistryEntry>();

  for (const page of staticPages()) {
    map.set(page.path, page);
  }

  const [menuPages, footerPages] = await Promise.all([
    prisma.menuitem.findMany({
      where: { type: 'page', isActive: true },
      select: { slug: true, title: true },
    }),
    prisma.footermenuitem.findMany({
      where: { type: 'page', isActive: true },
      select: { slug: true, title: true },
    }),
  ]);

  for (const item of menuPages) {
    const path = resolveMainMenuTextPageUrl(item.slug);
    if (!map.has(path)) {
      map.set(path, {
        path,
        label: item.title,
        source: 'cms-menu',
      });
    }
  }

  for (const item of footerPages) {
    const path = resolveFooterMenuTextPageUrl(item.slug);
    if (!map.has(path)) {
      map.set(path, {
        path,
        label: item.title,
        source: 'cms-footer',
      });
    }
  }

  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path, 'ru'));
}

export async function syncSitePageRegistry(): Promise<number> {
  const registry = await collectSitePageRegistry();

  for (const entry of registry) {
    await prisma.sitePageMeta.upsert({
      where: { path: entry.path },
      create: {
        path: entry.path,
        label: entry.label,
        source: entry.source,
        isTemplate: Boolean(entry.isTemplate),
        defaultTitle: entry.defaultTitle ?? null,
        defaultDescription: entry.defaultDescription ?? null,
      },
      update: {
        label: entry.label,
        source: entry.source,
        isTemplate: Boolean(entry.isTemplate),
        defaultTitle: entry.defaultTitle ?? null,
        defaultDescription: entry.defaultDescription ?? null,
      },
    });
  }

  return registry.length;
}
