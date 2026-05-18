// src/app/team/player/[slug]/PlayerPageClient.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faRulerVertical,
  faWeightScale,
  faFlag,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import ProtocolAssistIcon from '@/modules/team/components/matches/ProtocolAssistIcon';
import ProtocolGoalIcon from '@/modules/team/components/matches/ProtocolGoalIcon';
import { socialLinks } from '@/modules/config/social';

interface PlayerData {
  id: string;
  cometId: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  number: number | null;
  position: string | null;
  birthDate: string | null;
  nationality: string | null;
  height: number | null;
  weight: number | null;
  photoUrl: string | null;
  bio: string | null;
  teams?: { slug: string }[];
}

interface AppearanceRow {
  date: number;
  match: string;
  competition: string;
  round: string;
  shirtNumber: number;
  startingLineup: boolean;
  played: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  result: string;
}

interface PlayerStatsResponse {
  success?: boolean;
  source?: string;
  totals: {
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    startedMatches: number;
    subAppearances: number;
    cleanSheets?: number;
    goalsConceded?: number;
  };
  byCompetition: Record<
    string,
    {
      appearances: number;
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
      minutesPlayed: number;
      startedMatches: number;
      subAppearances: number;
      cleanSheets?: number;
      goalsConceded?: number;
    }
  >;
  appearances: AppearanceRow[];
}

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeLabel(age: number): string {
  const lastDigit = age % 10;
  const lastTwo = age % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'лет';
  if (lastDigit === 1) return 'год';
  if (lastDigit >= 2 && lastDigit <= 4) return 'года';
  return 'лет';
}

function getSeason(): string {
  return String(new Date().getFullYear());
}

export default function PlayerPageClient({
  player,
  initialStats = null,
}: {
  player: PlayerData;
  initialStats?: PlayerStatsResponse | null;
}) {
  const [stats, setStats] = useState<PlayerStatsResponse | null>(initialStats);
  const [statsLoading, setStatsLoading] = useState(!initialStats);
  const bioRef = useRef<HTMLDivElement>(null);

  const isGoalkeeper = player.position === 'Вратарь';
  const teamSlug = player.teams?.[0]?.slug ?? '';

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const qs = teamSlug ? `?teamSlug=${encodeURIComponent(teamSlug)}` : '';
      const res = await fetch(`/api/players/${player.id}/stats${qs}`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch {
      // silently fail
    } finally {
      setStatsLoading(false);
    }
  }, [player.id, teamSlug]);

  useEffect(() => {
    if (initialStats) return;
    loadStats();
  }, [initialStats, loadStats]);

  const scrollToBio = () => {
    setTimeout(() => {
      bioRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const age = calculateAge(player.birthDate);
  const season = getSeason();

  const mainCompetition = stats?.byCompetition
    ? Object.keys(stats.byCompetition).find(
        (c) =>
          c.toLowerCase().includes('чемпионат') ||
          c.toLowerCase().includes('высшая') ||
          c.toLowerCase().includes('лига')
      ) || Object.keys(stats.byCompetition)[0]
    : null;

  const competitionName = mainCompetition || 'BETERA - Высшая лига';
  const seasonAppearances = stats?.appearances ?? [];
  const showBioSection =
    Boolean(player.bio) || statsLoading || seasonAppearances.length > 0;
  const showBioButton = Boolean(player.bio) || statsLoading || seasonAppearances.length > 0;

  return (
    <div className="player-page bg-[var(--color-bg-main)]">
      {/* Экран 1 — Hero */}
      <section className="player-page__hero relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden">
        <div className="player-page__bg absolute inset-0 z-0">
          <img
            src="/images/stadium.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-main)] via-[var(--color-bg-main)]/70 to-[var(--color-bg-main)]/30" />
        </div>

        {player.number && (
          <div
            className="player-page__big-number absolute top-1/2 left-0 md:left-[5%] lg:left-[8%] -translate-y-[55%] z-0 pointer-events-none select-none"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'clamp(200px, 28vw, 340px)',
              fontWeight: 900,
              color: 'var(--color-accent)',
              opacity: 0.13,
              lineHeight: 1,
              letterSpacing: '-0.05em',
            }}
          >
            {player.number}
          </div>
        )}

        <div className="player-page__social absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-6 lg:flex">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-white/50 transition-colors hover:text-[var(--color-accent)]"
            >
              <FontAwesomeIcon icon={social.icon} className="text-lg" />
            </a>
          ))}
          <div className="h-12 w-[1px] bg-white/20" />
        </div>

        <div className="player-page__info-side relative z-10 flex items-center w-full md:w-1/2 lg:w-[45%] px-6 py-24 md:px-16 md:pl-28 lg:pl-40 order-2 md:order-1">
          <div className="w-full max-w-xl">
            <div className="player-page__badge-row flex items-center gap-3 mb-6">
              {player.position && (
                <span
                  className="inline-flex items-center border border-[var(--color-accent)] bg-[var(--color-accent-10)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] rounded-md"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {player.position}
                </span>
              )}
              {player.position && player.number && (
                <div className="h-[1px] w-8 bg-gradient-to-r from-[var(--color-accent-30)] to-transparent" />
              )}
              {player.number && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  #{player.number}
                </span>
              )}
            </div>

            <p className="player-page__firstname text-sm font-normal uppercase tracking-[0.22em] text-white/50 mb-1">
              {player.firstName}
            </p>
            <h1
              className="player-page__name font-black uppercase text-white leading-[0.92] tracking-[-0.03em] mb-7"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 'clamp(52px, 7vw, 88px)',
                fontWeight: 900,
              }}
            >
              {player.lastName}
            </h1>

            <div className="player-page__info-icons flex flex-col gap-2.5 mb-8">
              <div className="flex items-center gap-2.5 text-[13px] text-white/55">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-[var(--color-accent)] w-3.5 h-3.5 flex-shrink-0"
                />
                {age && (
                  <span className="text-white/85 font-semibold">
                    {age} {getAgeLabel(age)}
                  </span>
                )}
                {age && player.birthDate && <span className="text-white/30">·</span>}
                {player.birthDate && <span>{formatDate(player.birthDate)}</span>}
              </div>
              <div className="flex items-center gap-[18px] text-[13px] text-white/55">
                {player.height && (
                  <div className="flex items-center gap-2.5">
                    <FontAwesomeIcon
                      icon={faRulerVertical}
                      className="text-[var(--color-accent)] w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className="text-white/85 font-semibold">{player.height} см</span>
                  </div>
                )}
                {player.weight && (
                  <div className="flex items-center gap-2.5">
                    <FontAwesomeIcon
                      icon={faWeightScale}
                      className="text-[var(--color-accent)] w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className="text-white/85 font-semibold">{player.weight} кг</span>
                  </div>
                )}
              </div>
              {player.nationality && (
                <div className="flex items-center gap-2.5 text-[13px]">
                  <FontAwesomeIcon
                    icon={faFlag}
                    className="text-[var(--color-accent)] w-3.5 h-3.5 flex-shrink-0"
                  />
                  <span className="bg-white/[0.06] border border-[var(--color-border-light)] rounded-md px-2.5 py-[3px] text-xs font-semibold text-white/80 uppercase tracking-[0.06em]">
                    {player.nationality}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 mb-2.5">
              {season} Сезон · {competitionName}
            </p>

            {/* Статистика */}
            {statsLoading ? (
              <div className="flex items-center gap-3 text-gray-500 py-4">
                <div className="w-5 h-5 border-2 border-[var(--color-accent-30)] border-t-[var(--color-accent)] rounded-full animate-spin" />
                <span className="text-sm">Загрузка статистики...</span>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-3 gap-2 mb-7">
                <StatCard label="Матчей" value={stats.totals.appearances} />
                {isGoalkeeper ? (
                  <>
                    <StatCard
                      label="Сухих"
                      value={stats.totals.cleanSheets ?? 0}
                      highlight
                    />
                    <StatCard label="Минут" value={stats.totals.minutesPlayed} />
                    <StatCard
                      label="Пропущено"
                      value={stats.totals.goalsConceded ?? 0}
                      color="var(--color-loss)"
                    />
                  </>
                ) : (
                  <>
                    <StatCard label="Голов" value={stats.totals.goals} highlight />
                    <StatCard label="Пасов" value={stats.totals.assists ?? 0} />
                    <StatCard label="Минут" value={stats.totals.minutesPlayed} />
                  </>
                )}
                <StatCard
                  label="ЖК"
                  value={stats.totals.yellowCards}
                  color="var(--color-yellow-card)"
                />
                <StatCard label="КК" value={stats.totals.redCards} color="var(--color-red-card)" />
              </div>
            ) : null}

            {showBioButton && (
              <button
                onClick={scrollToBio}
                className="player-page__bio-btn inline-flex items-center gap-2 bg-transparent border-[1.5px] border-white/20 rounded-lg px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/70 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
              >
                {player.bio ? 'Биография' : 'Матчи сезона'}
                <FontAwesomeIcon icon={faChevronDown} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="player-page__photo-side relative w-full md:w-1/2 lg:w-[55%] h-[55vh] md:h-auto md:min-h-screen order-1 md:order-2">
          <img
            src={player.photoUrl || '/images/placeholder.jpg'}
            alt={`${player.lastName} ${player.firstName}`}
            className="absolute inset-0 h-full w-full object-contain object-bottom"
          />
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--color-bg-main)] to-transparent hidden md:block" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-bg-main)] to-transparent md:hidden" />
        </div>
      </section>

      {showBioSection && (
        <section
          ref={bioRef}
          className="player-page__bio relative flex min-h-screen items-center bg-white overflow-hidden"
        >
          <div className="container mx-auto max-w-5xl px-6 py-20 md:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">
              ПРОФИЛЬ ИГРОКА
            </p>
            <h2
              className="text-4xl font-black text-[#242C41] md:text-6xl lg:text-7xl leading-none"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {player.firstName} {player.lastName}
            </h2>

            {player.cometId && (
              <div className="player-page__season mt-10 md:mt-12">
                <h3 className="player-page__season-title">Сезон {season}</h3>
                {statsLoading ? (
                  <div className="player-page__season-loading flex items-center gap-3 py-8 text-gray-400">
                    <div className="w-5 h-5 border-2 border-[#ee862c]/30 border-t-[#ee862c] rounded-full animate-spin" />
                    <span className="text-sm font-medium">Загрузка матчей...</span>
                  </div>
                ) : seasonAppearances.length > 0 ? (
                  <div className="player-page__matches-wrap">
                    <table className="player-page__matches-table">
                      <colgroup>
                        <col className="player-page__col-date" />
                        <col className="player-page__col-match" />
                        <col className="player-page__col-comp player-page__matches-table--hide-sm" />
                        <col className="player-page__col-stat" />
                        <col className="player-page__col-stat" />
                        <col className="player-page__col-stat player-page__matches-table--hide-sm" />
                        <col className="player-page__col-stat player-page__matches-table--hide-sm" />
                        <col className="player-page__col-stat" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Дата</th>
                          <th>Матч</th>
                          <th className="player-page__matches-table--hide-sm">Турнир</th>
                          <th className="player-page__matches-table--stat" aria-label="Голы">
                            <ProtocolGoalIcon className="player-page__th-icon player-page__th-icon--goal" />
                          </th>
                          <th className="player-page__matches-table--stat" aria-label="Пасы">
                            <ProtocolAssistIcon className="player-page__th-icon player-page__th-icon--assist" />
                          </th>
                          <th
                            className="player-page__matches-table--stat player-page__matches-table--hide-sm"
                            aria-label="Жёлтые карточки"
                          >
                            <span className="player-page__th-card player-page__th-card--yellow" />
                          </th>
                          <th
                            className="player-page__matches-table--stat player-page__matches-table--hide-sm"
                            aria-label="Красные карточки"
                          >
                            <span className="player-page__th-card player-page__th-card--red" />
                          </th>
                          <th className="player-page__matches-table--stat">Мин</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seasonAppearances.map((app, index) => (
                          <tr
                            key={`${app.date}-${app.match}-${index}`}
                            data-result={app.result || undefined}
                          >
                            <td className="player-page__matches-date">
                              {new Date(Number(app.date)).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </td>
                            <td className="player-page__matches-name">{app.match}</td>
                            <td className="player-page__matches-comp player-page__matches-table--hide-sm">
                              {app.competition}
                            </td>
                            <td className="player-page__matches-table--stat">
                              <MatchGoalsCell count={app.goals} />
                            </td>
                            <td className="player-page__matches-table--stat">
                              <MatchAssistsCell count={app.assists ?? 0} />
                            </td>
                            <td className="player-page__matches-table--stat player-page__matches-table--hide-sm">
                              <MatchCardsCell count={app.yellowCards} type="yellow" />
                            </td>
                            <td className="player-page__matches-table--stat player-page__matches-table--hide-sm">
                              <MatchCardsCell count={app.redCards} type="red" />
                            </td>
                            <td className="player-page__matches-table--stat player-page__matches-min">
                              {app.minutesPlayed}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : stats ? (
                  <p className="player-page__season-empty text-sm text-gray-400 py-6">
                    Нет сыгранных матчей в текущем сезоне
                  </p>
                ) : null}
              </div>
            )}

            {player.bio && (
              <div className="mt-10 text-gray-700 leading-relaxed text-base md:text-lg max-w-3xl space-y-4">
                {player.bio.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
          <div className="player-page__bio-title absolute right-0 bottom-0 pointer-events-none select-none">
            <span
              className="block text-[60px] font-black uppercase tracking-[0.1em] text-[var(--color-team-names)]/10 md:text-[80px] leading-none"
              style={{
                writingMode: 'vertical-lr',
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 900,
              }}
            >
              {player.lastName}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

function MatchCardsCell({ count, type }: { count: number; type: 'yellow' | 'red' }) {
  const label = type === 'yellow' ? 'жёлтых карточек' : 'красных карточек';
  const cardClass =
    type === 'yellow' ? 'player-page__card player-page__card--yellow' : 'player-page__card player-page__card--red';

  if (count <= 0) {
    return <span className="player-page__goals-empty">—</span>;
  }

  if (count > 2) {
    return (
      <div className="player-page__cards" aria-label={`${count} ${label}`}>
        <span className={cardClass} aria-hidden />
        <span
          className={
            type === 'yellow' ? 'player-page__cards-count--yellow' : 'player-page__cards-count--red'
          }
        >
          ×{count}
        </span>
      </div>
    );
  }

  return (
    <div className="player-page__cards" aria-label={`${count} ${label}`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cardClass} aria-hidden />
      ))}
    </div>
  );
}

function MatchGoalsCell({ count }: { count: number }) {
  if (count <= 0) {
    return <span className="player-page__goals-empty">—</span>;
  }

  if (count > 3) {
    return (
      <div className="player-page__goals" aria-label={`${count} голов`}>
        <ProtocolGoalIcon className="player-page__goals-icon" />
        <span className="player-page__goals-count">×{count}</span>
      </div>
    );
  }

  return (
    <div className="player-page__goals" aria-label={`${count} голов`}>
      {Array.from({ length: count }, (_, i) => (
        <ProtocolGoalIcon key={i} className="player-page__goals-icon" />
      ))}
    </div>
  );
}

function MatchAssistsCell({ count }: { count: number }) {
  if (count <= 0) {
    return <span className="player-page__goals-empty">—</span>;
  }

  if (count > 3) {
    return (
      <div className="player-page__assists" aria-label={`${count} голевых передач`}>
        <ProtocolAssistIcon className="player-page__assists-icon" />
        <span className="player-page__assists-count">×{count}</span>
      </div>
    );
  }

  return (
    <div className="player-page__assists" aria-label={`${count} голевых передач`}>
      {Array.from({ length: count }, (_, i) => (
        <ProtocolAssistIcon key={i} className="player-page__assists-icon" />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
  color = 'rgb(255,255,255)',
}: {
  label: string;
  value: number;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div
      className="relative flex flex-col gap-1 rounded-xl border p-[14px_16px] transition-all cursor-default overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: highlight ? '1px solid var(--color-accent-30)' : '1px solid var(--color-border)',
      }}
    >
      {highlight && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(at left top, var(--color-accent-12) 0%, transparent 70%)',
          }}
        />
      )}
      <span
        className="relative text-[22px] font-extrabold tracking-[-0.5px] leading-none"
        style={{
          fontFamily: "'Inter Tight', sans-serif",
          color: highlight ? 'var(--color-accent)' : color,
        }}
      >
        {value}
      </span>
      <span
        className="relative text-[11px] font-medium uppercase tracking-[0.06em]"
        style={{ fontFamily: "'Inter Tight', sans-serif", color: 'var(--color-text-stat)' }}
      >
        {label}
      </span>
    </div>
  );
}
