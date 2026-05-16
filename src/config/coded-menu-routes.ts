/**
 * Пункты меню на страницы, свёрстанные в коде (src/app/...).
 * В БД: type = link, linkUrl = путь ниже. Не использовать type = page.
 */
export const CODED_MENU_ROUTES: Record<string, string> = {
  'services-transport': '/page/services-transport',
  'services-fields': '/services/fields',
  'services-gym': '/services/gym',
  tickets: '/page/tickets',
};
