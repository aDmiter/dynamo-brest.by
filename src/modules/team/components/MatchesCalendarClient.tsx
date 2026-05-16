// src/modules/team/components/MatchesCalendarClient.tsx — Календарь матчей
'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faTicket,
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
  const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  return `${weekdays[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTHS_NOM[d.getMonth()]} ${d.getFullYear()}`;
}

function isTBD(dateStr: string): boolean {
  const d = new Date(dateStr);
  return d.getFullYear() === 1970;
}

function parseRoundNumber(round: string | null): number {
  if (!round) return 9999;
  const num = parseInt(round);
  return isNaN(num) ? 9999 : num;
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
  size = 44,
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
      className="calendar__club-badge"
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

// ── Calendar Card ─────────────────────────────────────────────────────────────
function CalendarCard({ match, ourLogo }: { match: MatchData; ourLogo: string }) {
  const [hov, setHov] = useState(false);
  const tbd = isTBD(match.matchDate);
  const homeName = match.isHome ? 'Динамо-Брест' : match.homeTeam;
  const awayName = match.isHome ? match.awayTeam : 'Динамо-Брест';
  const homeLogo = match.isHome ? ourLogo : match.homeLogoUrl;
  const awayLogo = match.isHome ? match.awayLogoUrl : ourLogo;
  const compColor = getCompetitionColor(match.tournament);

  return (
    <div
      className="calendar__card"
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
      <div className="calendar__card-body" style={{ padding: '16px 20px 16px 24px' }}>
        {/* Top meta row — tournament name + TBD badge */}
        <div
          className="calendar__card-meta"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}
        >
          {match.tournament && (
            <span
              className="calendar__card-tournament"
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
              className="calendar__card-round"
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
          {tbd && (
            <span
              className="calendar__card-tbd-badge"
              style={{
                marginLeft: 'auto',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 5,
                padding: '2px 8px',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 8,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              TBD
            </span>
          )}
        </div>

        {/* Teams + time */}
        <div
          className="calendar__card-teams"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            className="calendar__card-team calendar__card-team--home"
            style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}
          >
            <span
              className="calendar__card-team-name"
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
            <ClubBadge name={homeName} logoUrl={homeLogo} size={44} />
          </div>

          <div className="calendar__card-time" style={{ textAlign: 'center', flexShrink: 0 }}>
            {tbd ? (
              <span
                className="calendar__card-time-value"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 'clamp(14px,2vw,18px)',
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '-0.03em',
                  textTransform: 'uppercase',
                }}
              >
                —:—
              </span>
            ) : (
              <>
                <span
                  className="calendar__card-time-value"
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: 'clamp(18px,2.4vw,24px)',
                    fontWeight: 900,
                    color: 'var(--color-accent)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    display: 'block',
                  }}
                >
                  {formatTime(match.matchDate)}
                </span>
                <span
                  className="calendar__card-time-label"
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: 8,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 4,
                    display: 'block',
                  }}
                >
                  KO
                </span>
              </>
            )}
          </div>

          <div
            className="calendar__card-team calendar__card-team--away"
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <ClubBadge name={awayName} logoUrl={awayLogo} size={44} />
            <span
              className="calendar__card-team-name"
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

        {/* Bottom meta row */}
        <div
          className="calendar__card-info"
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
            className="calendar__card-info-item"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <FontAwesomeIcon
              icon={faCalendarAlt}
              style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)' }}
            />
            <span
              className="calendar__card-info-text"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.04em',
              }}
            >
              {tbd ? 'Дата уточняется' : formatDate(match.matchDate)}
            </span>
          </div>
          {!tbd && (
            <div
              className="calendar__card-info-item"
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <FontAwesomeIcon
                icon={faClock}
                style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)' }}
              />
              <span
                className="calendar__card-info-text"
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
          )}
          {match.stadium && (
            <div
              className="calendar__card-info-item"
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)' }}
              />
              <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
            </div>
          )}
          {match.ticketUrl && (
            <a
              href={match.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar__card-ticket-link"
              style={{
                marginLeft: 'auto',
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
export default function MatchesCalendarClient({ matches, teamName }: Props) {
  const ourLogo = '/images/logos/logo-white.png';

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const aTBD = isTBD(a.matchDate);
        const bTBD = isTBD(b.matchDate);
        if (aTBD && !bTBD) return 1;
        if (!aTBD && bTBD) return -1;
        const roundA = parseRoundNumber(a.round);
        const roundB = parseRoundNumber(b.round);
        if (roundA !== roundB) return roundA - roundB;
        if (!aTBD && !bTBD)
          return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
        return 0;
      }),
    [matches]
  );

  const { grouped, tbdMatches } = useMemo(() => {
    const grouped = new Map<string, MatchData[]>();
    const tbd: MatchData[] = [];
    sortedMatches.forEach((m) => {
      if (isTBD(m.matchDate)) {
        tbd.push(m);
      } else {
        const key = formatMonthYear(m.matchDate);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(m);
      }
    });
    return { grouped, tbdMatches: tbd };
  }, [sortedMatches]);

  return (
    <div
      className="calendar"
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        background: 'var(--color-bg-main)',
        minHeight: '100vh',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes calendarFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .calendar__card-enter { animation: calendarFadeUp 0.38s ease forwards; }
      `}</style>

      <CompactPageHero subtitle={teamName} title="Календарь матчей" watermark="КАЛЕНДАРЬ" />



      <div
        className="calendar__content"
        style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px' }}
      >
        {grouped.size === 0 && tbdMatches.length === 0 ? (
          <div
            className="calendar__empty"
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
            Нет запланированных матчей
          </div>
        ) : (
          <>
            {Array.from(grouped.entries()).map(([month, monthMatches]) => (
              <div key={month} className="calendar__month" style={{ marginBottom: 44 }}>
                <div
                  className="calendar__month-header"
                  style={{ position: 'relative', marginBottom: 18, overflow: 'hidden' }}
                >
                  <div
                    className="calendar__month-bg"
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
                    className="calendar__month-title-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div
                      className="calendar__month-accent"
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
                      className="calendar__month-title"
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
                      className="calendar__month-count"
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
                      className="calendar__month-line"
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
                  className="calendar__cards"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {monthMatches.map((m, i) => (
                    <div
                      key={m.id}
                      className="calendar__card-enter"
                      style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                    >
                      <CalendarCard match={m} ourLogo={ourLogo} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {tbdMatches.length > 0 && (
              <div className="calendar__month" style={{ marginBottom: 44 }}>
                <div
                  className="calendar__month-header"
                  style={{ position: 'relative', marginBottom: 18, overflow: 'hidden' }}
                >
                  <div
                    className="calendar__month-title-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div
                      className="calendar__month-accent"
                      style={{
                        width: 3,
                        height: 22,
                        borderRadius: 2,
                        flexShrink: 0,
                        background:
                          'linear-gradient(to bottom, var(--color-accent-30), transparent)',
                      }}
                    />
                    <span
                      className="calendar__month-title"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 'clamp(15px,2vw,19px)',
                        fontWeight: 900,
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '-0.03em',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                      }}
                    >
                      Дата уточняется
                    </span>
                    <span
                      className="calendar__month-count"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.15)',
                      }}
                    >
                      {tbdMatches.length} {getMatchCountLabel(tbdMatches.length)}
                    </span>
                    <div
                      className="calendar__month-line"
                      style={{
                        flex: 1,
                        height: 1,
                        marginLeft: 4,
                        background:
                          'linear-gradient(to right, rgba(255,255,255,0.05), transparent)',
                      }}
                    />
                  </div>
                </div>
                <div
                  className="calendar__cards"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {tbdMatches.map((m, i) => (
                    <div
                      key={m.id}
                      className="calendar__card-enter"
                      style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                    >
                      <CalendarCard match={m} ourLogo={ourLogo} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
