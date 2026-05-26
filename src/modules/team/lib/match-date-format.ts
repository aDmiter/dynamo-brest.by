const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export function formatMatchDateLong(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMatchDateShort(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const year = y >= 2000 ? String(y).slice(-2) : String(y);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}.${year}`;
}

export function formatWeekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[new Date(iso).getDay()];
}
