// src/modules/team/components/StandingsTable.tsx - Турнирная таблица
'use client';

import { useState, useEffect } from 'react';

interface TeamStanding {
  position: number;
  club: string;
  clubId: number;
  logoUrl: string | null;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface Props {
  cometId: string;
}

const OUR_CLUB_IDS: Record<string, number> = {
  '68812': 68812,
  '102734': 102734,
  '101132': 101132,
};

function getPositionZone(
  position: number,
  totalTeams: number
): 'cl' | 'el' | 'ecl' | 'relegation' | 'default' {
  if (position === 1) return 'cl';
  if (position === 2 || position === 3) return 'ecl';
  if (position >= totalTeams - 1) return 'relegation';
  return 'default';
}

const zoneColors: Record<string, string> = {
  cl: 'var(--color-accent)',
  el: 'var(--color-accent-hover)',
  ecl: 'var(--color-win)',
  relegation: 'var(--color-loss)',
  default: 'var(--color-border)',
};

const zoneLabels: Record<string, string> = {
  cl: 'Лига чемпионов',
  el: 'Лига Европы',
  ecl: 'Лига конференций',
  relegation: 'Вылет',
};

export default function StandingsTable({ cometId }: Props) {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [tournamentName, setTournamentName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showZones = cometId === '68812';
  const ourClubId = OUR_CLUB_IDS[cometId];

  useEffect(() => {
    fetch(`/api/team/standings?cometId=${cometId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStandings(data.standings);
          setTournamentName(data.tournament || '');
        } else {
          setError(data.error || 'Ошибка загрузки');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить турнирную таблицу');
        setLoading(false);
      });
  }, [cometId]);

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

  const totalTeams = standings.length;

  return (
    <div style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      {tournamentName && (
        <p
          className="text-sm mt-2 mb-6 text-center flex items-center justify-center gap-2"
          style={{ color: 'var(--color-text-stat)' }}
        >
          {tournamentName}
        </p>
      )}

      <div
        className="overflow-x-auto"
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          background: 'var(--color-bg-card)',
          overflow: 'hidden',
        }}
      >
        <table className="min-w-full border-collapse">
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <th
                className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider w-12"
                style={{ color: 'var(--color-accent)' }}
              >
                #
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--color-accent)' }}
              >
                Команда
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-10"
                style={{ color: 'var(--color-accent)' }}
              >
                И
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-10"
                style={{ color: 'var(--color-accent)' }}
              >
                В
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-10"
                style={{ color: 'var(--color-accent)' }}
              >
                Н
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-10"
                style={{ color: 'var(--color-accent)' }}
              >
                П
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-10"
                style={{ color: 'var(--color-accent)' }}
              >
                ЗМ
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-10"
                style={{ color: 'var(--color-accent)' }}
              >
                ПМ
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-10"
                style={{ color: 'var(--color-accent)' }}
              >
                ±
              </th>
              <th
                className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider w-12"
                style={{ color: 'var(--color-accent)' }}
              >
                О
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => {
              const isDynamo = team.clubId === ourClubId;
              const zone = showZones ? getPositionZone(team.position, totalTeams) : 'default';
              const borderColor = showZones ? zoneColors[zone] : 'transparent';

              return (
                <tr
                  key={team.position}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.2s ease',
                    background: isDynamo ? 'var(--color-accent-7)' : 'transparent',
                    position: 'relative',
                    clipPath: 'inset(0)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDynamo)
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDynamo)
                      (e.currentTarget as HTMLTableRowElement).style.background = isDynamo
                        ? 'var(--color-accent-7)'
                        : 'transparent';
                  }}
                >
                  <td className="py-3 px-4 text-center relative z-10">
                    {showZones && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3,
                          height: 28,
                          borderRadius: 2,
                          background: borderColor,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 14,
                        fontWeight: 800,
                        color: isDynamo ? 'var(--color-accent)' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {team.position}
                    </span>
                  </td>
                  <td className="py-3 px-4 relative z-10" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      {team.logoUrl && (
                        <img
                          src={team.logoUrl}
                          alt=""
                          style={{
                            position: 'absolute',
                            left: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 150,
                            maxWidth: 150,
                            objectFit: 'contain',
                            objectPosition: 'left center',
                            opacity: 0.12,
                            pointerEvents: 'none',
                            zIndex: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontFamily: "'Inter Tight', sans-serif",
                          fontSize: 13,
                          fontWeight: isDynamo ? 800 : 500,
                          color: isDynamo ? '#ffffff' : 'rgba(255,255,255,0.8)',
                          position: 'relative',
                          zIndex: 1,
                          paddingLeft: 12,
                        }}
                      >
                        {team.club}
                      </span>
                    </div>
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm relative z-10"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {team.matches}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm relative z-10"
                    style={{ color: 'var(--color-win)' }}
                  >
                    {team.wins}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm relative z-10"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {team.draws}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm relative z-10"
                    style={{ color: 'var(--color-loss)' }}
                  >
                    {team.losses}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm relative z-10"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {team.goalsFor}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm relative z-10"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {team.goalsAgainst}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm font-mono relative z-10"
                    style={{
                      color:
                        team.goalDifference > 0
                          ? 'var(--color-win)'
                          : team.goalDifference < 0
                            ? 'var(--color-loss)'
                            : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </td>
                  <td
                    className="py-3 px-3 text-center relative z-10"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#ffffff',
                    }}
                  >
                    {team.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showZones && (
        <div className="flex flex-wrap items-center gap-6 mt-6 px-4">
          {[
            { color: zoneColors.cl, label: zoneLabels.cl },
            { color: zoneColors.ecl, label: zoneLabels.ecl },
            { color: zoneColors.relegation, label: zoneLabels.relegation },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div style={{ width: 12, height: 3, borderRadius: 2, background: item.color }} />
              <span className="text-xs" style={{ color: 'var(--color-text-label)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
