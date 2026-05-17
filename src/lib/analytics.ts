// src/lib/analytics.ts — коды счётчиков из настроек
import { getSettings } from '@/lib/settings';

export const ANALYTICS_SETTING_KEYS = {
  google: 'analytics_google',
  yandex: 'analytics_yandex',
} as const;

export type AnalyticsSettings = {
  google: string;
  yandex: string;
};

export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  const data = await getSettings(Object.values(ANALYTICS_SETTING_KEYS));
  return {
    google: data[ANALYTICS_SETTING_KEYS.google]?.trim() ?? '',
    yandex: data[ANALYTICS_SETTING_KEYS.yandex]?.trim() ?? '',
  };
}

/** Отделяет <noscript> Яндекс.Метрики для вставки в начало body */
export function splitYandexMetrika(html: string): { head: string; body: string } {
  const trimmed = html.trim();
  if (!trimmed) return { head: '', body: '' };

  const noscriptMatch = trimmed.match(/<noscript[\s\S]*?<\/noscript>/i);
  if (!noscriptMatch) {
    return { head: trimmed, body: '' };
  }

  const body = noscriptMatch[0];
  const head = trimmed.replace(body, '').trim();
  return { head, body };
}
