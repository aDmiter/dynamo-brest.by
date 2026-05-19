import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';

/**
 * Пункты меню на страницы с фиксированным URL.
 * type = page — CMSTextPage (редактор в «Меню сайта»).
 * type = link — coded-страница без редактора (каталог, история, билеты и т.д.).
 */
export const CODED_MENU_ROUTES: Record<string, string> = {
  ...Object.fromEntries(Object.entries(CODED_CMS_PAGES).map(([slug, cfg]) => [slug, cfg.path])),
  tickets: '/page/tickets',
  'club-history': '/club/history',
  'shop-catalog': '/shop/catalog',
  'school-coaches': '/school/coaches',
};
