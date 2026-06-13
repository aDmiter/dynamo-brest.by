// src/app/admin/news/new/page.tsx - Создание новости
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
import TipTapEditor from '@/modules/admin/components/TipTapEditor';
import AdminSelect from '@/modules/admin/components/Select';
import { formatLocalDateTime, toUTCString } from '@/lib/date-utils';
import ContentBeFields, {
  contentBeToPayload,
  emptyContentBeForm,
  type ContentBeFormState,
} from '@/modules/admin/components/ContentBeFields';

const categories = [
  { value: 'general', label: 'Общее' },
  { value: 'first-team', label: 'Основной состав' },
  { value: 'youth', label: 'Дубль' },
  { value: 'women', label: 'Женская команда' },
  { value: 'school', label: 'Школа' },
  { value: 'transfers', label: 'Трансферы' },
  { value: 'interviews', label: 'Интервью' },
  { value: 'press', label: 'Пресса' },
  { value: 'cup', label: 'Кубок' },
  { value: 'eurocups', label: 'Еврокубки' },
  { value: 'tickets', label: 'Билеты' },
  { value: 'partners', label: 'Партнёры' },
  { value: 'shop', label: 'Магазин' },
  { value: 'video', label: 'Видео' },
];

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    category: 'general',
    isFeatured: false,
    isPublished: true,
    publishedAt: formatLocalDateTime(new Date()),
  });
  const [beForm, setBeForm] = useState<ContentBeFormState>(emptyContentBeForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          publishedAt: toUTCString(form.publishedAt),
          be: contentBeToPayload(beForm, ['title', 'excerpt', 'content']),
        }),
      });

      if (res.ok) {
        router.push('/admin/news');
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
        <Link href="/admin/news">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">Добавить новость</h1>
      </div>

      <Card className="max-w-4xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Новая новость</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Картинка</label>
              <ImageUpload
                folder="featured"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Заголовок *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Краткое описание</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white"
                rows={2}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Текст</label>
              <TipTapEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
              />
            </div>

            <ContentBeFields
              value={beForm}
              onChange={setBeForm}
              fields={['title', 'excerpt', 'content']}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Категория</label>
                <AdminSelect
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </AdminSelect>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Дата публикации</label>
                <Input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4"
                />
                В слайдер
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4"
                />
                Опубликовано
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Link href="/admin/news">
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
