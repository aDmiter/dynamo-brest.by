export type SitePageTemplateId = 'player' | 'news' | 'product' | 'cms-page' | 'legal-page';

type TemplateRule = {
  id: SitePageTemplateId;
  templatePath: string;
  match: (path: string) => boolean;
};

export const SITE_PAGE_TEMPLATE_RULES: TemplateRule[] = [
  {
    id: 'player',
    templatePath: '/team/player/[slug]',
    match: (path) => /^\/team\/player\/[^/]+$/.test(path),
  },
  {
    id: 'news',
    templatePath: '/news/[slug]',
    match: (path) => /^\/news\/[^/]+$/.test(path),
  },
  {
    id: 'product',
    templatePath: '/shop/product/[slug]',
    match: (path) => /^\/shop\/product\/[^/]+$/.test(path),
  },
  {
    id: 'cms-page',
    templatePath: '/page/[slug]',
    match: (path) => /^\/page\/[^/]+$/.test(path),
  },
  {
    id: 'legal-page',
    templatePath: '/legal/[slug]',
    match: (path) => /^\/legal\/[^/]+$/.test(path),
  },
];

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '') return '/';
  let path = pathname.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

export function resolveSitePageTemplatePath(pathname: string): string | null {
  const path = normalizePath(pathname);
  for (const rule of SITE_PAGE_TEMPLATE_RULES) {
    if (rule.match(path)) return rule.templatePath;
  }
  return null;
}

/** Подстановки для title/description шаблонов в SEO-админке */
export const SITE_PAGE_TEMPLATE_PLACEHOLDERS: Record<SitePageTemplateId, string[]> = {
  player: ['{fullName}', '{firstName}', '{lastName}', '{number}', '{position}', '{team}'],
  news: ['{title}', '{category}'],
  product: ['{name}', '{price}', '{category}'],
  'cms-page': ['{title}'],
  'legal-page': ['{title}'],
};
