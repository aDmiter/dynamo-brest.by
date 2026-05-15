// src/lib/settings.ts
import { prisma } from '@/lib/prisma';

// Кэш в памяти на 60 секунд
const cache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL = 60_000; // 1 минута

export async function getSetting(key: string): Promise<string> {
  // Сначала проверяем кэш
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  // Ищем в БД
  const setting = await prisma.setting.findUnique({ where: { key } });
  const value = setting?.value || '';

  // Кэшируем
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL });

  return value;
}

// Получить все настройки одной группой (для массовой загрузки)
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: keys } },
  });

  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = '';
  }
  for (const s of settings) {
    result[s.key] = s.value;
    cache.set(s.key, { value: s.value, expiresAt: Date.now() + CACHE_TTL });
  }

  return result;
}

// Инвалидация кэша
export function clearSettingsCache(): void {
  cache.clear();
}
