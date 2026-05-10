// src/app/admin/countries/CountriesManager.tsx - Управление странами
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [data, setData] = useState(
    countries.map((c) => ({
      ...c,
      price: c.price?.toString() || '',
    }))
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Введите цену доставки (BYN) — страна активируется автоматически. Беларусь — всегда активна
          и бесплатно.
        </p>
        <Button onClick={handleSave} disabled={saving} className="bg-[#ee862c] hover:bg-[#f0ac74]">
          <FontAwesomeIcon icon={success ? faCheck : faSave} className="mr-2" />
          {success ? 'Сохранено!' : saving ? 'Сохранение...' : 'Сохранить все'}
        </Button>
      </div>

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
