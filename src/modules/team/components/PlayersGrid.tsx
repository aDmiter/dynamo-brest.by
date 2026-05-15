// src/modules/team/components/PlayersGrid.tsx - Сетка игроков с группировкой по позициям
'use client';

import { useState, useMemo } from 'react';

interface PlayerData {
  id: string;
  slug?: string | null;
  cometId: string | null;
  firstName: string;
  lastName: string;
  number: number | null;
  position: string | null;
  photoUrl: string | null;
  birthDate: Date | null;
  nationality: string | null;
  height: number | null;
  weight: number | null;
}

interface Props {
  players: PlayerData[];
  teamName: string;
  teamSlug: string;
}

interface PlayerStats {
  appearances: number;
  goals: number;
  cleanSheets?: number;
  goalsConceded?: number;
  assists?: number;
}

import PlayerCard from './PlayerCard';
import StatsPanel from './StatsPanel';
import PositionFilters from './PositionFilters';
import SectionHeader from './SectionHeader';

const positionSections = [
  { key: 'Вратарь', label: 'Вратари', watermark: 'GK' },
  { key: 'Защитник', label: 'Защитники', watermark: 'DEF' },
  { key: 'Полузащитник', label: 'Полузащитники', watermark: 'MID' },
  { key: 'Нападающий', label: 'Нападающие', watermark: 'FWD' },
];

const positionFilters = [
  { key: 'ALL', label: 'Все' },
  { key: 'Вратарь', label: 'Вратари' },
  { key: 'Защитник', label: 'Защитники' },
  { key: 'Полузащитник', label: 'Полузащитники' },
  { key: 'Нападающий', label: 'Нападающие' },
];

function calculateAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PlayersGrid({ players, teamName, teamSlug }: Props) {
  const [filter, setFilter] = useState<string>('ALL');
  const [statsMap, setStatsMap] = useState<Record<string, PlayerStats | null>>({});
  const [initDone, setInitDone] = useState(false);

  if (!initDone) {
    setInitDone(true);
    startLoadingStats();
  }

  async function startLoadingStats() {
    const cacheKey = `ps_${teamSlug}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.t && Date.now() - parsed.t < 30 * 60 * 1000) {
          setStatsMap(parsed.d);
          return;
        }
      }
    } catch {}

    const map: Record<string, PlayerStats | null> = {};
    for (const p of players) {
      if (!p.cometId) continue;
      try {
        const res = await fetch(`/api/players/${p.id}/stats?teamSlug=${teamSlug}`);
        const data = await res.json();
        if (data.success) {
          map[p.id] = {
            appearances: data.totals.appearances || 0,
            goals: data.totals.goals || 0,
            cleanSheets: data.totals.cleanSheets || 0,
            goalsConceded: data.totals.goalsConceded || 0,
            assists: data.totals.assists || 0,
          };
        }
      } catch {}
      setStatsMap({ ...map });
      await new Promise((r) => setTimeout(r, 100));
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify({ d: map, t: Date.now() }));
    } catch {}
  }

  const filtered = useMemo(() => {
    return players.filter((p) => filter === 'ALL' || p.position === filter);
  }, [players, filter]);

  const isGrouped = filter === 'ALL';

  const squadMeta = {
    total: players.length,
    avgAge:
      Math.round(
        (players.reduce((s, p) => s + (calculateAge(p.birthDate) || 0), 0) / players.length) * 10
      ) / 10,
    nations: new Set(players.map((p) => p.nationality).filter(Boolean)).size,
    withPhotos: players.filter((p) => p.photoUrl).length,
  };

  return (
    <div
      className="players-grid"
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        background: 'var(--color-bg-main)',
        minHeight: '100vh',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: fadeUp 0.45s ease forwards; }
      `}</style>

      <section
        className="players-grid__hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '56px 32px 40px',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        <div
          className="players-grid__watermark"
          style={{
            position: 'absolute',
            top: '50%',
            right: -24,
            transform: 'translateY(-50%)',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 'clamp(100px, 18vw, 220px)',
            fontWeight: 900,
            color: 'var(--color-accent)',
            opacity: 0.055,
            letterSpacing: '-0.05em',
            textTransform: 'uppercase',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          СОСТАВ
        </div>

        <div
          className="players-grid__hero-content"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              className="players-grid__subtitle"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              КОМАНДА
            </div>
            <div
              className="players-grid__title"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 'clamp(48px, 7vw, 80px)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
              }}
            >
              {teamName}
            </div>
          </div>
          <StatsPanel meta={squadMeta} />
        </div>
      </section>

      <PositionFilters
        filters={positionFilters}
        current={filter}
        total={players.length}
        players={players}
        onChange={setFilter}
      />

      <div
        className="players-grid__content"
        style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 80px' }}
      >
        {filtered.length === 0 ? (
          <div
            className="players-grid__empty"
            style={{
              textAlign: 'center',
              padding: '100px 0',
              fontFamily: "'Inter Tight', sans-serif",
              color: 'rgba(255,255,255,0.25)',
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Игроки не найдены
          </div>
        ) : isGrouped ? (
          <div
            className="players-grid__sections"
            style={{ display: 'flex', flexDirection: 'column', gap: 52 }}
          >
            {positionSections.map(({ key, label, watermark }) => {
              const group = filtered.filter((p) => p.position === key);
              if (!group.length) return null;
              return (
                <div key={key} className="players-grid__section">
                  <SectionHeader label={label} count={group.length} watermark={watermark} />
                  <div
                    className="players-grid__cards"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                      gap: 16,
                    }}
                  >
                    {group.map((player, i) => (
                      <div
                        key={player.id}
                        className="card-enter"
                        style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
                      >
                        <PlayerCard
                          player={player}
                          teamSlug={teamSlug}
                          stats={statsMap[player.id] ?? null}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="players-grid__cards"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 16,
            }}
          >
            {filtered.map((player, i) => (
              <div
                key={player.id}
                className="card-enter"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <PlayerCard
                  player={player}
                  teamSlug={teamSlug}
                  stats={statsMap[player.id] ?? null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
