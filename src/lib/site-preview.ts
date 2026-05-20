import { getSettings } from '@/lib/settings';

export const SITE_PREVIEW_SETTING_KEYS = {
  enabled: 'site_preview_enabled',
  message: 'site_preview_message',
} as const;

export const SITE_PREVIEW_COOKIE = 'site_preview_session';

export const DEFAULT_SITE_PREVIEW_MESSAGE =
  'Сайт временно закрыт для публичного просмотра. Введите логин и пароль для доступа к демонстрационной версии.';

function parseBool(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export async function getSitePreviewStatus(): Promise<{ enabled: boolean; message: string }> {
  const data = await getSettings(Object.values(SITE_PREVIEW_SETTING_KEYS));
  const message = data[SITE_PREVIEW_SETTING_KEYS.message]?.trim();
  return {
    enabled: parseBool(data[SITE_PREVIEW_SETTING_KEYS.enabled]),
    message: message || DEFAULT_SITE_PREVIEW_MESSAGE,
  };
}

export function isSitePreviewPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname === '/preview-login' || pathname.startsWith('/preview-login/')) return true;
  if (pathname.startsWith('/api/site-preview/')) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  return false;
}
