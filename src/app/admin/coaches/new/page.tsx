// src/app/admin/coaches/new/page.tsx - Добавление тренера
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faUser } from '@fortawesome/free-solid-svg-icons';
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

export default function NewCoachPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    position: '',
    birthDate: '',
    nationality: '',
    country: '',
    city: '',
    gender: '',
    photoUrl: '',
    bio: '',
    isActive: true,
    isPublished: true,
    selectedTeamIds: [] as string[],
  });

  useEffect(() => {
    fetch('/api/teams')
      .then((r) => r.json())
      .then(setAllTeams);
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
      const res = await fetch('/api/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin/coaches');
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка при создании');
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
        <Link href="/admin/coaches">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">Добавить тренера</h1>
      </div>

      <Card className="max-w-3xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Новый тренер</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-gray-400">Фото</label>
              <div className="flex items-start gap-4">
                <div className="h-32 w-32 flex items-center justify-center bg-white/5 overflow-hidden">
                  {form.photoUrl ? (
                    <img src={form.photoUrl} alt="" className="h-full w-full object-cover" />
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

            <div>
              <label className="mb-2 block text-sm text-gray-400">Команды</label>
              <div className="flex flex-wrap gap-3">
                {allTeams.map((team) => {
                  const isSelected = form.selectedTeamIds.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => toggleTeam(team.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border ${isSelected ? 'bg-[#ee862c]/20 border-[#ee862c] text-[#ee862c]' : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}
                    >
                      {team.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Добавить тренера
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
