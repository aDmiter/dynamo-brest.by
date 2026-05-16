import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faFutbol, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {
  buildOpponentTeamMap,
  DYNAMO_BREST_DISPLAY_NAME,
  resolveMatchTeamNames,
} from '@/modules/team/lib/resolve-match-teams';
import { formatMatchDateTime } from '@/lib/format-match-datetime';

export type UpcomingMatchCard = {
  teamLabel: string;
  calendarHref: string;
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    isHome: boolean;
    matchDate: Date;
    tournament: string | null;
    round: string | null;
    stadium: string | null;
  } | null;
};

interface DashboardUpcomingMatchesProps {
  cards: UpcomingMatchCard[];
}

export default function DashboardUpcomingMatches({ cards }: DashboardUpcomingMatchesProps) {
  return (
    <section className="mb-8 border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.22em] text-[#ee862c]/90">
            Календарь
          </p>
          <h2
            className="font-heading text-xl font-bold text-white md:text-2xl"
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
          >
            Ближайшие матчи
          </h2>
        </div>
        <Link
          href="/admin/matches/calendar/osnovnoy-sostav"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-[#ee862c]"
        >
          Все календари
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const { dateLabel, timeLabel, isTbd } = card.match
            ? formatMatchDateTime(card.match.matchDate)
            : { dateLabel: '', timeLabel: null, isTbd: false };

          return (
            <article
              key={card.teamLabel}
              className="flex flex-col border border-white/10 bg-[#1a1f2e]/80 p-5 transition-colors hover:border-white/20"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
                  <FontAwesomeIcon icon={faFutbol} className="text-[#ee862c]/80" />
                  {card.teamLabel}
                </span>
                <Link
                  href={card.calendarHref}
                  className="text-xs text-gray-500 transition-colors hover:text-[#ee862c]"
                  title="Календарь состава"
                >
                  <FontAwesomeIcon icon={faCalendarDays} />
                </Link>
              </div>

              {card.match ? (
                <>
                  <div className="mb-3">
                    <p
                      className={`text-sm font-medium ${isTbd ? 'text-gray-400' : 'text-[#ee862c]'}`}
                    >
                      {dateLabel}
                    </p>
                    {timeLabel && (
                      <p className="mt-0.5 text-2xl font-bold tabular-nums text-white">{timeLabel}</p>
                    )}
                  </div>

                  <p className="mb-1 text-base font-semibold leading-snug text-white">
                    {card.match.homeTeam}
                    <span className="mx-1.5 font-normal text-gray-500">—</span>
                    {card.match.awayTeam}
                  </p>
                  <p className="mb-3 text-xs text-gray-500">
                    {card.match.isHome ? 'Домашний матч' : 'Выездной матч'}
                  </p>

                  {(card.match.tournament || card.match.round) && (
                    <p className="mb-3 line-clamp-2 text-xs text-gray-400">
                      {[card.match.tournament, card.match.round].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {card.match.stadium && (
                    <p className="mb-4 line-clamp-1 text-xs text-gray-500">{card.match.stadium}</p>
                  )}

                  <Link
                    href={`/admin/matches/${card.match.id}/edit`}
                    className="mt-auto inline-flex items-center gap-2 text-sm text-[#ee862c] transition-colors hover:text-[#f0ac74]"
                  >
                    Редактировать матч
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </Link>
                </>
              ) : (
                <div className="flex flex-1 flex-col justify-center py-4">
                  <p className="text-sm text-gray-500">Нет запланированных матчей</p>
                  <Link
                    href={card.calendarHref}
                    className="mt-3 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                  >
                    Открыть календарь
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
