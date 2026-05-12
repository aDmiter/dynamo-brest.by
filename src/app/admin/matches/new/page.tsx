// src/app/admin/matches/new/page.tsx - Добавление матча
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface OpponentTeam {
  id: string;
  cometId: number | null;
  name: string;
  logoUrl: string | null;
}

interface Team {
  id: string;
  name: string;
  slug: string;
}

export default function NewMatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get('teamSlug') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ourTeams, setOurTeams] = useState<Team[]>([]);
  const [opponents, setOpponents] = useState<OpponentTeam[]>([]);
  const [opponentSearch, setOpponentSearch] = useState('');
  const [showOpponentSearch, setShowOpponentSearch] = useState(false);

  const [form, setForm] = useState({
    teamSlug: preselectedSlug,
    isHome: true,
    opponentId: '',
    opponentName: '',
    matchDate: new Date().toISOString().slice(0, 16),
    stadium: '',
    tournament: 'Товарищеский матч',
    round: '',
  });

  useEffect(() => {
    fetch('/api/teams')
      .then((r) => r.json())
      .then(setOurTeams);
    fetch('/api/opponent-teams?limit=200')
      .then((r) => r.json())
      .then((d) => setOpponents(d.teams || []));
  }, []);

  const filteredOpponents = opponentSearch
    ? opponents.filter((o) => o.name.toLowerCase().includes(opponentSearch.toLowerCase()))
    : opponents;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const selectedTeam = ourTeams.find((t) => t.slug === form.teamSlug);
    const opponent = opponents.find((o) => o.id === form.opponentId);

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamSlug: form.teamSlug,
          isHome: form.isHome,
          homeTeam: form.isHome
            ? selectedTeam?.name || 'Динамо-Брест'
            : opponent?.name || form.opponentName,
          awayTeam: form.isHome
            ? opponent?.name || form.opponentName
            : selectedTeam?.name || 'Динамо-Брест',
          homeTeamId: form.isHome ? null : opponent?.cometId || null,
          awayTeamId: form.isHome ? opponent?.cometId || null : null,
          matchDate: new Date(form.matchDate).toISOString(),
          stadium: form.stadium || null,
          tournament: form.tournament || null,
          round: form.round || null,
          status: 'scheduled',
          matchType:
            preselectedSlug === 'osnovnoy-sostav'
              ? 'osnova'
              : preselectedSlug === 'dubliruyushchiy-sostav'
                ? 'dubl'
                : 'women',
        }),
      });

      if (res.ok) {
        router.push(`/admin/matches/calendar/${form.teamSlug}`);
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
        <Link href={`/admin/matches/calendar/${preselectedSlug || 'osnovnoy-sostav'}`}>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Назад
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Команда</label>
              <select
                value={form.teamSlug}
                onChange={(e) => setForm({ ...form, teamSlug: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
                required
              >
                {ourTeams.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400">Дома</label>
              <input
                type="checkbox"
                checked={form.isHome}
                onChange={(e) => setForm({ ...form, isHome: e.target.checked })}
                className="accent-[#ee862c] h-4 w-4"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Соперник</label>
              {showOpponentSearch ? (
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
                  />
                  <Input
                    value={opponentSearch}
                    onChange={(e) => setOpponentSearch(e.target.value)}
                    placeholder="Поиск клуба..."
                    className="border-white/10 bg-white/5 pl-8 text-white text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowOpponentSearch(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  {opponentSearch && (
                    <div className="absolute z-10 top-full left-0 right-0 border border-white/10 bg-[#1a1f2e] max-h-40 overflow-y-auto">
                      {filteredOpponents.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, opponentId: o.id, opponentName: o.name });
                            setOpponentSearch('');
                            setShowOpponentSearch(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10"
                        >
                          {o.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={
                      form.opponentId
                        ? opponents.find((o) => o.id === form.opponentId)?.name || form.opponentName
                        : form.opponentName
                    }
                    placeholder="Название соперника"
                    onChange={(e) =>
                      setForm({ ...form, opponentId: '', opponentName: e.target.value })
                    }
                    className="border-white/10 bg-white/5 text-white text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpponentSearch(true)}
                    className="text-xs text-[#ee862c] hover:underline whitespace-nowrap"
                  >
                    Выбрать из клубов
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Дата и время</label>
              <Input
                type="datetime-local"
                value={form.matchDate}
                onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Турнир</label>
              <Input
                value={form.tournament}
                onChange={(e) => setForm({ ...form, tournament: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Тур</label>
                <Input
                  value={form.round}
                  onChange={(e) => setForm({ ...form, round: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Стадион</label>
                <Input
                  value={form.stadium}
                  onChange={(e) => setForm({ ...form, stadium: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? '...' : 'Добавить матч'}
              </Button>
              <Link href={`/admin/matches/calendar/${preselectedSlug || 'osnovnoy-sostav'}`}>
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
