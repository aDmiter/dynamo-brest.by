// src/app/admin/players/new/page.tsx - Ручное добавление игрока
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faUser } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  slug: string;
}

// Список позиций
const POSITIONS = ['Вратарь', 'Защитник', 'Полузащитник', 'Нападающий'];

// Уровни
const LEVELS = [
  { value: 'professional', label: 'Профессионал' },
  { value: 'amateur', label: 'Любитель' },
];

// Пол
const GENDERS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];

export default function NewPlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    shortName: '',
    number: '',
    position: '',
    birthDate: '',
    nationality: '',
    country: '',
    city: '',
    gender: '',
    level: '',
    height: '',
    weight: '',
    photoUrl: '',
    bio: '',
    isActive: true,
    isPublished: true,
    selectedTeamIds: [] as string[],
  });

  // Загружаем список команд
  useEffect(() => {
    fetch('/api/teams')
      .then((r) => r.json())
      .then((data) => setAllTeams(data))
      .catch(console.error);
  }, []);

  const toggleTeam = (teamId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTeamIds: prev.selectedTeamIds.includes(teamId)
        ? prev.selectedTeamIds.filter((id) => id !== teamId)
        : [...prev.selectedTeamIds, teamId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.lastName || !form.firstName) {
      setError('Фамилия и Имя обязательны');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastName: form.lastName,
          firstName: form.firstName,
          middleName: form.middleName || null,
          shortName: form.shortName || null,
          number: form.number ? parseInt(form.number) : null,
          position: form.position || null,
          birthDate: form.birthDate || null,
          nationality: form.nationality || null,
          country: form.country || null,
          city: form.city || null,
          gender: form.gender || null,
          level: form.level || null,
          height: form.height ? parseInt(form.height) : null,
          weight: form.weight ? parseInt(form.weight) : null,
          photoUrl: form.photoUrl || null,
          bio: form.bio || null,
          isActive: form.isActive,
          isPublished: form.isPublished,
          teamIds: form.selectedTeamIds,
        }),
      });

      if (res.ok) {
        router.push('/admin/players');
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка при создании игрока');
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
        <Link href="/admin/players">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">Добавить игрока вручную</h1>
      </div>

      <Card className="max-w-3xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Новый игрок</CardTitle>
          <p className="text-sm text-gray-500">
            Игрок будет создан с пометкой «создан вручную» и не будет затронут при синхронизации с
            COMET.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
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
                      alt="Фото игрока"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    value={form.photoUrl}
                    onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                    placeholder="URL фото"
                    className="border-white/10 bg-white/5 text-white mb-2"
                  />
                  <p className="text-xs text-gray-500">Вставьте ссылку на фото игрока.</p>
                </div>
              </div>
            </div>

            {/* Фамилия, Имя, Отчество */}
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

            {/* Игровой номер, Позиция, Дата рождения */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Игровой номер</label>
                <Input
                  type="number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  min="1"
                  max="99"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Позиция</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
                >
                  <option value="">— Выберите —</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
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

            {/* Уровень, Пол */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Уровень</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
                >
                  <option value="">— Не указан —</option>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Пол</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
                >
                  <option value="">— Не указан —</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
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

            {/* Рост, Вес */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Рост (см)</label>
                <Input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="185"
                  min="100"
                  max="250"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Вес (кг)</label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="80"
                  min="30"
                  max="150"
                />
              </div>
            </div>

            {/* Биография */}
            <div>
              <label className="mb-1 block text-sm text-gray-400">Биография</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white min-h-[80px]"
                rows={3}
                placeholder="Информация о игроке..."
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
                      {team.name}
                    </button>
                  );
                })}
              </div>
              {allTeams.length === 0 && (
                <p className="text-xs text-gray-500">
                  Команды не найдены. Создайте команду в разделе «Команды».
                </p>
              )}
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
                {loading ? 'Сохранение...' : 'Добавить игрока'}
              </Button>
              <Link href="/admin/players">
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
