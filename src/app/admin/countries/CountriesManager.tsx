// src/app/admin/countries/CountriesManager.tsx - Управление странами
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faCheck,
  faToggleOn,
  faToggleOff,
  faSync,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BelpostSyncSummary {
  updated: number;
  unavailable: number;
  skipped: number;
  errors: number;
  items: Array<{
    code: string;
    name: string;
    status: string;
    price?: number;
    message?: string;
  }>;
}

interface Country {
  id: string;
  name: string;
  code: string;
  price: string | null;
  isActive: boolean;
}

interface CountriesManagerProps {
  countries: Country[];
}

export default function CountriesManager({ countries }: CountriesManagerProps) {
  const router = useRouter();
  const mapCountriesToForm = (list: Country[]) =>
    list.map((c) => ({
      ...c,
      price: c.price?.toString() || '',
    }));

  const [data, setData] = useState(mapCountriesToForm(countries));

  useEffect(() => {
    setData(mapCountriesToForm(countries));
  }, [countries]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<BelpostSyncSummary | null>(null);
  const [syncError, setSyncError] = useState('');

  const updatePrice = (id: string, value: string) => {
    const numPrice = parseFloat(value);
    const shouldBeActive = !isNaN(numPrice) && numPrice > 0;

    setData((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              price: value,
              isActive: shouldBeActive ? true : c.isActive,
            }
          : c
      )
    );
  };

  const toggleActive = (id: string) => {
    setData((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleBelpostSync = async () => {
    if (
      !confirm(
        'Загрузить тарифы с tarifikator.belpost.by?\n\n' +
          'Параметры: юр. лицо, приоритет, без объявленной ценности, 1 кг.\n' +
          'Цена: округление вверх до десятков + 20 BYN.\n' +
          'Беларусь не изменяется. Недоступные в Belpost страны будут отключены.'
      )
    ) {
      return;
    }

    setSyncing(true);
    setSyncError('');
    setSyncResult(null);

    try {
      const res = await fetch('/api/countries/sync-belpost', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        setSyncError(body.error || 'Ошибка синхронизации');
        return;
      }
      setSyncResult(body as BelpostSyncSummary);
      router.refresh();
    } catch {
      setSyncError('Ошибка сети при синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const updates = data.map((c) => ({
      id: c.id,
      price: c.price ? parseFloat(c.price) : null,
      isActive: c.isActive,
    }));

    try {
      await fetch('/api/countries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countries: updates }),
      });
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="text-sm text-gray-400 max-w-2xl space-y-1">
          <p>
            Введите цену доставки (BYN) — страна активируется автоматически. Беларусь задаётся
            вручную.
          </p>
          <p>
            «Синхронизировать Belpost» — тарификатор (1 кг, юр. лицо, приоритет), округление вверх
            до десятков + 20 BYN; недоступные страны отключаются.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleBelpostSync}
            disabled={syncing || saving}
            className="border-white/10 text-gray-200 hover:bg-white/10"
          >
            <FontAwesomeIcon
              icon={syncing ? faSpinner : faSync}
              className={`mr-2 ${syncing ? 'animate-spin' : ''}`}
            />
            {syncing ? 'Синхронизация…' : 'Синхронизировать Belpost'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || syncing}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
          >
            <FontAwesomeIcon icon={success ? faCheck : faSave} className="mr-2" />
            {success ? 'Сохранено!' : saving ? 'Сохранение...' : 'Сохранить все'}
          </Button>
        </div>
      </div>

      {syncError && (
        <p className="mb-4 text-sm text-red-400">{syncError}</p>
      )}

      {syncResult && (
        <div className="mb-4 rounded border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">
          <p className="text-white font-medium mb-2">Синхронизация Belpost завершена</p>
          <p>
            Обновлено: {syncResult.updated}, отключено: {syncResult.unavailable}, пропущено:{' '}
            {syncResult.skipped}
            {syncResult.errors > 0 ? `, ошибок: ${syncResult.errors}` : ''}.
          </p>
          {syncResult.errors > 0 && (
            <ul className="mt-2 text-xs text-red-300/90 list-disc pl-5">
              {syncResult.items
                .filter((i) => i.status === 'error')
                .map((i) => (
                  <li key={i.code}>
                    {i.code} — {i.name}: {i.message}
                  </li>
                ))}
            </ul>
          )}
          {syncResult.unavailable > 0 && (
            <ul className="mt-2 text-xs text-gray-500 list-disc pl-5">
              {syncResult.items
                .filter((i) => i.status === 'unavailable')
                .map((i) => (
                  <li key={i.code}>
                    {i.code} — {i.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm text-gray-400">Страна</th>
              <th className="p-3 text-left text-sm text-gray-400">Код</th>
              <th className="p-3 text-left text-sm text-gray-400">Цена (BYN)</th>
              <th className="p-3 text-center text-sm text-gray-400 w-20">Активна</th>
            </tr>
          </thead>
          <tbody>
            {data.map((country) => (
              <tr
                key={country.id}
                className={`border-b border-white/5 transition-colors ${
                  country.isActive ? 'hover:bg-white/5' : 'opacity-40'
                }`}
              >
                <td className="p-3 text-white">{country.name}</td>
                <td className="p-3 text-sm text-gray-400">{country.code}</td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="0.01"
                    value={country.price}
                    onChange={(e) => updatePrice(country.id, e.target.value)}
                    className="w-32 border-white/10 bg-white/5 text-white text-sm"
                    placeholder="0.00"
                    min="0"
                  />
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleActive(country.id)}
                    className={`text-xl transition-colors ${
                      country.isActive
                        ? 'text-green-500 hover:text-green-400'
                        : 'text-gray-600 hover:text-gray-500'
                    }`}
                    title={country.isActive ? 'Активна' : 'Неактивна'}
                  >
                    <FontAwesomeIcon icon={country.isActive ? faToggleOn : faToggleOff} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
