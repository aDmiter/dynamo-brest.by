// src/modules/team/components/MatchesCalendarClient.tsx - Календарь матчей (glassmorphism)
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
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

function isTBD(dateStr: string): boolean {
  const d = new Date(dateStr);
  return d.getFullYear() === 1970;
}

function parseRoundNumber(round: string | null): number {
  if (!round) return 9999;
  const num = parseInt(round);
  return isNaN(num) ? 9999 : num;
}

export default function MatchesCalendarClient({ matches, teamName }: Props) {
  const sortedMatches = [...matches].sort((a, b) => {
    const aTBD = isTBD(a.matchDate);
    const bTBD = isTBD(b.matchDate);

    if (aTBD && !bTBD) return 1;
    if (!aTBD && bTBD) return -1;

    const roundA = parseRoundNumber(a.round);
    const roundB = parseRoundNumber(b.round);
    if (roundA !== roundB) return roundA - roundB;

    if (!aTBD && !bTBD) {
      return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
    }

    return 0;
  });

  const grouped: Record<string, MatchData[]> = {};
  const tbdMatches: MatchData[] = [];

  for (const match of sortedMatches) {
    if (isTBD(match.matchDate)) {
      tbdMatches.push(match);
    } else {
      const d = new Date(match.matchDate);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(match);
    }
  }

  const ourLogo = '/images/logos/logo-white.png';

  return (
    <div className="calendar-page min-h-screen bg-[#0d1117]">
      <div className="calendar-page__hero relative h-[40vh] w-full overflow-hidden">
        <img
          src="/images/stadium.jpg"
          alt={teamName}
          className="calendar-page__hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="calendar-page__hero-overlay absolute inset-0 bg-black/60" />
        <div className="calendar-page__hero-content absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36">
            <p className="calendar-page__hero-subtitle mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#ee862c]">
              {teamName}
            </p>
            <h1
              className="calendar-page__hero-title text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Календарь матчей
            </h1>
          </div>
        </div>
      </div>

      <div className="calendar-page__content mx-auto max-w-[1200px] px-4 py-12 md:px-8">
        {Object.keys(grouped).length === 0 && tbdMatches.length === 0 ? (
          <div className="calendar-page__empty py-20 text-center">
            <p className="text-xl text-gray-500">Нет запланированных матчей</p>
          </div>
        ) : (
          <div className="calendar-page__sections space-y-16">
            {Object.entries(grouped).map(([month, monthMatches]) => (
              <div key={month} className="calendar-page__section">
                <h2
                  className="calendar-page__month-title mb-6 text-2xl font-black uppercase tracking-wider text-white py-3"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {month}
                </h2>
                <div className="calendar-page__matches space-y-4">
                  {monthMatches.map((match) => (
                    <CalendarCard key={match.id} match={match} ourLogo={ourLogo} />
                  ))}
                </div>
              </div>
            ))}

            {tbdMatches.length > 0 && (
              <div className="calendar-page__section">
                <h2
                  className="calendar-page__month-title mb-6 text-2xl font-black uppercase tracking-wider text-white py-3"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  Дата уточняется
                </h2>
                <div className="calendar-page__matches space-y-4">
                  {tbdMatches.map((match) => (
                    <CalendarCard key={match.id} match={match} ourLogo={ourLogo} isTBD />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarCard({
  match,
  ourLogo,
  isTBD: tbd,
}: {
  match: MatchData;
  ourLogo: string;
  isTBD?: boolean;
}) {
  const homeLogo = match.isHome ? ourLogo : match.homeLogoUrl || '/images/placeholder.jpg';
  const awayLogo = match.isHome ? match.awayLogoUrl || '/images/placeholder.jpg' : ourLogo;

  return (
    <div className="calendar-card relative flex flex-col border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-[#ee862c]/20">
      <div className="flex flex-col md:flex-row">
        <div className="calendar-card__date flex flex-row md:flex-col items-center justify-center gap-2 p-6 md:w-36 md:border-r border-white/10 bg-white/[0.03]">
          {tbd ? (
            <span className="calendar-card__date-tbd text-sm font-bold uppercase tracking-wider text-gray-500 text-center">
              Дата
              <br />
              уточняется
            </span>
          ) : (
            <>
              <span
                className="calendar-card__date-day text-3xl font-black text-white"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
              >
                {new Date(match.matchDate).getDate()}
              </span>
              <span className="calendar-card__date-month text-sm font-bold uppercase tracking-wider text-gray-400">
                {MONTHS[new Date(match.matchDate).getMonth()].substring(0, 3)}
              </span>
              <span className="calendar-card__date-time flex items-center gap-1 text-xs text-[#ee862c]">
                <FontAwesomeIcon icon={faClock} />
                {new Date(match.matchDate).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </>
          )}
        </div>

        <div className="calendar-card__body flex-1 flex flex-col md:flex-row items-center gap-6 p-6">
          <div className="calendar-card__teams flex items-center gap-6">
            <div className="calendar-card__team flex flex-col items-center gap-2">
              <img
                src={homeLogo}
                alt=""
                className="calendar-card__team-logo h-14 w-14 object-contain opacity-80"
              />
              <span className="calendar-card__team-name text-xs text-gray-400 text-center max-w-[80px] leading-tight line-clamp-2">
                {match.isHome ? 'Динамо-Брест' : match.homeTeam}
              </span>
            </div>

            <span
              className="calendar-card__vs text-3xl font-black text-white/20"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              VS
            </span>

            <div className="calendar-card__team flex flex-col items-center gap-2">
              <img
                src={awayLogo}
                alt=""
                className="calendar-card__team-logo h-14 w-14 object-contain opacity-80"
              />
              <span className="calendar-card__team-name text-xs text-gray-400 text-center max-w-[80px] leading-tight line-clamp-2">
                {match.isHome ? match.awayTeam : 'Динамо-Брест'}
              </span>
            </div>
          </div>

          <div className="calendar-card__info md:ml-auto flex flex-col items-end gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 justify-end">
              {match.tournament && (
                <span className="calendar-card__tournament border border-white/10 px-3 py-1.5 text-gray-400 font-medium uppercase tracking-wider">
                  {match.tournament}
                </span>
              )}
              {match.round && (
                <span className="calendar-card__round border border-white/10 px-3 py-1.5 text-[#ee862c]">
                  {match.round} тур
                </span>
              )}
            </div>
            <div className="calendar-card__stadium">
              <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
            </div>
          </div>
        </div>
      </div>

      {match.ticketUrl && (
        <div className="calendar-card__tickets w-full border-t border-white/10">
          <a
            href={match.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#ee862c] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
          >
            <FontAwesomeIcon icon={faTicketAlt} className="text-xs" />
            Купить билет
          </a>
        </div>
      )}
    </div>
  );
}
