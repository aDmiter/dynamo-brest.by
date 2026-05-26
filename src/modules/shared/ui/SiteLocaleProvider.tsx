'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  UI_TRANSLATION_DEFAULTS,
  type UiTranslationKey,
} from '@/config/ui-translations';
import { createUiTranslator, type UiTranslator } from '@/lib/ui-translations';
import type { SiteLang } from '@/lib/site-locale';

type SiteLocaleContextValue = {
  lang: SiteLang;
  t: UiTranslator;
  setLang: (lang: SiteLang) => Promise<void>;
};

const SiteLocaleContext = createContext<SiteLocaleContextValue | null>(null);

export function SiteLocaleProvider({
  lang,
  beOverrides,
  children,
}: {
  lang: SiteLang;
  beOverrides: Record<string, string>;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const t = useMemo(
    () => createUiTranslator(lang, beOverrides),
    [lang, beOverrides],
  );

  const setLang = useCallback(
    async (next: SiteLang) => {
      if (next === lang) return;
      await fetch('/api/site-locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: next }),
      });
      router.refresh();
    },
    [lang, router],
  );

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);

  return <SiteLocaleContext.Provider value={value}>{children}</SiteLocaleContext.Provider>;
}

export function useSiteLocale(): SiteLocaleContextValue {
  const ctx = useContext(SiteLocaleContext);
  if (!ctx) {
    return {
      lang: 'ru',
      t: (key: UiTranslationKey) => UI_TRANSLATION_DEFAULTS[key],
      setLang: async () => {},
    };
  }
  return ctx;
}
