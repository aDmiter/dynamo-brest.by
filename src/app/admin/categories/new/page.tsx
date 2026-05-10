// src/app/admin/categories/new/page.tsx - Добавление категории
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import ImageUpload from '@/modules/admin/components/ImageUpload';
import { transliterate } from '@/lib/utils';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.name) {
      setError('Название обязательно');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: form.slug || transliterate(form.name),
        }),
      });
      if (res.ok) {
        router.push('/admin/categories');
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

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/categories">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">Добавить категорию</h1>
      </div>

      <Card className="max-w-2xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Новая категория</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Изображение</label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Название *</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value, slug: transliterate(e.target.value) })
                }
                className="border-white/10 bg-white/5 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Slug (URL)</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Порядок сортировки</label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Link href="/admin/categories">
                <Button
                  variant="outline"
                  type="button"
                  className="border-white/10 text-gray-400 hover:text-white"
                >
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
