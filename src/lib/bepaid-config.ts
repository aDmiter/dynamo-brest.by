/** Режим и credentials bePaid (сервер). */

import { BEPAID_MOCK_TOKEN_PREFIX } from '@/config/bepaid-public';

export { BEPAID_MOCK_TOKEN_PREFIX };

export function isBePaidConfigured(): boolean {
  return Boolean(process.env.BEPAID_SHOP_ID?.trim() && process.env.BEPAID_SECRET_KEY?.trim());
}

/**
 * Имитация bePaid без ключей (до договора).
 * BEPAID_MOCK=1 — принудительно; BEPAID_MOCK=0 — выкл;
 * в development без ключей — включается автоматически.
 */
export function isBePaidMockMode(): boolean {
  const flag = process.env.BEPAID_MOCK;
  if (flag === '0') return false;
  if (flag === '1') return true;
  return process.env.NODE_ENV === 'development' && !isBePaidConfigured();
}

export function createBePaidMockToken(trackingId: string): string {
  return `${BEPAID_MOCK_TOKEN_PREFIX}${trackingId}`;
}

export function parseBePaidMockToken(token: string): string | null {
  if (!token.startsWith(BEPAID_MOCK_TOKEN_PREFIX)) return null;
  const trackingId = token.slice(BEPAID_MOCK_TOKEN_PREFIX.length);
  return trackingId || null;
}

export function isBePaidMockToken(token: string): boolean {
  return token.startsWith(BEPAID_MOCK_TOKEN_PREFIX);
}
