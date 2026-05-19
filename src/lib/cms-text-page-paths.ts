import { CODED_MENU_ROUTES } from '@/config/coded-menu-routes';

/** URL CMSTextPage из главного меню (menuitem type=page) */
export function resolveMainMenuTextPageUrl(slug: string): string {
  return CODED_MENU_ROUTES[slug] ?? `/page/${slug}`;
}

/** URL CMSTextPage из нижнего меню (footermenuitem type=page) */
export function resolveFooterMenuTextPageUrl(slug: string): string {
  return `/legal/${slug}`;
}
