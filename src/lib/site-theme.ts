/** Тема сайта: дефолты и CSS-переменные (SSR + клиент) */

export const DEFAULT_ACCENT_COLOR = '#3b93f1';

export const SITE_THEME_SETTING_KEYS = {
  accent_color: '--color-accent',
  accent_hover: '--color-accent-hover',
  accent_7: '--color-accent-7',
  accent_10: '--color-accent-10',
  accent_12: '--color-accent-12',
  accent_15: '--color-accent-15',
  accent_20: '--color-accent-20',
  accent_30: '--color-accent-30',
  bg_main: '--color-bg-main',
  bg_card: '--color-bg-card',
  bg_photo_placeholder: '--color-bg-photo-placeholder',
  bg_admin: '--color-bg-admin',
  border: '--color-border',
  border_light: '--color-border-light',
  text_stat: '--color-text-stat',
  text_label: '--color-text-label',
  team_names: '--color-team-names',
  bio_text: '--color-bio-text',
  bio_watermark: '--color-bio-watermark',
  win: '--color-win',
  loss: '--color-loss',
  yellow_card: '--color-yellow-card',
  red_card: '--color-red-card',
} as const;

export type SiteThemeSettingKey = keyof typeof SITE_THEME_SETTING_KEYS;

export const SITE_THEME_DEFAULTS: Record<SiteThemeSettingKey, string> = {
  accent_color: DEFAULT_ACCENT_COLOR,
  accent_hover: '#5ca4f3',
  accent_7: 'rgba(59, 147, 241, 0.07)',
  accent_10: 'rgba(59, 147, 241, 0.10)',
  accent_12: 'rgba(59, 147, 241, 0.12)',
  accent_15: 'rgba(59, 147, 241, 0.15)',
  accent_20: 'rgba(59, 147, 241, 0.20)',
  accent_30: 'rgba(59, 147, 241, 0.30)',
  bg_main: '#0d1117',
  bg_card: '#111820',
  bg_photo_placeholder: '#1a1f2e',
  bg_admin: '#242c41',
  border: 'rgba(255, 255, 255, 0.08)',
  border_light: 'rgba(255, 255, 255, 0.1)',
  text_stat: 'rgba(255, 255, 255, 0.45)',
  text_label: 'rgba(255, 255, 255, 0.35)',
  team_names: '#a5b3d5',
  bio_text: '#4a5568',
  bio_watermark: '#7ba4c2',
  win: '#22c55e',
  loss: '#ef4444',
  yellow_card: '#f5c518',
  red_card: '#e53e3e',
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

export function generateAccentVariants(hex: string): Partial<Record<SiteThemeSettingKey, string>> {
  const normalized = hex.trim();
  const rgb = hexToRgb(normalized);
  if (!rgb) return { accent_color: DEFAULT_ACCENT_COLOR };
  const { r, g, b } = rgb;
  return {
    accent_color: normalized,
    accent_hover: normalized,
    accent_7: `rgba(${r}, ${g}, ${b}, 0.07)`,
    accent_10: `rgba(${r}, ${g}, ${b}, 0.10)`,
    accent_12: `rgba(${r}, ${g}, ${b}, 0.12)`,
    accent_15: `rgba(${r}, ${g}, ${b}, 0.15)`,
    accent_20: `rgba(${r}, ${g}, ${b}, 0.20)`,
    accent_30: `rgba(${r}, ${g}, ${b}, 0.30)`,
  };
}

export function resolveSiteThemeValues(settings: Record<string, string>): Record<SiteThemeSettingKey, string> {
  const accent = settings.accent_color?.trim() || SITE_THEME_DEFAULTS.accent_color;
  const fromDb = Object.fromEntries(
    (Object.keys(SITE_THEME_SETTING_KEYS) as SiteThemeSettingKey[])
      .filter((key) => settings[key]?.trim())
      .map((key) => [key, settings[key].trim()])
  ) as Partial<Record<SiteThemeSettingKey, string>>;

  return {
    ...SITE_THEME_DEFAULTS,
    ...generateAccentVariants(accent),
    ...fromDb,
  };
}

/** CSS для вставки в <head> — без FOUC до гидратации */
export function buildRootThemeCss(settings: Record<string, string>): string {
  const resolved = resolveSiteThemeValues(settings);
  const lines = (Object.keys(SITE_THEME_SETTING_KEYS) as SiteThemeSettingKey[]).map((key) => {
    const cssVar = SITE_THEME_SETTING_KEYS[key];
    const value = resolved[key];
    return value ? `${cssVar}:${value}` : '';
  });
  return `:root{${lines.join(';')}}`;
}

export function applySiteThemeToDocument(settings: Record<string, string>): void {
  if (typeof document === 'undefined') return;
  const resolved = resolveSiteThemeValues(settings);
  for (const key of Object.keys(SITE_THEME_SETTING_KEYS) as SiteThemeSettingKey[]) {
    const cssVar = SITE_THEME_SETTING_KEYS[key];
    const value = resolved[key];
    if (value) document.documentElement.style.setProperty(cssVar, value);
  }
}
