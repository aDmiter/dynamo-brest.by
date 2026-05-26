// Разделы админ-панели для назначения прав
export const ADMIN_SECTION_IDS = [
  'dashboard',
  'shop',
  'news',
  'opponent_teams',
  'players',
  'coaches',
  'matches',
  'club_partners',
  'sponsors',
  'banners',
  'club_history',
  'titles',
  'translations',
  'settings',
  'standings',
] as const;

export type AdminSectionId = (typeof ADMIN_SECTION_IDS)[number];

export interface AdminSectionDef {
  id: AdminSectionId;
  label: string;
  pathPrefixes: string[];
}

export const ADMIN_SECTIONS: AdminSectionDef[] = [
  { id: 'dashboard', label: 'Дашборд', pathPrefixes: ['/admin/dashboard'] },
  {
    id: 'shop',
    label: 'Интернет-магазин',
    pathPrefixes: [
      '/admin/shop',
      '/admin/products',
      '/admin/categories',
      '/admin/manufacturers',
      '/admin/orders',
      '/admin/countries',
    ],
  },
  { id: 'news', label: 'Новости', pathPrefixes: ['/admin/news'] },
  { id: 'opponent_teams', label: 'Клубы', pathPrefixes: ['/admin/opponent-teams', '/admin/teams'] },
  { id: 'players', label: 'Игроки', pathPrefixes: ['/admin/players'] },
  { id: 'coaches', label: 'Тренеры', pathPrefixes: ['/admin/coaches'] },
  { id: 'matches', label: 'Матчи', pathPrefixes: ['/admin/matches'] },
  { id: 'club_partners', label: 'Партнёры', pathPrefixes: ['/admin/club-partners'] },
  { id: 'sponsors', label: 'Спонсоры', pathPrefixes: ['/admin/sponsors'] },
  { id: 'banners', label: 'Баннеры', pathPrefixes: ['/admin/banners'] },
  { id: 'club_history', label: 'История', pathPrefixes: ['/admin/club-history'] },
  { id: 'titles', label: 'Титулы', pathPrefixes: ['/admin/titles'] },
  { id: 'translations', label: 'Переводы', pathPrefixes: ['/admin/translations'] },
  { id: 'settings', label: 'Настройки', pathPrefixes: ['/admin/settings'] },
  { id: 'standings', label: 'Таблицы (устар.)', pathPrefixes: ['/admin/standings'] },
];

export const ALL_ADMIN_SECTION_IDS: AdminSectionId[] = [...ADMIN_SECTION_IDS];

export function getSectionLabel(id: AdminSectionId): string {
  return ADMIN_SECTIONS.find((s) => s.id === id)?.label ?? id;
}
