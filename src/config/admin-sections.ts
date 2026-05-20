// Разделы админ-панели для назначения прав
export const ADMIN_SECTION_IDS = [
  'dashboard',
  'news',
  'club_history',
  'players',
  'coaches',
  'opponent_teams',
  'matches',
  'shop',
  'standings',
  'banners',
  'sponsors',
  'titles',
  'translations',
  'settings',
] as const;

export type AdminSectionId = (typeof ADMIN_SECTION_IDS)[number];

export interface AdminSectionDef {
  id: AdminSectionId;
  label: string;
  pathPrefixes: string[];
}

export const ADMIN_SECTIONS: AdminSectionDef[] = [
  { id: 'dashboard', label: 'Дашборд', pathPrefixes: ['/admin/dashboard'] },
  { id: 'news', label: 'Новости', pathPrefixes: ['/admin/news'] },
  { id: 'club_history', label: 'История клуба', pathPrefixes: ['/admin/club-history'] },
  { id: 'players', label: 'Игроки', pathPrefixes: ['/admin/players'] },
  { id: 'coaches', label: 'Тренеры', pathPrefixes: ['/admin/coaches'] },
  { id: 'opponent_teams', label: 'Клубы', pathPrefixes: ['/admin/opponent-teams', '/admin/teams'] },
  { id: 'matches', label: 'Матчи', pathPrefixes: ['/admin/matches'] },
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
  { id: 'standings', label: 'Таблицы', pathPrefixes: ['/admin/standings'] },
  { id: 'banners', label: 'Баннеры', pathPrefixes: ['/admin/banners'] },
  { id: 'sponsors', label: 'Спонсоры', pathPrefixes: ['/admin/sponsors'] },
  { id: 'titles', label: 'Титулы', pathPrefixes: ['/admin/titles'] },
  { id: 'translations', label: 'Переводы', pathPrefixes: ['/admin/translations'] },
  { id: 'settings', label: 'Настройки', pathPrefixes: ['/admin/settings'] },
];

export const ALL_ADMIN_SECTION_IDS: AdminSectionId[] = [...ADMIN_SECTION_IDS];

export function getSectionLabel(id: AdminSectionId): string {
  return ADMIN_SECTIONS.find((s) => s.id === id)?.label ?? id;
}
