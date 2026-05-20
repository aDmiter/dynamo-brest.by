'use client';

import { useLayoutEffect } from 'react';
import { applySiteThemeToDocument } from '@/lib/site-theme';

interface Props {
  settings: Record<string, string>;
}

/** Дублирует SSR-тему после навигации на клиенте */
export default function ThemeInitializer({ settings }: Props) {
  useLayoutEffect(() => {
    applySiteThemeToDocument(settings);
  }, [settings]);

  return null;
}
