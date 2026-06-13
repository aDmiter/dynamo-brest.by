// src/lib/date-utils.ts - Утилиты для работы с датами и временем (сайт — Europe/Minsk)

/** Часовой пояс клуба для отображения на сайте и в админке */
export const SITE_TIMEZONE = 'Europe/Minsk';

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Форматирует дату для datetime-local (локальное время браузера администратора)
 */
export function formatLocalDateTime(value: string | Date): string {
  const d = toDate(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Локальное время из datetime-local → ISO UTC для API / БД
 */
export function toUTCString(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}

/** Дата на публичном сайте (SSR и клиент — всегда Minsk) */
export function formatSiteDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  return toDate(value).toLocaleDateString('ru-RU', {
    timeZone: SITE_TIMEZONE,
    ...options,
  });
}

/** Время на публичном сайте */
export function formatSiteTime(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  return toDate(value).toLocaleTimeString('ru-RU', {
    timeZone: SITE_TIMEZONE,
    ...options,
  });
}

/** Краткая дата (списки карточек) */
export function formatSiteDateShort(value: string | Date): string {
  return formatSiteDate(value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Короткий день недели для матчей (вс, пн, …) */
export function formatSiteWeekdayShort(value: string | Date): string {
  return toDate(value).toLocaleDateString('ru-RU', {
    timeZone: SITE_TIMEZONE,
    weekday: 'short',
  });
}

/** Дата матча с днём недели; опционально время (Minsk, одинаково на SSR и клиенте) */
export function formatSiteMatchDateWithWeekday(
  value: string | Date,
  withTime = false
): string {
  const weekday = formatSiteWeekdayShort(value);
  const date = formatSiteDate(value);
  if (!withTime) return `${weekday}, ${date}`;
  return `${weekday}, ${date} · ${formatSiteTime(value)}`;
}
