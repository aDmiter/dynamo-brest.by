import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/order-email';

const STATIC_PATHS = [
  '/',
  '/news',
  '/club/about',
  '/club/contacts',
  '/club/partners',
  '/club/stadium',
  '/club/history',
  '/club/administration',
  '/team/main/players',
  '/team/main/coaches',
  '/team/main/calendar',
  '/team/main/results',
  '/team/main/table',
  '/team/reserve/players',
  '/team/reserve/calendar',
  '/team/reserve/results',
  '/team/women/players',
  '/team/women/calendar',
  '/team/women/results',
  '/school/about',
  '/school/join',
  '/shop/catalog',
  '/shop/delivery',
  '/shop/payment',
  '/shop/returns',
  '/page/tickets',
  '/media/press',
  '/media/anthems',
  '/services/fields',
  '/services/gym',
  '/services/cafe',
  '/services/hotel',
  '/services/transport',
  '/fans',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const lastModified = new Date();

  return STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
