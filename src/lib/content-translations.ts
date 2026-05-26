import { prisma } from '@/lib/prisma';
import { pickLocalized, type SiteLang } from '@/lib/site-locale';

export const CONTENT_LOCALE = 'be' as const;

export type ContentResourceType = 'news' | 'menuitem' | 'footermenuitem' | 'product';

export type BeFieldsPayload = Record<string, string | null | undefined>;

export function pickLocalizedField(
  ru: string | null | undefined,
  be: string | null | undefined,
  lang: SiteLang,
): string {
  if (lang !== 'be') return ru?.trim() || '';
  return pickLocalized(ru?.trim() || '', be);
}

export async function saveBeContentTranslations(
  resourceType: ContentResourceType,
  resourceId: string,
  fields: BeFieldsPayload,
): Promise<void> {
  for (const [field, raw] of Object.entries(fields)) {
    if (raw === undefined) continue;
    const value = typeof raw === 'string' ? raw.trim() : '';

    if (!value) {
      await prisma.contentTranslation.deleteMany({
        where: { resourceType, resourceId, field, locale: CONTENT_LOCALE },
      });
      continue;
    }

    await prisma.contentTranslation.upsert({
      where: {
        resourceType_resourceId_field_locale: {
          resourceType,
          resourceId,
          field,
          locale: CONTENT_LOCALE,
        },
      },
      create: {
        resourceType,
        resourceId,
        field,
        locale: CONTENT_LOCALE,
        value,
      },
      update: { value },
    });
  }
}

export async function loadBeTranslationsMap(
  resourceType: ContentResourceType,
  resourceIds: string[],
): Promise<Map<string, Record<string, string>>> {
  if (resourceIds.length === 0) return new Map();

  const rows = await prisma.contentTranslation.findMany({
    where: {
      resourceType,
      resourceId: { in: resourceIds },
      locale: CONTENT_LOCALE,
    },
  });

  const map = new Map<string, Record<string, string>>();
  for (const row of rows) {
    const trimmed = row.value.trim();
    if (!trimmed) continue;
    const bucket = map.get(row.resourceId) ?? {};
    bucket[row.field] = trimmed;
    map.set(row.resourceId, bucket);
  }
  return map;
}

export async function loadBeFieldsForResource(
  resourceType: ContentResourceType,
  resourceId: string,
): Promise<Record<string, string>> {
  const map = await loadBeTranslationsMap(resourceType, [resourceId]);
  return map.get(resourceId) ?? {};
}

export function localizeNewsRecord<
  T extends { id: string; title: string; excerpt?: string | null; content?: string | null },
>(item: T, lang: SiteLang, translations: Map<string, Record<string, string>>): T {
  if (lang === 'ru') return item;
  const be = translations.get(item.id);
  if (!be) return item;
  return {
    ...item,
    title: pickLocalizedField(item.title, be.title, 'be'),
    ...(item.excerpt !== undefined && {
      excerpt: pickLocalizedField(item.excerpt ?? '', be.excerpt, 'be'),
    }),
    ...(item.content !== undefined && {
      content: pickLocalizedField(item.content ?? '', be.content, 'be'),
    }),
  };
}

export function localizeProductRecord<
  T extends {
    id: string;
    name: string;
    description?: string | null;
    composition?: string | null;
  },
>(item: T, lang: SiteLang, translations: Map<string, Record<string, string>>): T {
  if (lang === 'ru') return item;
  const be = translations.get(item.id);
  if (!be) return item;
  return {
    ...item,
    name: pickLocalizedField(item.name, be.name, 'be'),
    ...(item.description !== undefined && {
      description: pickLocalizedField(item.description ?? '', be.description, 'be'),
    }),
    ...(item.composition !== undefined && {
      composition: pickLocalizedField(item.composition ?? '', be.composition, 'be'),
    }),
  };
}

export async function localizeProducts<
  T extends {
    id: string;
    name: string;
    description?: string | null;
    composition?: string | null;
  },
>(products: T[], lang: SiteLang): Promise<T[]> {
  if (lang === 'ru' || products.length === 0) return products;
  const tr = await loadBeTranslationsMap(
    'product',
    products.map((p) => p.id),
  );
  return products.map((p) => localizeProductRecord(p, lang, tr));
}

export function localizeCmsPageRecord<
  T extends {
    id: string;
    title: string;
    subtitle?: string | null;
    pageContent?: string | null;
  },
>(item: T, lang: SiteLang, translations: Map<string, Record<string, string>>): T {
  if (lang === 'ru') return item;
  const be = translations.get(item.id);
  if (!be) return item;
  return {
    ...item,
    title: pickLocalizedField(item.title, be.title, 'be'),
    subtitle: be.subtitle !== undefined ? pickLocalizedField(item.subtitle ?? '', be.subtitle, 'be') : item.subtitle,
    pageContent:
      be.pageContent !== undefined
        ? pickLocalizedField(item.pageContent ?? '', be.pageContent, 'be')
        : item.pageContent,
  };
}
