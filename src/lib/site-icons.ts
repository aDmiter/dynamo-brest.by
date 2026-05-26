import type { Metadata } from 'next';

/** Единые иконки сайта (файлы в public/ и src/app/). */
export const SITE_ICONS: NonNullable<Metadata['icons']> = {
  icon: [{ url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  shortcut: '/favicon.ico',
};
