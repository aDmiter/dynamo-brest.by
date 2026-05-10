// src/app/admin/banners/[id]/EditBannerForm.tsx - Форма редактирования баннера
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faArrowLeft,
  faTrash,
  faEye,
  faMousePointer,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import ImageUpload from '@/modules/admin/components/ImageUpload';

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

  const [form, setForm] = useState({
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
        body: JSON.stringify(form),
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
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Назад
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{banner.title}</CardTitle>
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
              <div>
                <label className="mb-1 block text-sm text-gray-400">Баннер</label>
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Превью" className="mt-2 max-h-16 object-contain" />
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Название *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Ссылка *</label>
                <Input
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Фон секции</label>
                <ImageUpload
                  value={form.backgroundUrl}
                  onChange={(url) => setForm({ ...form, backgroundUrl: url })}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 accent-[#ee862c]"
                  />
                  Баннер активен
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ee862c] hover:bg-[#f0ac74]"
                >
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

        {/* Статистика */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-white">Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-white/10 p-4 text-center">
                <FontAwesomeIcon icon={faEye} className="mb-1 text-2xl text-gray-400" />
                <p className="text-sm text-gray-400">Показы</p>
                <p className="text-2xl font-bold text-white">{banner.views}</p>
              </div>
              <div className="border border-white/10 p-4 text-center">
                <FontAwesomeIcon icon={faMousePointer} className="mb-1 text-2xl text-[#ee862c]" />
                <p className="text-sm text-gray-400">Клики</p>
                <p className="text-2xl font-bold text-white">{banner.clicks}</p>
              </div>
              <div className="border border-white/10 p-4 text-center">
                <p className="text-sm text-gray-400">CTR</p>
                <p className="text-2xl font-bold text-white">
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
