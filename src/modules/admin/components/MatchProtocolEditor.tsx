'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSave,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import ProtocolAssistIcon from '@/modules/team/components/matches/ProtocolAssistIcon';
import ProtocolGoalIcon from '@/modules/team/components/matches/ProtocolGoalIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  AdminProtocolGoal,
  AdminProtocolLineup,
  AdminProtocolPayload,
} from '@/lib/match-protocol-admin';

interface Props {
  matchId: string;
}

type GoalDraft = {
  key: string;
  id?: string;
  minute: string;
  scorerPersonCometId: string;
  assistPersonCometId: string;
};

function newGoalKey() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function goalToDraft(g: AdminProtocolGoal): GoalDraft {
  return {
    key: g.id,
    id: g.id.startsWith('lineup-') ? undefined : g.id,
    minute: g.displayMinute?.replace(/'$/, '') ?? (g.minute != null ? String(g.minute) : ''),
    scorerPersonCometId: g.scorerPersonCometId ?? '',
    assistPersonCometId: g.assistPersonCometId ?? '',
  };
}

function LineupTable({
  rows,
  title,
  onUpdate,
}: {
  rows: AdminProtocolLineup[];
  title: string;
  onUpdate: (id: string, patch: Partial<AdminProtocolLineup>) => void;
}) {
  if (rows.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#ee862c]">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
              <th className="pb-2 pr-2">№</th>
              <th className="pb-2 pr-2">Игрок</th>
              <th className="pb-2 pr-2">Мин</th>
              <th className="pb-2 pr-2">ЖК</th>
              <th className="pb-2 pr-2">КК</th>
              <th className="pb-2">На поле</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    className="h-8 w-14 border-white/10 bg-white/5 text-white"
                    value={row.shirtNumber ?? ''}
                    onChange={(e) =>
                      onUpdate(row.id, {
                        shirtNumber: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                  />
                </td>
                <td className="py-2 pr-2 text-white">{row.personName}</td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    className="h-8 w-16 border-white/10 bg-white/5 text-white"
                    value={row.minutesPlayed ?? ''}
                    onChange={(e) =>
                      onUpdate(row.id, {
                        minutesPlayed: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-14 border-white/10 bg-white/5 text-white"
                    value={row.yellowCards}
                    onChange={(e) =>
                      onUpdate(row.id, { yellowCards: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-14 border-white/10 bg-white/5 text-white"
                    value={row.redCards}
                    onChange={(e) =>
                      onUpdate(row.id, { redCards: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </td>
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={row.played}
                    onChange={(e) => onUpdate(row.id, { played: e.target.checked })}
                    className="accent-[#ee862c]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MatchProtocolEditor({ matchId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lineups, setLineups] = useState<AdminProtocolLineup[]>([]);
  const [goals, setGoals] = useState<GoalDraft[]>([]);
  const [hasProtocol, setHasProtocol] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/matches/${matchId}/protocol`);
      const data = (await res.json()) as AdminProtocolPayload & { error?: string };
      if (!res.ok) {
        setError(data.error || 'Не удалось загрузить протокол');
        return;
      }
      setLineups(data.lineups);
      setGoals(data.goals.map(goalToDraft));
      setHasProtocol(data.hasProtocol);
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  const playerOptions = lineups.map((p) => ({
    value: p.personCometId,
    label: `${p.shirtNumber != null ? `${p.shirtNumber} ` : ''}${p.personName}`,
  }));

  const updateLineup = (id: string, patch: Partial<AdminProtocolLineup>) => {
    setLineups((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addGoal = () => {
    const first = lineups[0]?.personCometId ?? '';
    setGoals((g) => [
      ...g,
      { key: newGoalKey(), minute: '', scorerPersonCometId: first, assistPersonCometId: '' },
    ]);
  };

  const updateGoal = (key: string, patch: Partial<GoalDraft>) => {
    setGoals((rows) => rows.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  };

  const removeGoal = (key: string) => {
    setGoals((rows) => rows.filter((g) => g.key !== key));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        lineups: lineups.map((r) => ({
          id: r.id,
          yellowCards: r.yellowCards,
          redCards: r.redCards,
          minutesPlayed: r.minutesPlayed,
          played: r.played,
          startingLineup: r.startingLineup,
          shirtNumber: r.shirtNumber,
        })),
        goals: goals
          .filter((g) => g.scorerPersonCometId)
          .map((g) => {
            const trimmed = g.minute.trim();
            const parsed = trimmed ? parseInt(trimmed, 10) : null;
            const minute = parsed != null && !Number.isNaN(parsed) ? parsed : null;
            const displayMinute =
              trimmed && (parsed == null || Number.isNaN(parsed)) ? trimmed : null;
            return {
              id: g.id,
              minute,
              displayMinute,
              scorerPersonCometId: g.scorerPersonCometId,
              assistPersonCometId: g.assistPersonCometId || null,
            };
          }),
      };

      const res = await fetch(`/api/admin/matches/${matchId}/protocol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let data: AdminProtocolPayload & { error?: string };
      try {
        data = await res.json();
      } catch {
        setError(res.status === 500 ? 'Ошибка сервера при сохранении' : 'Ошибка соединения');
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Ошибка сохранения');
        return;
      }
      setLineups(data.lineups);
      setGoals(data.goals.map(goalToDraft));
      setHasProtocol(data.hasProtocol);
      setSuccess('Протокол сохранён');
    } catch {
      setError('Ошибка соединения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="py-8 text-center text-gray-400">Загрузка протокола…</CardContent>
      </Card>
    );
  }

  if (!hasProtocol) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Протокол матча</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-400">
          Состав и события ещё не синхронизированы из COMET. Запустите синхронизацию протоколов или
          дождитесь автоматической загрузки.
        </CardContent>
      </Card>
    );
  }

  const starters = lineups.filter((r) => r.startingLineup);
  const subs = lineups.filter((r) => !r.startingLineup);
  const previewGoals = goals.filter((g) => g.scorerPersonCometId).length;
  const previewAssists = goals.filter((g) => g.assistPersonCometId).length;

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void handleSave();
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <form id="match-protocol-form" onSubmit={onFormSubmit} noValidate>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-white">Протокол матча</CardTitle>
          <Button type="submit" disabled={saving} className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {saving ? 'Сохранение…' : 'Сохранить протокол'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
        {error && (
          <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#ee862c]">Голы</h3>
          <p className="mb-3 text-xs text-gray-500">
            Укажите автора гола и при необходимости ассистента. Счётчики у игроков обновятся при
            сохранении.
          </p>
          <div className="space-y-2">
            {goals.length === 0 && (
              <p className="text-sm text-gray-500">Голов пока нет — добавьте вручную.</p>
            )}
            {goals.map((g) => (
              <div key={g.key} className="flex flex-wrap items-center gap-2">
                <ProtocolGoalIcon className="h-[1.05rem] w-[1.05rem] shrink-0 text-[#ee862c]" />
                <Input
                  placeholder="Мин"
                  className="h-9 w-20 border-white/10 bg-white/5 text-white"
                  value={g.minute}
                  onChange={(e) => updateGoal(g.key, { minute: e.target.value })}
                />
                <select
                  className="h-9 min-w-[180px] flex-1 rounded-md border border-white/10 bg-[#0D1225] px-2 text-sm text-white"
                  value={g.scorerPersonCometId}
                  onChange={(e) => updateGoal(g.key, { scorerPersonCometId: e.target.value })}
                >
                  <option value="">Автор гола</option>
                  {playerOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ProtocolAssistIcon className="h-[1.05rem] w-[1.05rem] shrink-0 text-gray-400" />
                <select
                  className="h-9 min-w-[180px] flex-1 rounded-md border border-white/10 bg-[#0D1225] px-2 text-sm text-white"
                  value={g.assistPersonCometId}
                  onChange={(e) => updateGoal(g.key, { assistPersonCometId: e.target.value })}
                >
                  <option value="">Без передачи</option>
                  {playerOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => removeGoal(g.key)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 border-white/10 text-gray-300"
            onClick={addGoal}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить гол
          </Button>
        </section>

        <LineupTable rows={starters} title="Стартовый состав" onUpdate={updateLineup} />
        <LineupTable rows={subs} title="Запасные" onUpdate={updateLineup} />

        <p className="text-xs text-gray-500">
          В списке голов: {previewGoals} гол(ов), {previewAssists} передач(и) — будет записано при
          сохранении.
        </p>
        </CardContent>
      </form>
    </Card>
  );
}
