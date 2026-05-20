// src/app/admin/settings/SettingsForm.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  applySiteThemeToDocument,
  DEFAULT_ACCENT_COLOR,
  generateAccentVariants,
  SITE_THEME_DEFAULTS,
  SITE_THEME_SETTING_KEYS,
} from '@/lib/site-theme';

const COLOR_FIELDS = [
  { key: 'accent_color', label: 'Акцентный цвет', default: SITE_THEME_DEFAULTS.accent_color, cssVar: '--color-accent' },
  { key: 'bg_main', label: 'Основной фон', default: SITE_THEME_DEFAULTS.bg_main, cssVar: '--color-bg-main' },
  { key: 'bg_card', label: 'Фон карточек', default: SITE_THEME_DEFAULTS.bg_card, cssVar: '--color-bg-card' },
  {
    key: 'bg_photo_placeholder',
    label: 'Фон placeholder фото',
    default: SITE_THEME_DEFAULTS.bg_photo_placeholder,
    cssVar: '--color-bg-photo-placeholder',
  },
  { key: 'bg_admin', label: 'Фон админки', default: SITE_THEME_DEFAULTS.bg_admin, cssVar: '--color-bg-admin' },
  { key: 'team_names', label: 'Названия команд', default: SITE_THEME_DEFAULTS.team_names, cssVar: '--color-team-names' },
  { key: 'bio_text', label: 'Текст биографии', default: SITE_THEME_DEFAULTS.bio_text, cssVar: '--color-bio-text' },
  {
    key: 'bio_watermark',
    label: 'Водяной знак биографии',
    default: SITE_THEME_DEFAULTS.bio_watermark,
    cssVar: '--color-bio-watermark',
  },
  { key: 'win', label: 'Победа', default: SITE_THEME_DEFAULTS.win, cssVar: '--color-win' },
  { key: 'loss', label: 'Поражение', default: SITE_THEME_DEFAULTS.loss, cssVar: '--color-loss' },
  {
    key: 'yellow_card',
    label: 'Жёлтая карточка',
    default: SITE_THEME_DEFAULTS.yellow_card,
    cssVar: '--color-yellow-card',
  },
  { key: 'red_card', label: 'Красная карточка', default: SITE_THEME_DEFAULTS.red_card, cssVar: '--color-red-card' },
];

export default function SettingsForm({ initialValues }: { initialValues: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const field of COLOR_FIELDS) {
      init[field.key] = initialValues[field.key] || field.default;
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Генерируем варианты акцентного цвета
      const accentVariants = generateAccentVariants(values.accent_color || DEFAULT_ACCENT_COLOR);
      const allSettings = { ...values, ...accentVariants };

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allSettings),
      });

      applySiteThemeToDocument(allSettings);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setSaving(false);
    }
  };

  const setValue = (key: string, value: string) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);

    // Если изменился акцентный цвет — сразу генерируем варианты для превью
    if (key === 'accent_color') {
      const variants = generateAccentVariants(value);
      for (const [k, v] of Object.entries(variants)) {
        const cssVar = SITE_THEME_SETTING_KEYS[k as keyof typeof SITE_THEME_SETTING_KEYS];
        if (cssVar && v) document.documentElement.style.setProperty(cssVar, v);
      }
    } else {
      const cssVar = SITE_THEME_SETTING_KEYS[key as keyof typeof SITE_THEME_SETTING_KEYS];
      if (cssVar) document.documentElement.style.setProperty(cssVar, value);
    }
  };

  // Генерируем варианты для превью
  const accentVariants = generateAccentVariants(values.accent_color || DEFAULT_ACCENT_COLOR);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold text-white mb-6">Цветовая схема</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COLOR_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-sm text-gray-400 mb-1 block">{field.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values[field.key] || field.default}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  className="w-8 h-8 p-0.5 border-white/10 bg-white/5 cursor-pointer"
                />
                <Input
                  type="text"
                  value={values[field.key] || ''}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  className="border-white/10 bg-white/5 text-white font-mono text-xs flex-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Превью вариантов акцентного цвета */}
        <div className="mt-6 p-4 border border-white/10 rounded-lg">
          <p className="text-xs text-gray-400 mb-3">Варианты акцентного цвета (авто-генерация)</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(accentVariants).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  style={{
                    backgroundColor: value,
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  title={`${key}: ${value}`}
                />
                <p className="text-[9px] text-gray-500 mt-1">{key.replace('accent_', '')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Превью кнопок */}
        <div className="mt-4 p-4 border border-white/10 rounded-lg">
          <p className="text-xs text-gray-400 mb-3">Превью</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              style={{ backgroundColor: values.accent_color }}
              className="px-4 py-2 text-sm font-bold text-white"
            >
              Акцент
            </button>
            <div
              style={{ color: values.accent_color, borderColor: values.accent_color }}
              className="border px-3 py-1 text-sm font-bold"
            >
              Текст
            </div>
            <div
              style={{
                backgroundColor: values.bg_card,
                borderColor: 'var(--color-border)',
                borderWidth: 1,
              }}
              className="px-3 py-1 text-sm text-white"
            >
              Карточка
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
          >
            <FontAwesomeIcon icon={saved ? faCheck : faSave} className="mr-2" />
            {saving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
