// src/modules/shared/ui/ThemeInitializer.tsx
'use client';

import { useEffect } from 'react';

const CSS_VAR_MAP: Record<string, string> = {
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
};

interface Props {
  settings: Record<string, string>;
}

export default function ThemeInitializer({ settings }: Props) {
  useEffect(() => {
    for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
      const value = settings[key];
      if (value) {
        document.documentElement.style.setProperty(cssVar, value);
      }
    }
  }, [settings]);

  return null;
}
