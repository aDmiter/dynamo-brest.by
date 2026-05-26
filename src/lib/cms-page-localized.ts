import { prisma } from '@/lib/prisma';
import {
  loadBeTranslationsMap,
  localizeCmsPageRecord,
  type ContentResourceType,
} from '@/lib/content-translations';
import { getSiteLangFromCookies } from '@/lib/content-translations-server';

type CmsRow = {
  id: string;
  title: string;
  subtitle: string | null;
  pageContent: string | null;
  heroHeader: boolean;
  imageUrl: string | null;
  isActive: boolean;
  type: string;
};

export async function localizeCmsRow<T extends CmsRow>(
  page: T,
  resourceType: ContentResourceType,
): Promise<T> {
  const lang = await getSiteLangFromCookies();
  if (lang === 'ru') return page;
  const tr = await loadBeTranslationsMap(resourceType, [page.id]);
  return localizeCmsPageRecord(page, lang, tr);
}

export async function getLocalizedMainMenuPage(slug: string) {
  const page = await prisma.menuitem.findUnique({ where: { slug } });
  if (!page || !page.isActive || page.type !== 'page') return null;
  return localizeCmsRow(page, 'menuitem');
}

export async function getLocalizedFooterMenuPage(slug: string) {
  const page = await prisma.footermenuitem.findUnique({ where: { slug } });
  if (!page || !page.isActive || page.type !== 'page') return null;
  return localizeCmsRow(page, 'footermenuitem');
}
