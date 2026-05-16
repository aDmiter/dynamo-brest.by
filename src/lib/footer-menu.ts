// src/lib/footer-menu.ts — утилиты нижнего меню
export type FooterMenuItemRecord = {
  type: string;
  slug: string;
  linkUrl: string | null;
  isExternal: boolean;
};

export function getFooterItemHref(item: FooterMenuItemRecord): string {
  if (item.type === 'link' && item.linkUrl) {
    return item.linkUrl;
  }
  return `/legal/${item.slug}`;
}

export function isFooterItemExternal(item: FooterMenuItemRecord): boolean {
  if (item.type === 'link') {
    return item.isExternal;
  }
  return false;
}
