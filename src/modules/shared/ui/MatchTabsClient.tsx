// src/modules/shared/ui/MatchTabsClient.tsx - Клиентская часть секции матчей с вкладками
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCalendarAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import CountdownTimer from './CountdownTimer';
import MatchStadiumButton from './MatchStadiumButton';

interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
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

interface TeamMatches {
  next: MatchData | null;
  last: MatchData | null;
  nextOppLogo: string | null;
  lastOppLogo: string | null;
}

interface Props {
  matches: {
    osnova: TeamMatches;
    dubl: TeamMatches;
    women: TeamMatches;
  };
}

const TABS = [
  { key: 'osnova', label: 'Основной состав' },
  { key: 'dubl', label: 'Дубль' },
  { key: 'women', label: 'Женская' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function MatchTabsClient({ matches }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('osnova');

  const currentMatches = matches[activeTab];
  const ourLogo = '/images/logos/logo-white.png';

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
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`match__tab px-6 py-3 text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'border-[#ee862c]/50 bg-[#ee862c]/20 text-[#ee862c] backdrop-blur-md shadow-lg shadow-[#ee862c]/10'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="match__card match__card--empty relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 shadow-2xl p-10 md:p-14 items-center justify-center">
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

  const getDisplayValues = (match: MatchData | null, oppLogo: string | null) => {
    if (!match) return null;
    return {
      homeLogo: match.isHome ? ourLogo : oppLogo || ourLogo,
      awayLogo: match.isHome ? oppLogo || '/images/placeholder.jpg' : ourLogo,
      homeTeam: match.isHome ? 'Динамо-Брест' : match.homeTeam,
      awayTeam: match.isHome ? match.awayTeam : 'Динамо-Брест',
    };
  };

  const nextDisplay = getDisplayValues(nextMatch, currentMatches.nextOppLogo);
  const lastDisplay = getDisplayValues(lastMatch, currentMatches.lastOppLogo);

  const resultBorderColor =
    lastMatch && lastMatch.homeScore !== null && lastMatch.awayScore !== null
      ? (() => {
          const ourScore = lastMatch.isHome ? lastMatch.homeScore : lastMatch.awayScore;
          const theirScore = lastMatch.isHome ? lastMatch.awayScore : lastMatch.homeScore;
          if (ourScore > theirScore) return 'border-t-[#22c55e]';
          if (ourScore === theirScore) return 'border-t-[#f0ac74]';
          return 'border-t-[#ef4444]';
        })()
      : 'border-t-gray-600';

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
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`match__tab px-6 py-3 text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${
                activeTab === tab.key
                  ? 'border-[#ee862c]/50 bg-[#ee862c]/20 text-[#ee862c] backdrop-blur-md shadow-lg shadow-[#ee862c]/10'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="match__cards flex w-full max-w-[1000px] flex-col md:flex-row gap-6">
          {/* NEXT MATCH */}
          <div className="match__next flex-1 flex">
            {nextMatch && nextDisplay ? (
              <MatchCard
                match={nextMatch}
                homeLogo={nextDisplay.homeLogo}
                awayLogo={nextDisplay.awayLogo}
                homeTeam={nextDisplay.homeTeam}
                awayTeam={nextDisplay.awayTeam}
                isNext={true}
                borderColor=""
              />
            ) : (
              <EmptyCard message="Нет запланированных матчей" />
            )}
          </div>

          {/* LAST MATCH */}
          <div className="match__last flex-1 flex">
            {lastMatch && lastDisplay ? (
              <MatchCard
                match={lastMatch}
                homeLogo={lastDisplay.homeLogo}
                awayLogo={lastDisplay.awayLogo}
                homeTeam={lastDisplay.homeTeam}
                awayTeam={lastDisplay.awayTeam}
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
  isNext,
  borderColor,
}: {
  match: MatchData;
  homeLogo: string;
  awayLogo: string;
  homeTeam: string;
  awayTeam: string;
  isNext: boolean;
  borderColor: string;
}) {
  return (
    <div
      className={`match__card relative flex w-full h-full flex-col border border-white/10 bg-white/5 shadow-2xl p-6 md:p-10 overflow-hidden ${isNext ? 'match__card--next' : 'match__card--last'} ${!isNext ? `border-t-[6px] ${borderColor}` : ''}`}
    >
      {/* Фоновые логотипы */}
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

      {/* Названия команд вертикально */}
      <div className="match__card-team match__card-team--home absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
        <span
          className="text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
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
      <div className="match__card-team match__card-team--away absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
        <span
          className="text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
          style={{
            writingMode: 'vertical-lr',
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 900,
          }}
        >
          {awayTeam}
        </span>
      </div>

      {/* Заголовок */}
      <div className="match__card-header relative z-10 grid grid-cols-[1fr_1fr] items-start gap-4">
        <div>
          <p className="match__card-tournament text-xs font-bold uppercase tracking-[0.2em] text-[#ee862c]">
            {match.tournament || 'ТОВАРИЩЕСКИЙ МАТЧ'}
          </p>
          {match.round && (
            <p className="match__card-round mt-1 text-sm font-medium text-white/60">
              {match.round} тур
            </p>
          )}
        </div>
        <p className="match__card-date flex items-center gap-2 text-right text-sm text-white/70 justify-end">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-[#ee862c]" />
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

      {/* Мобильные названия */}
      <div className="match__card-teams-mobile mt-6 flex items-center justify-center gap-6 md:hidden">
        <span
          className="text-sm uppercase text-[#a5b3d5]"
          style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
        >
          {homeTeam}
        </span>
        <img src="/images/vs.png" alt="VS" className="w-8 h-auto opacity-40" />
        <span
          className="text-sm uppercase text-[#a5b3d5]"
          style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
        >
          {awayTeam}
        </span>
      </div>

      {/* Счёт / Таймер */}
      {isNext ? (
        <>
          <div className="match__card-countdown mt-6 flex justify-center">
            <CountdownTimer targetDate={new Date(match.matchDate)} />
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

      {/* Нижняя панель */}
      <div className="match__card-footer mt-auto">
        <div className="match__card-divider mt-6 h-[1px] w-full bg-white/10" />
        <div className="match__card-actions mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="match__card-stadium">
              <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
            </div>
            <div className="match__card-tickets">
              {isNext && match.ticketUrl ? (
                <a
                  href={match.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="match__card-ticket-link inline-flex items-center gap-2 bg-[#ee862c] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
                >
                  БИЛЕТЫ <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </a>
              ) : isNext ? null : (
                <button className="match__card-protocol inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:border-[#ee862c] hover:text-[#ee862c] transition-colors">
                  ПРОТОКОЛ <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </button>
              )}
            </div>
          </div>
          {match.attendance !== null && match.attendance !== undefined && (
            <div className="match__card-attendance flex items-center justify-end gap-1.5 text-xs text-white/50">
              <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
              {match.attendance.toLocaleString()} зрителей
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="match__card match__card--empty relative flex w-full h-full flex-col border border-white/10 bg-white/5 shadow-2xl p-10 md:p-14 items-center justify-center">
      <p className="match__card-empty-text text-gray-500 text-base">{message}</p>
    </div>
  );
}
