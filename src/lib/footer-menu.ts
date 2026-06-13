// src/lib/footer-menu.ts — утилиты нижнего меню
import { resolveMenuItemPublicUrl } from '@/lib/site-page-meta';

export type FooterMenuItemRecord = {
  type: string;
  slug: string;
  linkUrl: string | null;
  isExternal: boolean;
};

export async function getFooterItemHref(item: FooterMenuItemRecord): Promise<string> {
  if (item.type === 'link') {
    return resolveMenuItemPublicUrl(item);
  }
  return `/legal/${item.slug}`;
}

export function isFooterItemExternal(item: FooterMenuItemRecord): boolean {
  if (item.type === 'link') {
    return item.isExternal;
  }
  return false;
}
