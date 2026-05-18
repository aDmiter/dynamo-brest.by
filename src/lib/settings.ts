// src/lib/settings.ts
import { prisma } from '@/lib/prisma';

// Кэш в памяти на 60 секунд
const cache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL = 60_000; // 1 минута

function emptySettingsMap(keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, '']));
}

function logSettingsUnavailable(error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[settings] База недоступна, используются значения по умолчанию:', error);
  }
}

export async function getSetting(key: string): Promise<string> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    const value = setting?.value || '';
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL });
    return value;
  } catch (error) {
    logSettingsUnavailable(error);
    return '';
  }
}

// Получить все настройки одной группой (для массовой загрузки)
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result = emptySettingsMap(keys);

  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });

    for (const s of settings) {
      result[s.key] = s.value;
      cache.set(s.key, { value: s.value, expiresAt: Date.now() + CACHE_TTL });
    }
  } catch (error) {
    logSettingsUnavailable(error);
  }

  return result;
}

// Инвалидация кэша
export function clearSettingsCache(): void {
  cache.clear();
}
