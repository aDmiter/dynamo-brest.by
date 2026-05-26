'use client';

import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UI_TRANSLATION_GROUPS,
  type UiTranslationKey,
} from '@/config/ui-translations';

type TranslationRow = {
  key: UiTranslationKey;
  ru: string;
  be: string;
};

export default function TranslationsAdmin() {
  const [items, setItems] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'missing'>('all');
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/translations');
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { items: TranslationRow[] };
    setItems(data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateBe = (key: UiTranslationKey, be: string) => {
    setItems((prev) => prev.map((row) => (row.key === key ? { ...row, be } : row)));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/admin/translations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(({ key, be }) => ({ key, be })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage('Не удалось сохранить');
      return;
    }
    setMessage('Сохранено');
    await load();
  };

  const visibleKeys = new Set(
    UI_TRANSLATION_GROUPS.flatMap((g) =>
      filter === 'missing'
        ? g.keys.filter((key) => !items.find((r) => r.key === key)?.be.trim())
        : g.keys,
    ),
  );

  if (loading) {
    return <p className="text-gray-500">Загрузка…</p>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm text-gray-400">
        Русский текст задаётся в коде сайта. Здесь — только белорусские подписи интерфейса (шапка,
        подвал). Пустое поле BY на сайте показывает русский вариант.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          className={filter === 'all' ? 'bg-[#ee862c] hover:bg-[#f0ac74]' : 'border-white/20'}
          onClick={() => setFilter('all')}
        >
          Все строки
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === 'missing' ? 'default' : 'outline'}
          className={filter === 'missing' ? 'bg-[#ee862c] hover:bg-[#f0ac74]' : 'border-white/20'}
          onClick={() => setFilter('missing')}
        >
          Без белорусского
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={saving}
          className="ml-auto bg-[#ee862c] hover:bg-[#f0ac74]"
          onClick={save}
        >
          <FontAwesomeIcon icon={faSave} className="mr-2" />
          {saving ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </div>

      {message && <p className="text-sm text-[#ee862c]">{message}</p>}

      {UI_TRANSLATION_GROUPS.map((group) => {
        const groupKeys = group.keys.filter((key) => visibleKeys.has(key));
        if (groupKeys.length === 0) return null;

        return (
          <section
            key={group.id}
            className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-white">{group.label}</h2>
            <div className="space-y-4">
              {groupKeys.map((key) => {
                const row = items.find((r) => r.key === key);
                if (!row) return null;
                return (
                  <div
                    key={key}
                    className="grid gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0 md:grid-cols-[1fr_1fr]"
                  >
                    <div>
                      <p className="mb-1 font-mono text-[10px] text-gray-500">{key}</p>
                      <p className="text-sm text-gray-300">{row.ru}</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Белорусский</label>
                      <Input
                        value={row.be}
                        onChange={(e) => updateBe(key, e.target.value)}
                        className="border-white/10 bg-white/5 text-white"
                        placeholder="Как на сайте, если пусто — русский"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
