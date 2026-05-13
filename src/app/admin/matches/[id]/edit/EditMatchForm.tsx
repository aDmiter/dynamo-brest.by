// src/app/admin/matches/[id]/edit/EditMatchForm.tsx - Форма редактирования матча
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { formatLocalDateTime, toUTCString } from '@/lib/date-utils';

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface Opponent {
  id: string;
  cometId: number | null;
  name: string;
}

interface MatchData {
  id: string;
  teamId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  stadium: string | null;
  tournament: string | null;
  round: string | null;
  status: string;
  isHome: boolean;
  matchType: string | null;
  attendance: number | null;
}

export default function EditMatchForm({
  match,
  teams,
  opponents,
}: {
  match: MatchData;
  teams: Team[];
  opponents: Opponent[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore: match.homeScore?.toString() || '',
    awayScore: match.awayScore?.toString() || '',
    matchDate: formatLocalDateTime(match.matchDate), // Исправлено: локальное время
    stadium: match.stadium || '',
    tournament: match.tournament || '',
    round: match.round || '',
    status: match.status,
    isHome: match.isHome,
    matchType: match.matchType || '',
    attendance: match.attendance?.toString() || '',
    teamId: match.teamId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      homeTeam: form.homeTeam,
      awayTeam: form.awayTeam,
      homeScore: form.homeScore ? parseInt(form.homeScore) : null,
      awayScore: form.awayScore ? parseInt(form.awayScore) : null,
      matchDate: toUTCString(form.matchDate), // Исправлено: конвертируем в UTC для API
      stadium: form.stadium || null,
      tournament: form.tournament || null,
      round: form.round || null,
      status: form.status,
      isHome: form.isHome,
      matchType: form.matchType || null,
      attendance: form.attendance ? parseInt(form.attendance) : null,
      teamId: form.teamId,
    };

    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Матч обновлён');
        router.refresh();
      } else {
        setError(data.error || 'Ошибка при обновлении');
      }
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить матч?')) return;
    try {
      const response = await fetch(`/api/matches/${match.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/admin/matches/calendar/osnovnoy-sostav');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при удалении');
      }
    } catch {
      setError('Ошибка соединения');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/matches/calendar/osnovnoy-sostav">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            {match.homeTeam} vs {match.awayTeam}
          </CardTitle>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Хозяева</label>
                <Input
                  value={form.homeTeam}
                  onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Гости</label>
                <Input
                  value={form.awayTeam}
                  onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Голы хозяев</label>
                <Input
                  type="number"
                  value={form.homeScore}
                  onChange={(e) => setForm({ ...form, homeScore: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="—"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Голы гостей</label>
                <Input
                  type="number"
                  value={form.awayScore}
                  onChange={(e) => setForm({ ...form, awayScore: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="—"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Зрители</label>
                <Input
                  type="number"
                  value={form.attendance}
                  onChange={(e) => setForm({ ...form, attendance: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Дата и время</label>
              <Input
                type="datetime-local"
                value={form.matchDate}
                onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Турнир</label>
                <Input
                  value={form.tournament}
                  onChange={(e) => setForm({ ...form, tournament: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Тур</label>
                <Input
                  value={form.round}
                  onChange={(e) => setForm({ ...form, round: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Стадион</label>
                <Input
                  value={form.stadium}
                  onChange={(e) => setForm({ ...form, stadium: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Статус</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
                >
                  <option value="scheduled">Запланирован</option>
                  <option value="finished">Завершён</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={form.isHome}
                  onChange={(e) => setForm({ ...form, isHome: e.target.checked })}
                  className="accent-[#ee862c]"
                />
                Домашний матч
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
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
    </div>
  );
}
