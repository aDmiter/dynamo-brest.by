import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CODED_MENU_ROUTES } from '@/config/coded-menu-routes';

/** Пункты подраздела «Интернет-магазин» главного меню (как в seed-menu). */
export const SHOP_MAIN_MENU_LINKS = [
  { title: 'Каталог', href: CODED_MENU_ROUTES['shop-catalog'] },
  { title: 'Доставка', href: CODED_CMS_PAGES['shop-delivery'].path },
  { title: 'Оплата', href: CODED_CMS_PAGES['shop-payment'].path },
  { title: 'Возврат товара', href: CODED_CMS_PAGES['shop-returns'].path },
] as const;
