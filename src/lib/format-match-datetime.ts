// src/lib/format-match-datetime.ts
const TBD_THRESHOLD_YEAR = 1971;

export function isMatchDateTbd(date: Date): boolean {
  return date.getFullYear() < TBD_THRESHOLD_YEAR;
}

export function formatMatchDateTime(date: Date): {
  dateLabel: string;
  timeLabel: string | null;
  isTbd: boolean;
} {
  if (isMatchDateTbd(date)) {
    return { dateLabel: 'Дата уточняется', timeLabel: null, isTbd: true };
  }

  return {
    dateLabel: date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    timeLabel: date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    isTbd: false,
  };
}
