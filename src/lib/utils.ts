import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/lib/utils.ts - Утилиты (транслитерация, форматирование)
export function transliterate(text: string): string {
  const ru: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    ' ': '-',
    _: '-',
    ',': '',
    '.': '',
    '!': '',
    '?': '',
    '"': '',
    "'": '',
    ':': '',
    ';': '',
    '(': '',
    ')': '',
    '[': '',
    ']': '',
    '{': '',
    '}': '',
    '«': '',
    '»': '',
    '–': '-',
    '—': '-',
    '/': '-',
    '\\': '-',
    '|': '-',
    '+': '-',
    '=': '-',
    '*': '',
    '&': 'and',
    '@': '',
    '#': '',
    $: '',
    '%': '',
    '^': '',
    '~': '',
    '`': '',
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => ru[char] || char)
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

export function formatDate(date: Date, locale: string = 'ru-RU'): string {
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
