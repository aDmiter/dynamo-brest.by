// src/app/admin/players/edit/[id]/EditPlayerForm.tsx - Форма редактирования игрока
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faArrowLeft,
  faTrash,
  faUser,
  faTimes,
  faChartBar,
  faFutbol,
  faClock,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
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

interface PlayerData {
  id: string;
  cometId: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  shortName: string | null;
  number: number | null;
  position: string | null;
  birthDate: string | null;
  nationality: string | null;
  country: string | null;
  city: string | null;
  gender: string | null;
  level: string | null;
  height: number | null;
  weight: number | null;
  photoUrl: string | null;
  bio: string | null;
  gallery: string | null;
  isActive: boolean;
  isPublished: boolean;
  isManuallyCreated: boolean;
  teams: Team[];
}

interface Props {
  player: PlayerData;
  allTeams: Team[];
}

interface AppearanceStats {
  date: string;
  match: string;
  competition: string;
  round: string;
  shirtNumber: number;
  startingLineup: boolean;
  played: boolean;
  goals: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  result: string;
}

interface PlayerStats {
  totals: {
    appearances: number;
    goals: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    startedMatches: number;
    subAppearances: number;
  };
  byCompetition: Record<
    string,
    {
      appearances: number;
      goals: number;
      yellowCards: number;
      redCards: number;
      minutesPlayed: number;
      startedMatches: number;
      subAppearances: number;
    }
  >;
  appearances: AppearanceStats[];
}

const POSITIONS = ['Вратарь', 'Защитник', 'Полузащитник', 'Нападающий'];

const LEVELS = [
  { value: 'professional', label: 'Профессионал' },
  { value: 'amateur', label: 'Любитель' },
];

const GENDERS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];

const RESULT_LABELS: Record<string, string> = {
  W: 'Победа',
  D: 'Ничья',
  L: 'Поражение',
};

const RESULT_COLORS: Record<string, string> = {
  W: 'text-green-400',
  D: 'text-gray-400',
  L: 'text-red-400',
};

export default function EditPlayerForm({ player, allTeams }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromTeam = searchParams.get('from');
  const [activeTab, setActiveTab] = useState<'main' | 'stats'>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Статистика
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  const [form, setForm] = useState({
    firstName: player.firstName || '',
    lastName: player.lastName || '',
    middleName: player.middleName || '',
    shortName: player.shortName || '',
    number: player.number?.toString() || '',
    position: player.position || '',
    birthDate: player.birthDate ? player.birthDate.split('T')[0] : '',
    nationality: player.nationality || '',
    country: player.country || '',
    city: player.city || '',
    gender: player.gender || '',
    level: player.level || '',
    height: player.height?.toString() || '',
    weight: player.weight?.toString() || '',
    photoUrl: player.photoUrl || '',
    bio: player.bio || '',
    isActive: player.isActive,
    isPublished: player.isPublished,
    selectedTeamIds: player.teams.map((t) => t.id),
  });

  const [gallery, setGallery] = useState<string[]>(
    player.gallery ? JSON.parse(player.gallery) : []
  );

  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await fetch(`/api/players/${player.id}/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data);
      } else {
        setStatsError(data.error || 'Ошибка загрузки статистики');
      }
    } catch {
      setStatsError('Ошибка соединения');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleStatsTabClick = () => {
    setActiveTab('stats');
    if (player.cometId && !stats && !statsLoading) {
      loadStats();
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
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
          gallery: gallery.length > 0 ? JSON.stringify(gallery) : null,
          isActive: form.isActive,
          isPublished: form.isPublished,
          teamIds: form.selectedTeamIds,
        }),
      });

      if (res.ok) {
        setSuccess('Игрок обновлён');
        router.refresh();
        if (fromTeam) {
          setTimeout(() => {
            router.push(`/admin/players/${fromTeam}`);
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
    if (!confirm(`Удалить игрока "${player.lastName} ${player.firstName}"?`)) return;
    try {
      const res = await fetch(`/api/players/${player.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (fromTeam) {
          router.push(`/admin/players/${fromTeam}`);
        } else {
          router.push('/admin/players');
        }
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

  const backUrl = fromTeam ? `/admin/players/${fromTeam}` : '/admin/players';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={backUrl}>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
      </div>

      {/* Табы */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-0">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'main'
              ? 'border-[#ee862c] text-[#ee862c]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FontAwesomeIcon icon={faUser} className="mr-2" />
          Основное
        </button>
        <button
          onClick={handleStatsTabClick}
          className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stats'
              ? 'border-[#ee862c] text-[#ee862c]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FontAwesomeIcon icon={faChartBar} className="mr-2" />
          Статистика
        </button>
      </div>

      {/* Вкладка Основное */}
      {activeTab === 'main' && (
        <Card className="max-w-3xl border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {player.lastName} {player.firstName} {player.middleName || ''}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {player.isManuallyCreated
                ? 'Создан вручную'
                : `COMET ID: ${player.cometId || 'не указан'}`}
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
                        alt="Фото игрока"
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
                      folder="players"
                    />
                    {player.photoUrl && player.photoUrl !== form.photoUrl && (
                      <p className="text-xs text-gray-500 mt-2">
                        Фото из COMET будет заменено при сохранении
                      </p>
                    )}
                    {!player.photoUrl && form.photoUrl && (
                      <p className="text-xs text-green-500 mt-2">Фото загружено вручную</p>
                    )}
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
                  folder="players/gallery"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Загрузите несколько фото для галереи игрока
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

              {/* Команды — toggler'ы */}
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
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ee862c] hover:bg-[#f0ac74]"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
                {player.isManuallyCreated && (
                  <Button variant="destructive" type="button" onClick={handleDelete}>
                    <FontAwesomeIcon icon={faTrash} className="mr-2" /> Удалить
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Вкладка Статистика */}
      {activeTab === 'stats' && (
        <Card className="max-w-4xl border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <FontAwesomeIcon icon={faChartBar} className="text-[#ee862c]" />
              Статистика игрока
            </CardTitle>
            <button
              onClick={loadStats}
              disabled={statsLoading}
              className="text-xs text-[#ee862c] hover:underline mt-2"
            >
              {statsLoading ? 'Загрузка...' : 'Обновить'}
            </button>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-center py-8 text-gray-400">Загрузка статистики...</div>
            ) : statsError ? (
              <div className="text-center py-8 text-red-400">{statsError}</div>
            ) : stats ? (
              <div className="space-y-8">
                {/* Общие показатели */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Общая статистика</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Матчей" value={stats.totals.appearances} />
                    <StatCard label="Голов" value={stats.totals.goals} color="text-green-400" />
                    <StatCard label="Минут" value={stats.totals.minutesPlayed} icon={faClock} />
                    <StatCard label="В старте" value={stats.totals.startedMatches} />
                    <StatCard label="На замену" value={stats.totals.subAppearances} />
                    <StatCard
                      label="Жёлтых"
                      value={stats.totals.yellowCards}
                      color="text-yellow-400"
                    />
                    <StatCard label="Красных" value={stats.totals.redCards} color="text-red-400" />
                  </div>
                </div>

                {/* По турнирам */}
                {Object.keys(stats.byCompetition).length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">По турнирам</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.byCompetition).map(([comp, data]) => (
                        <div key={comp} className="border border-white/10 bg-white/[0.03] p-4">
                          <h4 className="text-sm font-bold text-[#ee862c] mb-3">{comp}</h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                            <div className="text-gray-400">
                              Матчей: <span className="text-white">{data.appearances}</span>
                            </div>
                            <div className="text-gray-400">
                              Голов: <span className="text-green-400">{data.goals}</span>
                            </div>
                            <div className="text-gray-400">
                              Минут: <span className="text-white">{data.minutesPlayed}</span>
                            </div>
                            <div className="text-gray-400">
                              В старте: <span className="text-white">{data.startedMatches}</span>
                            </div>
                            <div className="text-gray-400">
                              ЖК: <span className="text-yellow-400">{data.yellowCards}</span>
                            </div>
                            <div className="text-gray-400">
                              КК: <span className="text-red-400">{data.redCards}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Таблица матчей */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Матчи</h3>
                  <div className="border border-white/10 overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr>
                          <th className="p-3 text-left text-xs text-gray-400">Дата</th>
                          <th className="p-3 text-left text-xs text-gray-400">Матч</th>
                          <th className="p-3 text-left text-xs text-gray-400">Турнир</th>
                          <th className="p-3 text-center text-xs text-gray-400">№</th>
                          <th className="p-3 text-center text-xs text-gray-400">Старт</th>
                          <th className="p-3 text-center text-xs text-gray-400">Голы</th>
                          <th className="p-3 text-center text-xs text-gray-400">ЖК</th>
                          <th className="p-3 text-center text-xs text-gray-400">КК</th>
                          <th className="p-3 text-center text-xs text-gray-400">Минуты</th>
                          <th className="p-3 text-center text-xs text-gray-400">Результат</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.appearances.map((app, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-3 text-xs text-gray-400">
                              {new Date(Number(app.date)).toLocaleDateString('ru-RU')}
                            </td>
                            <td className="p-3 text-xs text-white">{app.match}</td>
                            <td className="p-3 text-xs text-gray-400">{app.competition}</td>
                            <td className="p-3 text-xs text-gray-400 text-center">
                              {app.shirtNumber}
                            </td>
                            <td className="p-3 text-center">
                              {app.startingLineup ? (
                                <span className="text-xs text-green-400">Да</span>
                              ) : (
                                <span className="text-xs text-gray-500">Замена</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`text-xs font-bold ${app.goals > 0 ? 'text-green-400' : 'text-gray-600'}`}
                              >
                                {app.goals}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`text-xs ${app.yellowCards > 0 ? 'text-yellow-400' : 'text-gray-600'}`}
                              >
                                {app.yellowCards}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`text-xs ${app.redCards > 0 ? 'text-red-400' : 'text-gray-600'}`}
                              >
                                {app.redCards}
                              </span>
                            </td>
                            <td className="p-3 text-center text-xs text-gray-400">
                              {app.minutesPlayed}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`text-xs font-bold ${RESULT_COLORS[app.result] || 'text-gray-400'}`}
                              >
                                {RESULT_LABELS[app.result] || app.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {player.cometId
                  ? 'Нажмите «Обновить» для загрузки статистики'
                  : 'Статистика доступна только для игроков из COMET'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Карточка статистики
function StatCard({
  label,
  value,
  color = 'text-white',
  icon,
}: {
  label: string;
  value: number;
  color?: string;
  icon?: IconDefinition;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-4 text-center">
      <div
        className={`text-2xl font-black ${color}`}
        style={{ fontFamily: "'Inter Tight', sans-serif" }}
      >
        {icon && <FontAwesomeIcon icon={icon} className="mr-1 text-sm" />}
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
