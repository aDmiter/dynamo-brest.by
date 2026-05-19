// src/lib/analytics.ts — идентификаторы счётчиков из настроек
import { getSettings } from '@/lib/settings';

export const ANALYTICS_SETTING_KEYS = {
  google: 'analytics_google',
  yandex: 'analytics_yandex',
  googleEnabled: 'analytics_google_enabled',
  yandexEnabled: 'analytics_yandex_enabled',
} as const;

/** GA4 / Universal Analytics / Google tag */
const GOOGLE_ID_PATTERN = /^(G-[A-Z0-9]+|UA-\d+-\d+|GT-[A-Z0-9]+)$/i;

/** Номер счётчика Яндекс.Метрики */
const YANDEX_ID_PATTERN = /^\d{5,12}$/;

export type AnalyticsConfig = {
  googleId: string;
  yandexId: string;
  googleEnabled: boolean;
  yandexEnabled: boolean;
};

export function parseSettingFlag(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export function settingFlagToString(enabled: boolean): string {
  return enabled ? '1' : '0';
}

export function parseGoogleAnalyticsId(raw: string): string {
  const value = raw.trim();
  if (!value) return '';

  if (GOOGLE_ID_PATTERN.test(value)) {
    return value.toUpperCase().replace(/^g-/, 'G-').replace(/^gt-/, 'GT-').replace(/^ua-/, 'UA-');
  }

  const fromUrl = value.match(/googletagmanager\.com\/gtag\/js\?id=([^"'&\s]+)/i);
  if (fromUrl?.[1] && GOOGLE_ID_PATTERN.test(fromUrl[1])) {
    return parseGoogleAnalyticsId(fromUrl[1]);
  }

  const fromConfig = value.match(/gtag\s*\(\s*['"]config['"]\s*,\s*['"]([^'"]+)['"]/i);
  if (fromConfig?.[1]) return parseGoogleAnalyticsId(fromConfig[1]);

  const fromId = value.match(/\b(G-[A-Z0-9]+|UA-\d+-\d+|GT-[A-Z0-9]+)\b/i);
  if (fromId?.[1]) return parseGoogleAnalyticsId(fromId[1]);

  return '';
}

export function parseYandexMetrikaId(raw: string): string {
  const value = raw.trim();
  if (!value) return '';

  if (YANDEX_ID_PATTERN.test(value)) return value;

  const fromYm = value.match(/\bym\s*\(\s*(\d{5,12})/i);
  if (fromYm?.[1]) return fromYm[1];

  const fromWatch = value.match(/mc\.yandex\.ru\/watch\/(\d{5,12})/i);
  if (fromWatch?.[1]) return fromWatch[1];

  return '';
}

export function isValidGoogleAnalyticsId(id: string): boolean {
  return id === '' || GOOGLE_ID_PATTERN.test(id.trim());
}

export function isValidYandexMetrikaId(id: string): boolean {
  return id === '' || YANDEX_ID_PATTERN.test(id.trim());
}

export async function getAnalyticsConfig(): Promise<AnalyticsConfig> {
  const data = await getSettings(Object.values(ANALYTICS_SETTING_KEYS));
  const googleRaw = data[ANALYTICS_SETTING_KEYS.google]?.trim() ?? '';
  const yandexRaw = data[ANALYTICS_SETTING_KEYS.yandex]?.trim() ?? '';

  return {
    googleId: parseGoogleAnalyticsId(googleRaw),
    yandexId: parseYandexMetrikaId(yandexRaw),
    googleEnabled: parseSettingFlag(data[ANALYTICS_SETTING_KEYS.googleEnabled]),
    yandexEnabled: parseSettingFlag(data[ANALYTICS_SETTING_KEYS.yandexEnabled]),
  };
}
