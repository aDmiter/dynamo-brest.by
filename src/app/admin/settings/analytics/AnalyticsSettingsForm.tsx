'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { ANALYTICS_SETTING_KEYS } from '@/lib/analytics';

interface Props {
  initialGoogle: string;
  initialYandex: string;
}

export default function AnalyticsSettingsForm({ initialGoogle, initialYandex }: Props) {
  const [google, setGoogle] = useState(initialGoogle);
  const [yandex, setYandex] = useState(initialYandex);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [ANALYTICS_SETTING_KEYS.google]: google,
          [ANALYTICS_SETTING_KEYS.yandex]: yandex,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <p className="mb-6 text-sm leading-relaxed text-gray-400">
          Вставьте полный код счётчика из личного кабинета Google Analytics и Яндекс.Метрики.
          Скрипты подключаются на публичных страницах (не в админке). После сохранения обновите
          сайт и проверьте счётчик в режиме отладки.
        </p>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Google Analytics
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Код из раздела «Установка тега» / gtag.js — обычно один или несколько тегов{' '}
              <code className="text-[#ee862c]/90">&lt;script&gt;</code> для вставки в{' '}
              <code className="text-[#ee862c]/90">&lt;head&gt;</code>
            </p>
            <textarea
              value={google}
              onChange={(e) => setGoogle(e.target.value)}
              rows={10}
              className="w-full resize-y border border-white/10 bg-[#1a1f2e] p-3 font-mono text-xs leading-relaxed text-white focus:border-[#ee862c]/50 focus:outline-none"
              placeholder={'<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>\n<script>...</script>'}
              spellCheck={false}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Яндекс.Метрика
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Полный код счётчика: <code className="text-[#ee862c]/90">&lt;script&gt;</code> и, если
              есть, <code className="text-[#ee862c]/90">&lt;noscript&gt;</code> — блок noscript
              автоматически попадёт в начало страницы
            </p>
            <textarea
              value={yandex}
              onChange={(e) => setYandex(e.target.value)}
              rows={12}
              className="w-full resize-y border border-white/10 bg-[#1a1f2e] p-3 font-mono text-xs leading-relaxed text-white focus:border-[#ee862c]/50 focus:outline-none"
              placeholder={'<!-- Yandex.Metrika counter -->\n<script type="text/javascript">...</script>\n<noscript>...</noscript>'}
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
