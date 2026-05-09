// src/app/admin/sponsors/[id]/EditSponsorForm.tsx - Редактирование спонсора
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faArrowLeft,
  faTrash,
  faTrophy,
  faStar,
  faLandmark,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import ImageUpload from '@/modules/admin/components/ImageUpload';

const sponsorTypes = [
  {
    value: 'league',
    label: 'Спонсор лиги',
    description: 'Отображается в первом ряду по центру',
    icon: faTrophy,
  },
  {
    value: 'general',
    label: 'Общий спонсор',
    description: 'Отображается в общем ряду',
    icon: faStar,
  },
  {
    value: 'government',
    label: 'Гос. организация',
    description: 'Отображается в нижнем ряду',
    icon: faLandmark,
  },
];

interface Sponsor {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string | null;
  type: string;
  order: number;
  isActive: boolean;
}

interface Props {
  sponsor: Sponsor;
}

export default function EditSponsorForm({ sponsor }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: sponsor.name,
    imageUrl: sponsor.imageUrl,
    linkUrl: sponsor.linkUrl || '',
    type: sponsor.type,
    order: sponsor.order,
    isActive: sponsor.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/sponsors/${sponsor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess('Спонсор обновлён');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить спонсора "${sponsor.name}"?`)) return;
    try {
      await fetch(`/api/sponsors/${sponsor.id}`, { method: 'DELETE' });
      router.push('/admin/sponsors');
    } catch {
      setError('Ошибка при удалении');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/sponsors">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">{sponsor.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Логотип */}
            <div>
              <label className="mb-1 block text-sm text-gray-400">Логотип</label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>

            {/* Название */}
            <div>
              <label className="mb-1 block text-sm text-gray-400">Название *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                required
              />
            </div>

            {/* Ссылка */}
            <div>
              <label className="mb-1 block text-sm text-gray-400">Ссылка</label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-600"
                placeholder="https://..."
              />
            </div>

            {/* Тип спонсора */}
            <div>
              <label className="mb-3 block text-sm text-gray-400">Тип спонсора</label>
              <div className="space-y-2">
                {sponsorTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex cursor-pointer items-start gap-4 border p-4 transition-all ${
                      form.type === type.value
                        ? 'border-[#ee862c]/50 bg-[#ee862c]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={form.type === type.value}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="mt-0.5 accent-[#ee862c]"
                    />
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon
                        icon={type.icon}
                        className={`mt-0.5 text-lg ${
                          form.type === type.value ? 'text-[#ee862c]' : 'text-gray-500'
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            form.type === type.value ? 'text-white' : 'text-gray-300'
                          }`}
                        >
                          {type.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Активен */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[#ee862c]"
                />
                Спонсор активен
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button variant="destructive" type="button" onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} className="mr-2" /> Удалить
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
