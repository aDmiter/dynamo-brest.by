// src/app/admin/coaches/edit/[id]/EditCoachForm.tsx - Форма редактирования тренера
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTrash, faUser, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import ImageUpload from '@/modules/admin/components/ImageUpload';

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface CoachData {
  id: string;
  cometId: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  shortName: string | null;
  position: string | null;
  birthDate: string | null;
  nationality: string | null;
  country: string | null;
  city: string | null;
  gender: string | null;
  photoUrl: string | null;
  bio: string | null;
  gallery: string | null;
  isActive: boolean;
  isPublished: boolean;
  isManuallyCreated: boolean;
  teams: Team[];
}

interface Props {
  coach: CoachData;
  allTeams: Team[];
}

export default function EditCoachForm({ coach, allTeams }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromTeam = searchParams.get('from');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    firstName: coach.firstName || '',
    lastName: coach.lastName || '',
    middleName: coach.middleName || '',
    shortName: coach.shortName || '',
    position: coach.position || '',
    birthDate: coach.birthDate ? coach.birthDate.split('T')[0] : '',
    nationality: coach.nationality || '',
    country: coach.country || '',
    city: coach.city || '',
    gender: coach.gender || '',
    photoUrl: coach.photoUrl || '',
    bio: coach.bio || '',
    isActive: coach.isActive,
    isPublished: coach.isPublished,
    selectedTeamIds: coach.teams.map((t) => t.id),
  });

  const [gallery, setGallery] = useState<string[]>(coach.gallery ? JSON.parse(coach.gallery) : []);

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/coaches/${coach.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          middleName: form.middleName || null,
          shortName: form.shortName || null,
          position: form.position || null,
          birthDate: form.birthDate || null,
          nationality: form.nationality || null,
          country: form.country || null,
          city: form.city || null,
          gender: form.gender || null,
          photoUrl: form.photoUrl || null,
          bio: form.bio || null,
          gallery: gallery.length > 0 ? JSON.stringify(gallery) : null,
          isActive: form.isActive,
          isPublished: form.isPublished,
          teamIds: form.selectedTeamIds,
        }),
      });

      if (res.ok) {
        setSuccess('Тренер обновлён');
        router.refresh();
        if (fromTeam) {
          setTimeout(() => {
            router.push(`/admin/coaches`);
          }, 500);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка при обновлении');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить тренера "${coach.lastName} ${coach.firstName}"?`)) return;
    try {
      const res = await fetch(`/api/coaches/${coach.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/coaches');
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка при удалении');
      }
    } catch {
      setError('Ошибка соединения');
    }
  };

  const toggleTeam = (teamId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTeamIds: prev.selectedTeamIds.includes(teamId)
        ? prev.selectedTeamIds.filter((id) => id !== teamId)
        : [...prev.selectedTeamIds, teamId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/coaches">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
      </div>

      <Card className="max-w-3xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            {coach.lastName} {coach.firstName} {coach.middleName || ''}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {coach.isManuallyCreated
              ? 'Создан вручную'
              : `COMET ID: ${coach.cometId || 'не указан'}`}
          </p>
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
            {/* Фото */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">Фото</label>
              <div className="flex items-start gap-4">
                <div className="h-32 w-32 flex items-center justify-center bg-white/5 overflow-hidden flex-shrink-0">
                  {form.photoUrl ? (
                    <img
                      src={form.photoUrl}
                      alt="Фото тренера"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <ImageUpload
                    value={form.photoUrl}
                    onChange={(url) => setForm({ ...form, photoUrl: url })}
                    folder="coaches"
                  />
                </div>
              </div>
            </div>

            {/* Галерея фото */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">Галерея фото</label>
              {gallery.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {gallery.map((img, index) => (
                    <div
                      key={index}
                      className="relative h-24 w-24 bg-white/5 overflow-hidden group"
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-red-400 text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ImageUpload
                value=""
                onChange={(url) => {
                  if (url) setGallery([...gallery, url]);
                }}
                folder="coaches/gallery"
              />
              <p className="text-xs text-gray-500 mt-1">
                Загрузите несколько фото для галереи тренера
              </p>
            </div>

            {/* Имя, Фамилия, Отчество */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Фамилия *</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Имя *</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Отчество</label>
                <Input
                  value={form.middleName}
                  onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            {/* Позиция, Дата рождения */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Должность</label>
                <Input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="Главный тренер"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Дата рождения</label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            {/* Гражданство, Страна, Город */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Гражданство</label>
                <Input
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="Беларусь"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Страна</label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="Беларусь"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Город</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="Брест"
                />
              </div>
            </div>

            {/* Пол */}
            <div>
              <label className="mb-1 block text-sm text-gray-400">Пол</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
              >
                <option value="">— Не указан —</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            {/* Биография */}
            <div>
              <label className="mb-1 block text-sm text-gray-400">Биография</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white min-h-[120px]"
                rows={5}
                placeholder="Информация о тренере..."
              />
            </div>

            {/* Команды */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Команды (можно выбрать несколько)
              </label>
              <div className="flex flex-wrap gap-3">
                {allTeams.map((team) => {
                  const isSelected = form.selectedTeamIds.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => toggleTeam(team.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border ${
                        isSelected
                          ? 'bg-[#ee862c]/20 border-[#ee862c] text-[#ee862c]'
                          : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {isSelected && <FontAwesomeIcon icon={faSave} className="text-xs" />}
                      {team.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Статусы */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[#ee862c]"
                />
                Активен
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4 accent-[#ee862c]"
                />
                Опубликован
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              {coach.isManuallyCreated && (
                <Button variant="destructive" type="button" onClick={handleDelete}>
                  <FontAwesomeIcon icon={faTrash} className="mr-2" /> Удалить
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
