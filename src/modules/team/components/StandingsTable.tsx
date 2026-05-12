// src/modules/team/components/StandingsTable.tsx
'use client';

import { useState, useEffect } from 'react';

interface TeamStanding {
  position: number;
  club: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

const DYNAMO_BREST_NAME = 'Динамо-Брест';

export default function StandingsTable() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/team/standings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStandings(data.standings);
        } else {
          setError(data.error || 'Ошибка загрузки');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Standings fetch error:', err);
        setError('Не удалось загрузить турнирную таблицу');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-400 text-lg">Загрузка турнирной таблицы...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#151b26] border border-white/10">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[#242C41] border-b border-white/10">
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-12">
              #
            </th>
            <th className="py-3 px-4 text-left text-sm font-bold text-[#ee862c] uppercase tracking-wider">
              Команда
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-12">
              И
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-10">
              В
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-10">
              Н
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-10">
              П
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-12">
              ЗМ
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-12">
              ПМ
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-12">
              ±
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-[#ee862c] uppercase tracking-wider w-12">
              О
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => {
            const isDynamo = team.club === DYNAMO_BREST_NAME;
            return (
              <tr
                key={team.position}
                className={`border-b border-white/5 transition-colors ${
                  isDynamo ? 'bg-[#ee862c]/10 hover:bg-[#ee862c]/20' : 'hover:bg-white/5'
                }`}
              >
                <td
                  className={`py-3 px-4 text-center font-bold ${
                    isDynamo ? 'text-[#ee862c]' : 'text-gray-400'
                  }`}
                >
                  {team.position}
                </td>
                <td
                  className={`py-3 px-4 text-left font-medium ${
                    isDynamo ? 'text-white font-bold' : 'text-gray-200'
                  }`}
                >
                  {team.club}
                </td>
                <td className="py-3 px-4 text-center text-gray-300">{team.matches}</td>
                <td className="py-3 px-4 text-center text-green-400">{team.wins}</td>
                <td className="py-3 px-4 text-center text-gray-400">{team.draws}</td>
                <td className="py-3 px-4 text-center text-red-400">{team.losses}</td>
                <td className="py-3 px-4 text-center text-gray-300">{team.goalsFor}</td>
                <td className="py-3 px-4 text-center text-gray-300">{team.goalsAgainst}</td>
                <td
                  className={`py-3 px-4 text-center font-mono text-sm ${
                    team.goalDifference > 0
                      ? 'text-green-400'
                      : team.goalDifference < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                  }`}
                >
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </td>
                <td className="py-3 px-4 text-center font-bold text-white">{team.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
