/** Язык публичного сайта: RU по умолчанию, BY (белорусский) — locale `be` в API/БД */

export const SITE_LANG_COOKIE = 'site_lang';

export const SITE_LANGUAGES = ['ru', 'be'] as const;
export type SiteLang = (typeof SITE_LANGUAGES)[number];

export function isSiteLang(value: string | null | undefined): value is SiteLang {
  return value === 'ru' || value === 'be';
}

export function parseSiteLang(value: string | null | undefined): SiteLang {
  return isSiteLang(value) ? value : 'ru';
}

export function siteLangHtmlLang(lang: SiteLang): string {
  return lang === 'be' ? 'be' : 'ru';
}

/** BY-значение или fallback на RU */
export function pickLocalized(ru: string, be?: string | null): string {
  const trimmed = be?.trim();
  return trimmed ? trimmed : ru;
}
