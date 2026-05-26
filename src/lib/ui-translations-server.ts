import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { withDb } from '@/lib/with-db';
import { createUiTranslator, type UiTranslator } from '@/lib/ui-translations';
import { parseSiteLang, type SiteLang } from '@/lib/site-locale';

export async function getSiteLangFromHeaders(): Promise<SiteLang> {
  const headersList = await headers();
  return parseSiteLang(headersList.get('x-site-lang'));
}

async function loadBeUiOverridesFromDb(): Promise<Record<string, string>> {
  const rows = await withDb(
    () =>
      prisma.translation.findMany({
        where: { locale: 'be', key: { startsWith: 'ui.' } },
        select: { key: true, value: true },
      }),
    [],
    'ui-translations-be',
  );
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

const getCachedBeUiOverrides = unstable_cache(
  loadBeUiOverridesFromDb,
  ['ui-translations-be-map'],
  { revalidate: 3600, tags: ['ui-translations-be'] },
);

/** RU — пустой объект и без БД; BY — кэшированные строки ui.* */
export async function getPublicLocaleBundle(): Promise<{
  lang: SiteLang;
  beOverrides: Record<string, string>;
}> {
  const lang = await getSiteLangFromHeaders();
  if (lang === 'ru') {
    return { lang, beOverrides: {} };
  }
  return { lang, beOverrides: await getCachedBeUiOverrides() };
}

/** Для публичного shell: RU без запроса к БД, BY — один кэшированный select */
export async function getPublicUiTranslator(): Promise<{
  lang: SiteLang;
  t: UiTranslator;
}> {
  const { lang, beOverrides } = await getPublicLocaleBundle();
  return { lang, t: createUiTranslator(lang, beOverrides) };
}
