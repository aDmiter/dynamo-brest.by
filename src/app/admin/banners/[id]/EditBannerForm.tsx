// src/app/admin/banners/[id]/EditBannerForm.tsx - Форма редактирования баннера
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  backgroundUrl: string | null;
  isActive: boolean;
  position: string;
  clicks: number;
  views: number;
}

interface Props {
  banner: Banner;
}

export default function EditBannerForm({ banner }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: banner.title,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl,
    backgroundUrl: banner.backgroundUrl || '',
    isActive: banner.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Баннер обновлён');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при обновлении');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить баннер?')) return;

    try {
      await fetch(`/api/banners/${banner.id}`, { method: 'DELETE' });
      router.push('/admin/banners');
    } catch {
      setError('Ошибка при удалении');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/banners">
          <Button variant="outline" size="sm">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Назад
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Форма */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Редактирование</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Название *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">URL баннера *</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Превью"
                    className="mt-2 max-h-20 object-contain"
                  />
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Ссылка *</label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Фон секции</label>
                <Input
                  value={formData.backgroundUrl}
                  onChange={(e) => setFormData({ ...formData, backgroundUrl: e.target.value })}
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
                <Button variant="destructive" type="button" onClick={handleDelete}>
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Удалить
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Статистика */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Показы</p>
                <p className="text-2xl font-bold text-[#003366]">{banner.views}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Клики</p>
                <p className="text-2xl font-bold text-[#ee862c]">{banner.clicks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CTR</p>
                <p className="text-2xl font-bold text-[#14516c]">
                  {banner.views > 0 ? ((banner.clicks / banner.views) * 100).toFixed(2) : '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
