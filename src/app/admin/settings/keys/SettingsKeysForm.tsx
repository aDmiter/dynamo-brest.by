// src/app/admin/settings/keys/SettingsKeysForm.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SettingKey {
  key: string;
  label: string;
}

interface Props {
  initialValues: Record<string, string>;
  keys: SettingKey[];
}

export default function SettingsKeysForm({ initialValues, keys }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleVisibility = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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
      <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <p className="text-sm text-gray-400 mb-6">
          Ключи хранятся в зашифрованном виде и недоступны из браузера. После сохранения кэш
          сбрасывается автоматически.
        </p>

        <div className="space-y-4">
          {keys.map(({ key, label }) => {
            const isVisible = visible[key];
            return (
              <div key={key}>
                <label className="text-sm text-gray-400 mb-1 block">{label}</label>
                <div className="relative">
                  <Input
                    type={isVisible ? 'text' : 'password'}
                    value={values[key] || ''}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    className="border-white/10 bg-white/5 text-white font-mono text-xs pr-10"
                    placeholder={`Введите ${label}...`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={isVisible ? faEyeSlash : faEye} className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
          >
            <FontAwesomeIcon icon={saved ? faCheck : faSave} className="mr-2" />
            {saving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
