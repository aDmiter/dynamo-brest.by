'use client';

import { useSiteLocale } from '@/modules/shared/ui/SiteLocaleProvider';
import type { SiteLang } from '@/lib/site-locale';

const OPTIONS: SiteLang[] = ['ru', 'be'];

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useSiteLocale();

  return (
    <div
      className={`language-switcher flex items-center gap-1 text-xs font-medium tracking-widest ${className}`}
      role="group"
      aria-label="Язык сайта"
    >
      {OPTIONS.map((code) => {
        const active = lang === code;
        const label = code === 'ru' ? t('ui.lang.ru') : t('ui.lang.be');
        return (
          <button
            key={code}
            type="button"
            onClick={() => void setLang(code)}
            className="px-1 py-0.5 transition-colors"
            style={{
              color: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.45)',
            }}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
