// src/app/admin/settings/SettingsForm.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function generateAccentVariants(hex: string): Record<string, string> {
  const rgb = hexToRgb(hex);
  if (!rgb) return {};
  const { r, g, b } = rgb;
  return {
    accent_color: hex,
    accent_hover: hex, // можно осветлить, но пока так
    accent_7: `rgba(${r}, ${g}, ${b}, 0.07)`,
    accent_10: `rgba(${r}, ${g}, ${b}, 0.10)`,
    accent_12: `rgba(${r}, ${g}, ${b}, 0.12)`,
    accent_15: `rgba(${r}, ${g}, ${b}, 0.15)`,
    accent_20: `rgba(${r}, ${g}, ${b}, 0.20)`,
    accent_30: `rgba(${r}, ${g}, ${b}, 0.30)`,
  };
}

const COLOR_FIELDS = [
  { key: 'accent_color', label: 'Акцентный цвет', default: '#ee862c', cssVar: '--color-accent' },
  { key: 'bg_main', label: 'Основной фон', default: '#0d1117', cssVar: '--color-bg-main' },
  { key: 'bg_card', label: 'Фон карточек', default: '#111820', cssVar: '--color-bg-card' },
  {
    key: 'bg_photo_placeholder',
    label: 'Фон placeholder фото',
    default: '#1a1f2e',
    cssVar: '--color-bg-photo-placeholder',
  },
  { key: 'bg_admin', label: 'Фон админки', default: '#242C41', cssVar: '--color-bg-admin' },
  { key: 'team_names', label: 'Названия команд', default: '#a5b3d5', cssVar: '--color-team-names' },
  { key: 'bio_text', label: 'Текст биографии', default: '#4a5568', cssVar: '--color-bio-text' },
  {
    key: 'bio_watermark',
    label: 'Водяной знак биографии',
    default: '#7ba4c2',
    cssVar: '--color-bio-watermark',
  },
  { key: 'win', label: 'Победа', default: '#22c55e', cssVar: '--color-win' },
  { key: 'loss', label: 'Поражение', default: '#ef4444', cssVar: '--color-loss' },
  {
    key: 'yellow_card',
    label: 'Жёлтая карточка',
    default: '#f5c518',
    cssVar: '--color-yellow-card',
  },
  { key: 'red_card', label: 'Красная карточка', default: '#e53e3e', cssVar: '--color-red-card' },
];

const ALL_CSS_VARS: Record<string, string> = {
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
  team_names: '--color-team-names',
  bio_text: '--color-bio-text',
  bio_watermark: '--color-bio-watermark',
  win: '--color-win',
  loss: '--color-loss',
  yellow_card: '--color-yellow-card',
  red_card: '--color-red-card',
};

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
      const accentVariants = generateAccentVariants(values.accent_color || '#ee862c');
      const allSettings = { ...values, ...accentVariants };

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allSettings),
      });

      // Применяем все CSS-переменные
      for (const [key, cssVar] of Object.entries(ALL_CSS_VARS)) {
        const value = allSettings[key];
        if (value) {
          document.documentElement.style.setProperty(cssVar, value);
        }
      }

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
        const cssVar = ALL_CSS_VARS[k];
        if (cssVar) {
          document.documentElement.style.setProperty(cssVar, v);
        }
      }
    } else {
      const cssVar = ALL_CSS_VARS[key];
      if (cssVar) {
        document.documentElement.style.setProperty(cssVar, value);
      }
    }
  };

  // Генерируем варианты для превью
  const accentVariants = generateAccentVariants(values.accent_color || '#ee862c');

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
