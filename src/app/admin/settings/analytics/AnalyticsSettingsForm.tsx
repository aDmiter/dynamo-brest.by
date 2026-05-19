'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ANALYTICS_SETTING_KEYS,
  isValidGoogleAnalyticsId,
  isValidYandexMetrikaId,
  parseGoogleAnalyticsId,
  parseYandexMetrikaId,
  settingFlagToString,
} from '@/lib/analytics';

interface Props {
  initialGoogle: string;
  initialYandex: string;
  initialGoogleEnabled: boolean;
  initialYandexEnabled: boolean;
}

function CounterEnableButton({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggle}
      className={
        enabled
          ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300'
          : 'border-white/20 text-gray-400 hover:border-[#ee862c]/50 hover:text-white'
      }
    >
      <FontAwesomeIcon icon={faPowerOff} className="mr-2" />
      {enabled ? `${label}: включён` : `Включить ${label}`}
    </Button>
  );
}

export default function AnalyticsSettingsForm({
  initialGoogle,
  initialYandex,
  initialGoogleEnabled,
  initialYandexEnabled,
}: Props) {
  const [googleId, setGoogleId] = useState(initialGoogle);
  const [yandexId, setYandexId] = useState(initialYandex);
  const [googleEnabled, setGoogleEnabled] = useState(initialGoogleEnabled);
  const [yandexEnabled, setYandexEnabled] = useState(initialYandexEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const google = parseGoogleAnalyticsId(googleId);
    const yandex = parseYandexMetrikaId(yandexId);

    if (!isValidGoogleAnalyticsId(google)) {
      setError('Некорректный ID Google Analytics. Пример: G-XXXXXXXXXX');
      return;
    }
    if (!isValidYandexMetrikaId(yandex)) {
      setError('Некорректный номер счётчика Яндекс.Метрики. Только цифры, 5–12 знаков.');
      return;
    }
    if (googleEnabled && !google) {
      setError('Укажите ID Google Analytics или отключите счётчик.');
      return;
    }
    if (yandexEnabled && !yandex) {
      setError('Укажите номер счётчика Яндекс.Метрики или отключите счётчик.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [ANALYTICS_SETTING_KEYS.google]: google,
          [ANALYTICS_SETTING_KEYS.yandex]: yandex,
          [ANALYTICS_SETTING_KEYS.googleEnabled]: settingFlagToString(googleEnabled),
          [ANALYTICS_SETTING_KEYS.yandexEnabled]: settingFlagToString(yandexEnabled),
        }),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      setGoogleId(google);
      setYandexId(yandex);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Ошибка сохранения:', e);
      setError('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <p className="mb-6 text-sm leading-relaxed text-gray-400">
          ID можно сохранить на локальной копии, а счётчики включить только на боевом сервере.
          Пока кнопка «Включить» выключена, скрипты на сайт не попадают.
        </p>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium text-gray-300">Google Analytics — ID тега</label>
              <CounterEnableButton
                enabled={googleEnabled}
                onToggle={() => setGoogleEnabled((v) => !v)}
                label="счётчик Google"
              />
            </div>
            <p className="text-xs text-gray-500">
              Measurement ID, формат <code className="text-[#ee862c]/90">G-XXXXXXXXXX</code>
            </p>
            <Input
              value={googleId}
              onChange={(e) => setGoogleId(e.target.value)}
              className="border-white/10 bg-[#1a1f2e] font-mono text-sm text-white"
              placeholder="G-XXXXXXXXXX"
              spellCheck={false}
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium text-gray-300">
                Яндекс.Метрика — номер счётчика
              </label>
              <CounterEnableButton
                enabled={yandexEnabled}
                onToggle={() => setYandexEnabled((v) => !v)}
                label="счётчик Метрики"
              />
            </div>
            <p className="text-xs text-gray-500">
              Номер из кабинета, например <code className="text-[#ee862c]/90">12345678</code>
            </p>
            <Input
              value={yandexId}
              onChange={(e) => setYandexId(e.target.value.replace(/\D/g, ''))}
              className="border-white/10 bg-[#1a1f2e] font-mono text-sm text-white"
              placeholder="12345678"
              inputMode="numeric"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#ee862c] hover:bg-[#f0ac74] disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2" />
          {saving ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {saved && (
          <span className="flex items-center gap-2 text-sm text-green-400">
            <FontAwesomeIcon icon={faCheck} />
            Сохранено
          </span>
        )}
      </div>
    </div>
  );
}
