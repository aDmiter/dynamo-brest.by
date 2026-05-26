import type { AdminSectionId } from '@/config/admin-sections';

export type AdminApiAccess = 'public' | 'ok' | 'unauthorized' | 'forbidden';

/** Маршруты, всегда доступные без авторизации */
const PUBLIC_API: Array<{ methods: string[]; pattern: RegExp }> = [
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/news$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/products$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/products\/[^/]+$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/banners$/ },
  { methods: ['POST'], pattern: /^\/api\/banners\/click$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/menu$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/footer-menu$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/footer-contacts$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/settings$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/team\/standings$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/youtube$/ },
  { methods: ['GET'], pattern: /^\/api\/site-pages\/resolve$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/matches\/[^/]+\/protocol$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/players\/[^/]+\/stats$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/players\/stats$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/players-customization$/ },
  { methods: ['GET', 'HEAD'], pattern: /^\/api\/facilities\/[^/]+$/ },
  { methods: ['POST'], pattern: /^\/api\/orders$/ },
  { methods: ['PUT'], pattern: /^\/api\/orders\/[^/]+$/ },
  { methods: ['GET', 'POST'], pattern: /^\/api\/webpay\// },
  { methods: ['GET', 'POST'], pattern: /^\/api\/bepaid\// },
  { methods: ['GET', 'POST'], pattern: /^\/api\/auth\// },
  { methods: ['GET'], pattern: /^\/api\/site-preview\/status$/ },
  { methods: ['POST'], pattern: /^\/api\/site-preview\/login$/ },
  { methods: ['POST'], pattern: /^\/api\/site-preview\/logout$/ },
  { methods: ['GET'], pattern: /^\/api\/cron\// },
  { methods: ['GET', 'POST'], pattern: /^\/api\/test-/ },
];

/** GET публичен, мутации — по разделу */
const MUTATION_PUBLIC_GET: Array<{ prefix: string; section: AdminSectionId }> = [
  { prefix: '/api/news', section: 'news' },
  { prefix: '/api/products', section: 'shop' },
  { prefix: '/api/categories', section: 'shop' },
  { prefix: '/api/manufacturers', section: 'shop' },
  { prefix: '/api/banners', section: 'banners' },
  { prefix: '/api/players', section: 'players' },
];

/** Все методы требуют доступ к разделу */
const PROTECTED_PREFIX: Array<{ prefix: string; section: AdminSectionId }> = [
  { prefix: '/api/admin/users', section: 'settings' },
  { prefix: '/api/admin/club-history', section: 'club_history' },
  { prefix: '/api/admin/club-partners', section: 'club_partners' },
  { prefix: '/api/admin/matches', section: 'matches' },
  { prefix: '/api/coaches', section: 'coaches' },
  { prefix: '/api/opponent-teams', section: 'opponent_teams' },
  { prefix: '/api/teams', section: 'opponent_teams' },
  { prefix: '/api/matches', section: 'matches' },
  { prefix: '/api/sponsors', section: 'sponsors' },
  { prefix: '/api/titles', section: 'titles' },
  { prefix: '/api/customizations', section: 'shop' },
  { prefix: '/api/players-customization', section: 'shop' },
  { prefix: '/api/countries', section: 'shop' },
  { prefix: '/api/admin/site-pages', section: 'settings' },
  { prefix: '/api/admin/site-preview', section: 'settings' },
  { prefix: '/api/settings', section: 'settings' },
  { prefix: '/api/sync', section: 'settings' },
  { prefix: '/api/upload', section: 'settings' },
  { prefix: '/api/menu', section: 'settings' },
  { prefix: '/api/footer-menu', section: 'settings' },
  { prefix: '/api/footer-contacts', section: 'settings' },
];

const MUTATION_PREFIX: Array<{ prefix: string; section: AdminSectionId }> = [
  ...MUTATION_PUBLIC_GET,
  { prefix: '/api/players', section: 'players' },
];

const SUPERADMIN_ONLY_PREFIXES = ['/api/admin/users'];

export function matchesPublicApi(pathname: string, method: string): boolean {
  const m = method.toUpperCase();
  return PUBLIC_API.some((rule) => rule.methods.includes(m) && rule.pattern.test(pathname));
}

function matchPrefix(
  pathname: string,
  rules: Array<{ prefix: string; section: AdminSectionId }>
): AdminSectionId | null {
  for (const rule of rules) {
    if (pathname === rule.prefix || pathname.startsWith(rule.prefix + '/')) {
      return rule.section;
    }
  }
  return null;
}

export function resolveAdminApiSection(pathname: string, method: string): AdminSectionId | null {
  const m = method.toUpperCase();
  const isGet = m === 'GET' || m === 'HEAD';

  if (matchesPublicApi(pathname, m)) return null;

  for (const prefix of SUPERADMIN_ONLY_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return 'settings';
    }
  }

  const fullProtected = matchPrefix(pathname, PROTECTED_PREFIX);
  if (fullProtected) return fullProtected;

  if (!isGet) {
    const mutation = matchPrefix(pathname, MUTATION_PREFIX);
    if (mutation) return mutation;
  }

  return null;
}

export function isSuperAdminOnlyApi(pathname: string): boolean {
  return SUPERADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
}
