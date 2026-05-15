// src/app/admin/matches/new/page.tsx - Добавление матча
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

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

export default function NewMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [allOpponents, setAllOpponents] = useState<Opponent[]>([]);
  const [filteredOpponents, setFilteredOpponents] = useState<Opponent[]>([]);
  const [showOpponentSearch, setShowOpponentSearch] = useState(false);

  const [form, setForm] = useState({
    isHome: true,
    opponentId: '',
    opponentName: '',
    matchDate: '',
    tournament: '',
    round: '',
    stadium: '',
    teamId: '',
    ticketUrl: '',
  });

  useEffect(() => {
    fetch('/api/teams')
      .then((r) => r.json())
      .then((data) => {
        setTeams(data);
        if (data.length > 0) setForm((f) => ({ ...f, teamId: data[0].id }));
      });
    fetch('/api/opponent-teams?limit=1000')
      .then((r) => r.json())
      .then((data) => setAllOpponents(data.teams || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isHome: form.isHome,
          homeTeam: form.isHome ? 'Динамо-Брест' : form.opponentName,
          awayTeam: form.isHome ? form.opponentName : 'Динамо-Брест',
          matchDate: new Date(form.matchDate).toISOString(),
          stadium: form.stadium || null,
          tournament: form.tournament || null,
          round: form.round || null,
          teamId: form.teamId,
          ticketUrl: form.ticketUrl || null,
        }),
      });

      if (res.ok) {
        router.push('/admin/matches');
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/matches">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">Добавить матч</h1>
      </div>

      <Card className="max-w-2xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Новый матч</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isHome}
                  onChange={(e) => setForm({ ...form, isHome: e.target.checked })}
                  className="accent-[#ee862c] h-4 w-4"
                />
                Домашний матч
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Соперник</label>
              <div className="flex items-center gap-2">
                <Input
                  value={form.opponentName}
                  onChange={(e) =>
                    setForm({ ...form, opponentId: '', opponentName: e.target.value })
                  }
                  className="border-white/10 bg-white/5 text-white flex-1"
                  placeholder="Название соперника"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Дата и время *</label>
              <Input
                type="datetime-local"
                value={form.matchDate}
                onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Турнир</label>
                <Input
                  value={form.tournament}
                  onChange={(e) => setForm({ ...form, tournament: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Тур</label>
                <Input
                  value={form.round}
                  onChange={(e) => setForm({ ...form, round: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Стадион</label>
              <Input
                value={form.stadium}
                onChange={(e) => setForm({ ...form, stadium: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Ссылка на билеты</label>
              <Input
                value={form.ticketUrl}
                onChange={(e) => setForm({ ...form, ticketUrl: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
                placeholder="https://tickets.by/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Если указана — кнопка «Билеты» появится на сайте
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Link href="/admin/matches">
                <Button
                  variant="outline"
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
