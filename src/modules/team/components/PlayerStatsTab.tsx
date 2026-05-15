// src/modules/team/components/PlayerStatsTab.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faClock, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface PlayerStatsData {
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

const RESULT_LABELS: Record<string, string> = { W: 'Победа', D: 'Ничья', L: 'Поражение' };
const RESULT_COLORS: Record<string, string> = {
  W: 'text-green-400',
  D: 'text-gray-400',
  L: 'text-red-400',
};

export default function PlayerStatsTab({
  playerId,
  cometId,
}: {
  playerId: string;
  cometId: string | null;
}) {
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/players/${playerId}/stats`);
      const data = await res.json();
      if (data.success) setStats(data);
      else setError(data.error || 'Ошибка загрузки');
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <FontAwesomeIcon icon={faChartBar} className="text-[#ee862c]" /> Статистика игрока
        </CardTitle>
        <button
          onClick={loadStats}
          disabled={loading}
          className="text-xs text-[#ee862c] hover:underline mt-2"
        >
          {loading ? 'Загрузка...' : 'Обновить'}
        </button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : stats ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Общая статистика</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Матчей" value={stats.totals.appearances} />
                <StatCard label="Голов" value={stats.totals.goals} color="text-green-400" />
                <StatCard label="Минут" value={stats.totals.minutesPlayed} icon={faClock} />
                <StatCard label="В старте" value={stats.totals.startedMatches} />
                <StatCard label="На замену" value={stats.totals.subAppearances} />
                <StatCard label="Жёлтых" value={stats.totals.yellowCards} color="text-yellow-400" />
                <StatCard label="Красных" value={stats.totals.redCards} color="text-red-400" />
              </div>
            </div>

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
                        <td className="p-3 text-xs text-gray-400 text-center">{app.shirtNumber}</td>
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
            {cometId
              ? 'Нажмите «Обновить» для загрузки статистики'
              : 'Статистика доступна только для игроков из COMET'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
