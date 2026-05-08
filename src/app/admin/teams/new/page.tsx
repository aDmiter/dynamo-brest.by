// src/app/admin/teams/new/page.tsx - Добавление новой команды
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NewTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    cometId: '',
    isActive: true,
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      if (response.ok) {
        router.push('/admin/teams');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при создании команды');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/teams">
          <Button variant="outline" size="sm">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Назад
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#003366]">Добавить команду</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Новая команда</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Название команды *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Динамо-Брест"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Slug (URL)
                <span className="text-gray-400 ml-1">— заполнится автоматически</span>
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="dynamo-brest"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Comet ID (из API федерации)</label>
              <Input
                value={formData.cometId}
                onChange={(e) => setFormData({ ...formData, cometId: e.target.value })}
                placeholder="ID команды в системе Comet"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Порядок сортировки</label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm">
                Команда активна
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Link href="/admin/teams">
                <Button variant="outline" type="button">
                  Отмена
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
