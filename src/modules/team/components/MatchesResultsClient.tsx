// src/modules/team/components/MatchesResultsClient.tsx — Результаты матчей
'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faUsers,
  faTicket,
  faFileAlt,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import CompactPageHero from '@/modules/shared/ui/CompactPageHero';
import MatchStadiumButton from '@/modules/shared/ui/MatchStadiumButton';

interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  stadium: string | null;
  facilityId: number | null;
  tournament: string | null;
  round: string | null;
  status: string;
  isHome: boolean;
  matchType: string | null;
  attendance: number | null;
  ticketUrl: string | null;
}

interface Props {
  matches: MatchData[];
  teamName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
const MONTHS_NOM = [
  'ЯНВАРЬ',
  'ФЕВРАЛЬ',
  'МАРТ',
  'АПРЕЛЬ',
  'МАЙ',
  'ИЮНЬ',
  'ИЮЛЬ',
  'АВГУСТ',
  'СЕНТЯБРЬ',
  'ОКТЯБРЬ',
  'НОЯБРЬ',
  'ДЕКАБРЬ',
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTHS_NOM[d.getMonth()]} ${d.getFullYear()}`;
}

function getResult(match: MatchData): 'W' | 'D' | 'L' | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  const ours = match.isHome ? match.homeScore : match.awayScore;
  const theirs = match.isHome ? match.awayScore : match.homeScore;
  if (ours > theirs) return 'W';
  if (ours === theirs) return 'D';
  return 'L';
}

const RESULT_COLOR: Record<string, string> = { W: '#22c55e', D: '#94a3b8', L: '#ef4444' };
const RESULT_LABEL: Record<string, string> = { W: 'ПОБЕДА', D: 'НИЧЬЯ', L: 'ПОРАЖЕНИЕ' };

function groupByYearAndMonth(matches: MatchData[]): Map<string, Map<string, MatchData[]>> {
  const map = new Map<string, Map<string, MatchData[]>>();
  matches.forEach((m) => {
    const d = new Date(m.matchDate);
    const year = d.getFullYear().toString();
    const month = formatMonthYear(m.matchDate);
    if (!map.has(year)) map.set(year, new Map());
    const yearMap = map.get(year)!;
    if (!yearMap.has(month)) yearMap.set(month, []);
    yearMap.get(month)!.push(m);
  });
  return map;
}

function getMatchCountLabel(count: number): string {
  if (count === 1) return 'матч';
  if (count >= 2 && count <= 4) return 'матча';
  return 'матчей';
}

function getCompetitionColor(tournament: string | null): string {
  if (!tournament) return 'var(--color-accent)';
  const t = tournament.toLowerCase();
  if (t.includes('кубок') && !t.includes('супер')) return '#3b82f6';
  if (t.includes('суперкубок')) return '#d4af37';
  return 'var(--color-accent)';
}

// ── Club Badge ────────────────────────────────────────────────────────────────
function ClubBadge({
  name,
  logoUrl,
  size = 42,
}: {
  name: string;
  logoUrl: string | null;
  size?: number;
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  return (
    <div
      className="results__club-badge"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.06)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={size - 8}
          height={size - 8}
          className="object-contain"
        />
      ) : (
        <span
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: size * 0.28,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '-0.04em',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, ourLogo }: { match: MatchData; ourLogo: string }) {
  const [hov, setHov] = useState(false);
  const result = getResult(match);
  const homeName = match.isHome ? 'Динамо-Брест' : match.homeTeam;
  const awayName = match.isHome ? match.awayTeam : 'Динамо-Брест';
  const homeLogo = match.isHome ? ourLogo : match.homeLogoUrl;
  const awayLogo = match.isHome ? match.awayLogoUrl : ourLogo;
  const compColor = getCompetitionColor(match.tournament);

  return (
    <div
      className="results__card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        background: hov ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: hov ? '1px solid rgba(255,255,255,0.13)' : '1px solid var(--color-border)',
        borderRadius: 14,
        overflow: 'hidden',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.45)' : '0 2px 10px rgba(0,0,0,0.25)',
        transition: 'all 0.25s cubic-bezier(0.34,1.3,0.64,1)',
      }}
    >
      <div
        className="results__card-indicator"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: result ? RESULT_COLOR[result] : 'rgba(255,255,255,0.08)',
          borderRadius: '14px 0 0 14px',
        }}
      />
      <div className="results__card-body" style={{ padding: '16px 20px 16px 24px' }}>
        {/* Top meta — tournament name + result pill */}
        <div
          className="results__card-meta"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}
        >
          {match.tournament && (
            <span
              className="results__card-tournament"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: compColor,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {match.tournament}
            </span>
          )}
          {match.round && (
            <span
              className="results__card-round"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.32)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {match.round} тур
            </span>
          )}
          {result && (
            <div
              className="results__card-result-pill"
              style={{
                marginLeft: 'auto',
                background: `${RESULT_COLOR[result]}14`,
                border: `1px solid ${RESULT_COLOR[result]}50`,
                borderRadius: 5,
                padding: '2px 8px',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 8,
                fontWeight: 900,
                color: RESULT_COLOR[result],
                letterSpacing: '0.14em',
              }}
            >
              {RESULT_LABEL[result]}
            </div>
          )}
        </div>

        <div
          className="results__card-teams"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            className="results__card-team results__card-team--home"
            style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}
          >
            <span
              className="results__card-team-name"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 'clamp(13px,1.6vw,16px)',
                fontWeight: 900,
                color: match.isHome ? '#fff' : 'rgba(255,255,255,0.7)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase',
                textAlign: 'right',
              }}
            >
              {homeName}
            </span>
            <ClubBadge name={homeName} logoUrl={homeLogo} size={42} />
          </div>

          <div className="results__card-score" style={{ textAlign: 'center', flexShrink: 0 }}>
            <span
              className="results__card-score-value"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 'clamp(22px,3vw,32px)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              {match.homeScore ?? '—'}
              <span style={{ color: 'rgba(255,255,255,0.22)', margin: '0 4px', fontWeight: 300 }}>
                –
              </span>
              {match.awayScore ?? '—'}
            </span>
            <div
              className="results__card-score-label"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 8,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              FT
            </div>
          </div>

          <div
            className="results__card-team results__card-team--away"
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <ClubBadge name={awayName} logoUrl={awayLogo} size={42} />
            <span
              className="results__card-team-name"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 'clamp(13px,1.6vw,16px)',
                fontWeight: 900,
                color: !match.isHome ? '#fff' : 'rgba(255,255,255,0.7)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase',
              }}
            >
              {awayName}
            </span>
          </div>
        </div>

        <div
          className="results__card-info"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="results__card-info-item"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <FontAwesomeIcon
              icon={faCalendarAlt}
              style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)' }}
            />
            <span
              className="results__card-info-text"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.04em',
              }}
            >
              {formatDate(match.matchDate)}
            </span>
          </div>
          <div
            className="results__card-info-item"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <FontAwesomeIcon
              icon={faClock}
              style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)' }}
            />
            <span
              className="results__card-info-text"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.04em',
              }}
            >
              {formatTime(match.matchDate)}
            </span>
          </div>
          {match.stadium && (
            <div
              className="results__card-info-item"
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)' }}
              />
              <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
            </div>
          )}
          {match.attendance != null && (
            <div
              className="results__card-info-item results__card-info-item--attendance"
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <FontAwesomeIcon
                icon={faUsers}
                style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.2)' }}
              />
              <span
                className="results__card-info-text"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {match.attendance.toLocaleString()}
              </span>
            </div>
          )}
          {/* Protocol button (always shown for finished matches) */}
          <a
            href="#"
            className="results__card-protocol-link"
            style={{
              marginLeft: match.attendance == null ? 'auto' : 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--color-accent-10)',
              border: '1.5px solid var(--color-accent-30)',
              borderRadius: 7,
              padding: '5px 11px',
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--color-accent)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            onClick={(e) => {
              e.preventDefault(); /* TODO: add protocol link */
            }}
          >
            <FontAwesomeIcon icon={faFileAlt} style={{ width: 10, height: 10 }} />
            Протокол
          </a>
          {match.ticketUrl && (
            <a
              href={match.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="results__card-ticket-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--color-accent-10)',
                border: '1.5px solid var(--color-accent-30)',
                borderRadius: 7,
                padding: '5px 11px',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--color-accent)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <FontAwesomeIcon icon={faTicket} style={{ width: 10, height: 10 }} />
              Билеты
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MatchesResultsClient({ matches, teamName }: Props) {
  const ourLogo = '/images/logos/logo-white.png';
  const currentYear = new Date().getFullYear().toString();
  const grouped = useMemo(() => groupByYearAndMonth(matches), []);
  const years = useMemo(
    () => Array.from(grouped.keys()).sort((a, b) => parseInt(b) - parseInt(a)),
    [grouped]
  );
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({ [currentYear]: true });

  const toggleYear = (year: string) => setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));

  return (
    <div
      className="results"
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        background: 'var(--color-bg-main)',
        minHeight: '100vh',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes resultsFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .results__card-enter { animation: resultsFadeUp 0.38s ease forwards; }
      `}</style>

      <CompactPageHero subtitle={teamName} title="Результаты матчей" watermark="РЕЗУЛЬТАТЫ" />



      <div
        className="results__content"
        style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px' }}
      >
        {matches.length === 0 ? (
          <div
            className="results__empty"
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Нет сыгранных матчей
          </div>
        ) : (
          years.map((year) => {
            const yearData = grouped.get(year)!;
            const isOpen = openYears[year] ?? false;
            const yearMatchCount = Array.from(yearData.values()).reduce(
              (sum, arr) => sum + arr.length,
              0
            );

            return (
              <div key={year} className="results__year" style={{ marginBottom: 32 }}>
                <button
                  className="results__year-header"
                  onClick={() => toggleYear(year)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 14,
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.3s',
                    }}
                  />
                  <span
                    className="results__year-title"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 'clamp(22px,3vw,28px)',
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {year}
                  </span>
                  <span
                    className="results__year-count"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {yearMatchCount} {getMatchCountLabel(yearMatchCount)}
                  </span>
                  <div
                    className="results__year-line"
                    style={{
                      flex: 1,
                      height: 1,
                      background: 'linear-gradient(to right, var(--color-accent-20), transparent)',
                    }}
                  />
                </button>

                {isOpen && (
                  <div className="results__year-body" style={{ paddingTop: 24 }}>
                    {Array.from(yearData.entries()).map(([month, monthMatches]) => (
                      <div key={month} className="results__month" style={{ marginBottom: 36 }}>
                        <div
                          className="results__month-header"
                          style={{ position: 'relative', marginBottom: 18, overflow: 'hidden' }}
                        >
                          <div
                            className="results__month-bg"
                            style={{
                              position: 'absolute',
                              top: '50%',
                              right: -4,
                              transform: 'translateY(-50%)',
                              fontFamily: "'Inter Tight', sans-serif",
                              fontSize: 'clamp(36px,5.5vw,60px)',
                              fontWeight: 900,
                              color: 'var(--color-accent)',
                              opacity: 0.065,
                              letterSpacing: '-0.04em',
                              textTransform: 'uppercase',
                              userSelect: 'none',
                              pointerEvents: 'none',
                              lineHeight: 1,
                            }}
                          >
                            {month.split(' ')[0]}
                          </div>
                          <div
                            className="results__month-title-row"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              position: 'relative',
                              zIndex: 1,
                            }}
                          >
                            <div
                              className="results__month-accent"
                              style={{
                                width: 3,
                                height: 22,
                                borderRadius: 2,
                                flexShrink: 0,
                                background:
                                  'linear-gradient(to bottom, var(--color-accent), var(--color-accent-30))',
                              }}
                            />
                            <span
                              className="results__month-title"
                              style={{
                                fontFamily: "'Inter Tight', sans-serif",
                                fontSize: 'clamp(15px,2vw,19px)',
                                fontWeight: 900,
                                color: '#ffffff',
                                letterSpacing: '-0.03em',
                                textTransform: 'uppercase',
                                lineHeight: 1,
                              }}
                            >
                              {month}
                            </span>
                            <span
                              className="results__month-count"
                              style={{
                                fontFamily: "'Inter Tight', sans-serif",
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.2)',
                              }}
                            >
                              {monthMatches.length} {getMatchCountLabel(monthMatches.length)}
                            </span>
                            <div
                              className="results__month-line"
                              style={{
                                flex: 1,
                                height: 1,
                                marginLeft: 4,
                                background:
                                  'linear-gradient(to right, var(--color-accent-20), transparent)',
                              }}
                            />
                          </div>
                        </div>
                        <div
                          className="results__cards"
                          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                        >
                          {monthMatches.map((m, i) => (
                            <div
                              key={m.id}
                              className="results__card-enter"
                              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                            >
                              <MatchCard match={m} ourLogo={ourLogo} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        <div
          className="results__legend"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            padding: '20px 0',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {[
            { label: 'Победа', color: '#22c55e' },
            { label: 'Ничья', color: '#94a3b8' },
            { label: 'Поражение', color: '#ef4444' },
          ].map(({ label, color }) => (
            <div
              key={label}
              className="results__legend-item"
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span
                className="results__legend-dot"
                style={{
                  width: 3,
                  height: 14,
                  borderRadius: 2,
                  background: color,
                  flexShrink: 0,
                  display: 'block',
                }}
              />
              <span
                className="results__legend-label"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.28)',
                  letterSpacing: '0.06em',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
