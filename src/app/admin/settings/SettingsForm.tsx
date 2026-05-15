// src/app/admin/settings/SettingsForm.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck } from '@fortawesome/free-solid-svg-icons';
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

export default function SettingsForm({ initialValues, keys }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        <div className="space-y-4">
          {keys.map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm text-gray-400 mb-1 block">{label}</label>
              <Input
                type="text"
                value={values[key] || ''}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                className="border-white/10 bg-white/5 text-white font-mono text-xs"
                placeholder={`Введите ${label}...`}
              />
            </div>
          ))}
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
