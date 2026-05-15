// src/modules/team/components/MatchesResultsClient.tsx - Результаты матчей (glassmorphism)
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faChevronDown } from '@fortawesome/free-solid-svg-icons';
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
}

interface Props {
  matches: MatchData[];
  teamName: string;
}

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export default function MatchesResultsClient({ matches, teamName }: Props) {
  const ourLogo = '/images/logos/logo-white.png';
  const currentYear = new Date().getFullYear();
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({
    [currentYear.toString()]: true,
  });

  const toggleYear = (year: string) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const grouped: Record<string, Record<string, MatchData[]>> = {};
  for (const match of matches) {
    const d = new Date(match.matchDate);
    const year = d.getFullYear().toString();
    const month = MONTHS[d.getMonth()];
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];
    grouped[year][month].push(match);
  }

  const years = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="results-page min-h-screen bg-[var(--color-bg-main)]">
      <div className="results-page__hero relative h-[40vh] w-full overflow-hidden">
        <img
          src="/images/stadium.jpg"
          alt={teamName}
          className="results-page__hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="results-page__hero-overlay absolute inset-0 bg-black/60" />
        <div className="results-page__hero-content absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36">
            <p className="results-page__hero-subtitle mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              {teamName}
            </p>
            <h1
              className="results-page__hero-title text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Результаты матчей
            </h1>
          </div>
        </div>
      </div>

      <div className="results-page__content mx-auto max-w-[1200px] px-4 py-12 md:px-8">
        {years.length === 0 ? (
          <div className="results-page__empty py-20 text-center">
            <p className="text-xl text-gray-500">Нет сыгранных матчей</p>
          </div>
        ) : (
          <div className="results-page__years space-y-8">
            {years.map((year) => {
              const yearData = grouped[year];
              const isOpen = openYears[year] ?? false;
              const months = Object.keys(yearData).sort(
                (a, b) => MONTHS.indexOf(b) - MONTHS.indexOf(a)
              );

              return (
                <div
                  key={year}
                  className="results-page__year border border-[var(--color-border)] bg-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => toggleYear(year)}
                    className="results-page__year-header w-full flex items-center justify-between px-6 py-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors border-b border-[var(--color-border)]"
                  >
                    <h2
                      className="results-page__year-title text-2xl font-black uppercase tracking-wider text-white"
                      style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                      {year}
                    </h2>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`results-page__year-chevron text-[var(--color-accent)] text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="results-page__months p-6 space-y-12">
                      {months.map((month) => (
                        <div key={month} className="results-page__month">
                          <h3 className="results-page__month-title mb-4 text-lg font-bold uppercase tracking-wider text-gray-400">
                            {month}
                          </h3>
                          <div className="results-page__matches space-y-4">
                            {yearData[month].map((match) => (
                              <ResultCard key={match.id} match={match} ourLogo={ourLogo} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ match, ourLogo }: { match: MatchData; ourLogo: string }) {
  const homeLogo = match.isHome ? ourLogo : match.homeLogoUrl || '/images/placeholder.jpg';
  const awayLogo = match.isHome ? match.awayLogoUrl || '/images/placeholder.jpg' : ourLogo;

  const ourScore = match.isHome ? match.homeScore : match.awayScore;
  const theirScore = match.isHome ? match.awayScore : match.homeScore;

  const isWin = ourScore != null && theirScore != null && ourScore > theirScore;
  const isDraw = ourScore != null && theirScore != null && ourScore === theirScore;
  const isLoss = ourScore != null && theirScore != null && ourScore < theirScore;

  const resultColor = isWin
    ? 'border-l-[var(--color-win)]'
    : isDraw
      ? 'border-l-[var(--color-accent-hover)]'
      : 'border-l-[var(--color-loss)]';

  return (
    <div
      className={`result-card relative flex flex-col md:flex-row border border-[var(--color-border)] bg-white/5 overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-[var(--color-accent-20)] border-l-[4px] ${resultColor}`}
    >
      <div className="result-card__date flex flex-row md:flex-col items-center justify-center gap-2 p-5 md:w-32 md:border-r border-[var(--color-border)] bg-white/[0.03]">
        <span
          className="result-card__date-day text-2xl font-black text-white"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          {new Date(match.matchDate).getDate()}
        </span>
        <span className="result-card__date-month text-xs font-bold uppercase tracking-wider text-gray-400">
          {MONTHS[new Date(match.matchDate).getMonth()].substring(0, 3)}
        </span>
      </div>

      <div className="result-card__body flex-1 flex flex-col md:flex-row items-center gap-5 p-5">
        <div className="result-card__teams flex items-center gap-5">
          <div className="result-card__team flex flex-col items-center gap-1.5">
            <img
              src={homeLogo}
              alt=""
              className="result-card__team-logo h-12 w-12 object-contain opacity-80"
            />
            <span className="result-card__team-name text-[11px] text-gray-400 text-center max-w-[70px] leading-tight line-clamp-2">
              {match.isHome ? 'Динамо-Брест' : match.homeTeam}
            </span>
          </div>

          <div className="result-card__score flex items-center gap-2">
            <span
              className={`result-card__score-home text-3xl font-black md:text-4xl ${
                match.isHome
                  ? isWin
                    ? 'text-[var(--color-win)]'
                    : isDraw
                      ? 'text-[var(--color-accent-hover)]'
                      : isLoss
                        ? 'text-[var(--color-loss)]'
                        : 'text-white'
                  : isLoss
                    ? 'text-[var(--color-win)]'
                    : isDraw
                      ? 'text-[var(--color-accent-hover)]'
                      : isWin
                        ? 'text-[var(--color-loss)]'
                        : 'text-white'
              }`}
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {match.homeScore ?? '—'}
            </span>
            <span className="result-card__score-divider text-xl text-white/20">:</span>
            <span
              className={`result-card__score-away text-3xl font-black md:text-4xl ${
                !match.isHome
                  ? isWin
                    ? 'text-[var(--color-win)]'
                    : isDraw
                      ? 'text-[var(--color-accent-hover)]'
                      : isLoss
                        ? 'text-[var(--color-loss)]'
                        : 'text-white'
                  : isLoss
                    ? 'text-[var(--color-win)]'
                    : isDraw
                      ? 'text-[var(--color-accent-hover)]'
                      : isWin
                        ? 'text-[var(--color-loss)]'
                        : 'text-white'
              }`}
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {match.awayScore ?? '—'}
            </span>
          </div>

          <div className="result-card__team flex flex-col items-center gap-1.5">
            <img
              src={awayLogo}
              alt=""
              className="result-card__team-logo h-12 w-12 object-contain opacity-80"
            />
            <span className="result-card__team-name text-[11px] text-gray-400 text-center max-w-[70px] leading-tight line-clamp-2">
              {match.isHome ? match.awayTeam : 'Динамо-Брест'}
            </span>
          </div>
        </div>

        <div className="result-card__info md:ml-auto flex flex-col items-end gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3 justify-end">
            {match.tournament && (
              <span className="result-card__tournament border border-[var(--color-border)] px-2.5 py-1.5 text-gray-400 font-medium uppercase tracking-wider">
                {match.tournament}
              </span>
            )}
            {match.round && (
              <span className="result-card__round border border-[var(--color-border)] px-2.5 py-1.5 text-[var(--color-accent)]">
                {match.round} тур
              </span>
            )}
          </div>
          <div className="result-card__stadium">
            <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
          </div>
          {match.attendance != null && (
            <div className="result-card__attendance flex items-center gap-1.5 text-gray-500">
              <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
              {match.attendance.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
