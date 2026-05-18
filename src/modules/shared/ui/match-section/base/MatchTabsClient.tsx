// Version Base — исходный UI матчей + счётчик V1 + позиции в таблице
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCalendarAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import CountdownTimer from '../v1/CountdownTimer';
import MatchStadiumButton from '../../MatchStadiumButton';
import {
  MATCH_TABS,
  type MatchData,
  type MatchTabKey,
  type MatchTabsClientProps,
} from '../types';
import {
  getDynamoClubId,
  getMatchDisplay,
  getOpponentClubId,
  getResultBorderColorTailwind,
  getTablePositionForClub,
} from '../utils';

function TablePosition({ position }: { position: number | null }) {
  if (position == null) return null;
  return (
    <span className="match__table-pos" title="Место в турнирной таблице">
      #{position}
    </span>
  );
}

export default function MatchTabsClient({ matches, standings = {} }: MatchTabsClientProps) {
  const [activeTab, setActiveTab] = useState<MatchTabKey>('osnova');

  const currentMatches = matches[activeTab];
  const standingsBundle = standings[activeTab] ?? null;

  const nextMatch = currentMatches.next;
  const lastMatch = currentMatches.last;

  if (!nextMatch && !lastMatch) {
    return (
      <section className="match relative flex min-h-screen flex-col">
        <div className="match__background absolute inset-0">
          <img
            src="/images/stadium.jpg"
            alt=""
            className="match__background-image h-full w-full object-cover"
          />
          <div className="match__background-overlay absolute inset-0 bg-[#0B0F1C]/85" />
        </div>
        <div className="match__container relative z-10 flex flex-col items-center px-4 pt-24">
          <div className="match__tabs flex items-center gap-2 mb-12">
            {MATCH_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`match__tab px-6 py-3 text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'border-[var(--color-accent-30)] bg-[var(--color-accent-20)] text-[var(--color-accent)] backdrop-blur-md shadow-lg shadow-[var(--color-accent-10)]'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10'
                }`}
              >
                {tab.short}
              </button>
            ))}
          </div>
          <div className="match__card match__card--empty relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 items-center justify-center">
            <p className="text-gray-500 text-lg">Нет данных о матчах</p>
          </div>
        </div>
        <div className="match__title absolute left-0 bottom-0 pointer-events-none select-none">
          <span
            className="block text-[80px] font-black uppercase tracking-[0.1em] text-white/[0.15] md:text-[120px] leading-none"
            style={{
              writingMode: 'vertical-lr',
              transform: 'rotate(180deg)',
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
            }}
          >
            МАТЧИ
          </span>
        </div>
      </section>
    );
  }

  const nextDisplay = getMatchDisplay(nextMatch, currentMatches.nextOppLogo);
  const lastDisplay = getMatchDisplay(lastMatch, currentMatches.lastOppLogo);
  const resultBorderColor = getResultBorderColorTailwind(lastMatch);

  const homeClubId = (match: MatchData) =>
    match.isHome ? getDynamoClubId(match) : getOpponentClubId(match);
  const awayClubId = (match: MatchData) =>
    match.isHome ? getOpponentClubId(match) : getDynamoClubId(match);

  return (
    <section className="match relative flex min-h-screen flex-col">
      <div className="match__background absolute inset-0">
        <img
          src="/images/stadium.jpg"
          alt=""
          className="match__background-image h-full w-full object-cover"
        />
        <div className="match__background-overlay absolute inset-0 bg-[#0B0F1C]/85" />
      </div>
      <div className="match__container relative z-10 flex flex-col items-center justify-center px-4 py-16 flex-1">
        <div className="match__tabs flex items-center gap-2 mb-8">
          {MATCH_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`match__tab px-6 py-3 text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${
                activeTab === tab.key
                  ? 'border-[var(--color-accent-30)] bg-[var(--color-accent-20)] text-[var(--color-accent)] backdrop-blur-md shadow-lg shadow-[var(--color-accent-10)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="match__cards w-full max-w-[1000px]">
          {/* NEXT MATCH */}
          <div className="match__next">
            {nextMatch && nextDisplay ? (
              <MatchCard
                match={nextMatch}
                homeLogo={nextDisplay.homeLogo}
                awayLogo={nextDisplay.awayLogo}
                homeTeam={nextDisplay.homeTeam}
                awayTeam={nextDisplay.awayTeam}
                homeTablePos={getTablePositionForClub(standingsBundle, homeClubId(nextMatch))}
                awayTablePos={getTablePositionForClub(standingsBundle, awayClubId(nextMatch))}
                isNext={true}
                borderColor=""
              />
            ) : (
              <EmptyCard message="Нет запланированных матчей" />
            )}
          </div>

          {/* LAST MATCH */}
          <div className="match__last">
            {lastMatch && lastDisplay ? (
              <MatchCard
                match={lastMatch}
                homeLogo={lastDisplay.homeLogo}
                awayLogo={lastDisplay.awayLogo}
                homeTeam={lastDisplay.homeTeam}
                awayTeam={lastDisplay.awayTeam}
                homeTablePos={getTablePositionForClub(standingsBundle, homeClubId(lastMatch))}
                awayTablePos={getTablePositionForClub(standingsBundle, awayClubId(lastMatch))}
                isNext={false}
                borderColor={resultBorderColor}
              />
            ) : (
              <EmptyCard message="Нет сыгранных матчей" />
            )}
          </div>
        </div>
      </div>

      <div className="match__title absolute left-0 bottom-0 pointer-events-none select-none">
        <span
          className="block text-[80px] font-black uppercase tracking-[0.1em] text-white/[0.15] md:text-[120px] leading-none"
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
          }}
        >
          МАТЧИ
        </span>
      </div>
    </section>
  );
}

function MatchCard({
  match,
  homeLogo,
  awayLogo,
  homeTeam,
  awayTeam,
  homeTablePos,
  awayTablePos,
  isNext,
  borderColor,
}: {
  match: MatchData;
  homeLogo: string;
  awayLogo: string;
  homeTeam: string;
  awayTeam: string;
  homeTablePos: number | null;
  awayTablePos: number | null;
  isNext: boolean;
  borderColor: string;
}) {
  return (
    <div
      className={`match__card relative flex w-full h-full flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 md:p-10 overflow-hidden ${isNext ? '' : borderColor} ${!isNext ? 'border-t-[6px]' : ''}`}
    >
      <div
        className="match__card-bg-logo match__card-bg-logo--left absolute pointer-events-none"
        style={{ left: '0%', top: '70%', transform: 'translate(-50%, -50%)' }}
      >
        <img src={homeLogo} alt="" className="h-48 w-auto md:h-72 max-w-none opacity-20" />
      </div>
      <div
        className="match__card-bg-logo match__card-bg-logo--right absolute pointer-events-none"
        style={{ right: '0%', top: '70%', transform: 'translate(50%, -50%)' }}
      >
        <img src={awayLogo} alt="" className="h-48 w-auto md:h-72 max-w-none opacity-20" />
      </div>

      <div className="match__card-team match__card-team--home absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center gap-2">
        <TablePosition position={homeTablePos} />
        <span
          className="text-sm uppercase tracking-[0.3em] text-[var(--color-team-names)]"
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 900,
          }}
        >
          {homeTeam}
        </span>
      </div>
      <div className="match__card-team match__card-team--away absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center gap-2">
        <TablePosition position={awayTablePos} />
        <span
          className="text-sm uppercase tracking-[0.3em] text-[var(--color-team-names)]"
          style={{
            writingMode: 'vertical-lr',
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 900,
          }}
        >
          {awayTeam}
        </span>
      </div>

      <div className="match__card-header relative z-10 grid grid-cols-[1fr_1fr] items-start gap-4">
        <div>
          <p className="match__card-tournament text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {match.tournament || 'ТОВАРИЩЕСКИЙ МАТЧ'}
          </p>
          {match.round && (
            <p className="match__card-round mt-1 text-sm font-medium text-white/60">
              {match.round} тур
            </p>
          )}
        </div>
        <p className="match__card-date flex items-center gap-2 text-right text-sm text-white/70 justify-end">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-[var(--color-accent)]" />
          {new Date(match.matchDate).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {isNext && (
            <>
              {' '}
              |{' '}
              {new Date(match.matchDate).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </>
          )}
        </p>
      </div>

      <div className="match__card-divider mt-6 h-[1px] w-full bg-white/10" />

      <div className="match__card-teams-mobile mt-6 flex items-center justify-center gap-6 md:hidden">
        <div className="flex flex-col items-center gap-1">
          <TablePosition position={homeTablePos} />
          <span
            className="text-sm uppercase text-[var(--color-team-names)]"
            style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
          >
            {homeTeam}
          </span>
        </div>
        <img src="/images/vs.png" alt="VS" className="w-8 h-auto opacity-40" />
        <div className="flex flex-col items-center gap-1">
          <TablePosition position={awayTablePos} />
          <span
            className="text-sm uppercase text-[var(--color-team-names)]"
            style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
          >
            {awayTeam}
          </span>
        </div>
      </div>

      {isNext ? (
        <>
          <div className="match__card-countdown mt-6 flex justify-center">
            <CountdownTimer targetDate={new Date(match.matchDate)} size="large" />
          </div>
          <div className="match__card-vs mt-6 hidden items-center justify-center md:flex">
            <img src="/images/vs.png" alt="VS" className="w-16 h-auto opacity-40" />
          </div>
        </>
      ) : (
        <div className="match__card-score mt-6 flex justify-center">
          <div className="flex items-center gap-4">
            <span
              className="match__card-score-home text-7xl text-white md:text-[120px] leading-none"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              {match.homeScore ?? '—'}
            </span>
            <span className="match__card-score-divider text-4xl text-white/10 md:text-5xl">:</span>
            <span
              className="match__card-score-away text-7xl text-white md:text-[120px] leading-none"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              {match.awayScore ?? '—'}
            </span>
          </div>
        </div>
      )}

      <div className="match__card-footer mt-auto">
        <div className="match__card-divider mt-6 h-[1px] w-full bg-white/10" />
        <div className="match__card-actions mt-4">
          <div className="match__card-meta-row flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="match__card-stadium min-w-0">
              <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
            </div>
            <div className="match__card-meta-end flex flex-wrap items-center justify-end gap-x-4 gap-y-2 ml-auto">
              {match.attendance !== null && match.attendance !== undefined && (
                <div className="match__card-attendance flex shrink-0 items-center gap-1.5 text-xs text-white/50">
                  <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                  {match.attendance.toLocaleString()} зрителей
                </div>
              )}
              {isNext && match.ticketUrl ? (
                <div className="match__card-tickets shrink-0">
                  <a
                    href={match.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="match__card-ticket-link inline-flex items-center gap-2 bg-[var(--color-accent)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    БИЛЕТЫ <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="match__card match__card--empty relative flex w-full h-full flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 items-center justify-center">
      <p className="match__card-empty-text text-gray-500 text-base">{message}</p>
    </div>
  );
}
