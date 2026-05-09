// src/app/admin/banners/new/page.tsx - Создание рекламного баннера
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NewBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '/images/banners/',
    linkUrl: 'https://',
    backgroundUrl: '/images/banners/',
    isActive: true,
    position: 'home',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/banners');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при создании баннера');
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
        <Link href="/admin/banners">
          <Button variant="outline" size="sm">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Назад
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#003366]">Добавить баннер</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Новый рекламный баннер</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Название *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Например: Fonbet"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">URL баннера *</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="/images/banners/banner.png"
                required
              />
              <p className="mt-1 text-xs text-gray-400">Путь к файлу в public/images/banners/</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Ссылка (куда ведёт баннер) *</label>
              <Input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Фон секции
                <span className="text-gray-400 ml-1">— необязательно</span>
              </label>
              <Input
                value={formData.backgroundUrl}
                onChange={(e) => setFormData({ ...formData, backgroundUrl: e.target.value })}
                placeholder="/images/banners/bg.jpg"
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
                Баннер активен
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Link href="/admin/banners">
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
