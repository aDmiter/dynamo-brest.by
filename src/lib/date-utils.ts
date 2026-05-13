// src/lib/date-utils.ts - Утилиты для работы с датами и временем
/**
 * Форматирует дату для datetime-local инпута (локальное время)
 */
export function formatLocalDateTime(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Конвертирует локальное время из datetime-local в UTC строку для API
 */
export function toUTCString(localDateTime: string): string {
  const d = new Date(localDateTime);
  return d.toISOString();
}
