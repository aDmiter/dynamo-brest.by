// src/modules/shared/ui/MatchSection.tsx - Секция матчей (glassmorphism, динамические данные)
import { prisma } from '@/lib/prisma';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faMapMarkerAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import CountdownTimer from './CountdownTimer';
import MatchStadiumButton from './MatchStadiumButton.tsx';

function getResultColor(homeScore: number, awayScore: number, isHome: boolean): string {
  const ourScore = isHome ? homeScore : awayScore;
  const theirScore = isHome ? awayScore : homeScore;
  if (ourScore > theirScore) return 'border-t-[#22c55e]';
  if (ourScore === theirScore) return 'border-t-[#f0ac74]';
  return 'border-t-[#ef4444]';
}

async function getOpponentLogo(teamId: number | null) {
  if (!teamId) return null;
  const opp = await prisma.opponentTeam.findUnique({ where: { cometId: teamId } });
  return opp?.logoUrl || null;
}

export default async function MatchSection() {
  const nextMatch = await prisma.match.findFirst({
    where: { matchType: 'osnova', status: 'scheduled', matchDate: { gt: new Date('2000-01-01') } },
    orderBy: { matchDate: 'asc' },
  });

  const lastMatch = await prisma.match.findFirst({
    where: { matchType: 'osnova', status: 'finished' },
    orderBy: { matchDate: 'desc' },
  });

  if (!nextMatch && !lastMatch) return null;

  const ourLogo = '/images/logos/logo-white.png';

  const nextOppId = nextMatch
    ? nextMatch.isHome
      ? nextMatch.awayTeamId
      : nextMatch.homeTeamId
    : null;
  const lastOppId = lastMatch
    ? lastMatch.isHome
      ? lastMatch.awayTeamId
      : lastMatch.homeTeamId
    : null;

  const [nextOppLogo, lastOppLogo] = await Promise.all([
    getOpponentLogo(nextOppId),
    getOpponentLogo(lastOppId),
  ]);

  // NEXT MATCH
  const nextHomeLogo = nextMatch?.isHome ? ourLogo : nextOppLogo || ourLogo;
  const nextAwayLogo = nextMatch?.isHome ? nextOppLogo || '/images/placeholder.jpg' : ourLogo;
  const nextHomeTeam = nextMatch?.isHome ? 'Динамо-Брест' : nextMatch?.homeTeam || '';
  const nextAwayTeam = nextMatch?.isHome ? nextMatch?.awayTeam || '' : 'Динамо-Брест';

  // LAST MATCH
  const lastHomeLogo = lastMatch?.isHome ? ourLogo : lastOppLogo || ourLogo;
  const lastAwayLogo = lastMatch?.isHome ? lastOppLogo || '/images/placeholder.jpg' : ourLogo;
  const lastHomeTeam = lastMatch?.isHome ? 'Динамо-Брест' : lastMatch?.homeTeam || '';
  const lastAwayTeam = lastMatch?.isHome ? lastMatch?.awayTeam || '' : 'Динамо-Брест';

  const resultBorderColor =
    lastMatch && lastMatch.homeScore !== null && lastMatch.awayScore !== null
      ? getResultColor(lastMatch.homeScore, lastMatch.awayScore, lastMatch.isHome)
      : 'border-t-gray-600';

  return (
    <section className="match relative flex min-h-screen flex-col md:flex-row">
      <div className="match__background absolute inset-0">
        <img
          src="/images/stadium.jpg"
          alt=""
          className="match__background-image h-full w-full object-cover"
        />
        <div className="match__background-overlay absolute inset-0 bg-[#0B0F1C]/85" />
      </div>

      <div className="match__container relative flex w-full flex-col md:flex-row mx-auto max-w-[1200px]">
        {/* ========== NEXT MATCH ========== */}
        <div className="match__next flex flex-1 items-center justify-center p-8 md:p-12">
          {nextMatch ? (
            <div className="match__card relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 overflow-hidden">
              <div
                className="match__card-bg-logo absolute pointer-events-none"
                style={{ left: '0%', top: '70%', transform: 'translate(-50%, -50%)' }}
              >
                <img
                  src={nextHomeLogo}
                  alt=""
                  className="h-72 w-auto md:h-96 max-w-none opacity-20"
                />
              </div>
              <div
                className="match__card-bg-logo absolute pointer-events-none"
                style={{ right: '0%', top: '70%', transform: 'translate(50%, -50%)' }}
              >
                <img
                  src={nextAwayLogo}
                  alt=""
                  className="h-72 w-auto md:h-96 max-w-none opacity-20"
                />
              </div>

              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
                <span
                  className="text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                  style={{
                    writingMode: 'vertical-lr',
                    transform: 'rotate(180deg)',
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 900,
                  }}
                >
                  {nextHomeTeam}
                </span>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
                <span
                  className="text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                  style={{
                    writingMode: 'vertical-lr',
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 900,
                  }}
                >
                  {nextAwayTeam}
                </span>
              </div>

              <div className="match__card-header relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ee862c]">
                    {nextMatch.tournament || 'ТОВАРИЩЕСКИЙ МАТЧ'}
                  </p>
                  {nextMatch.round && (
                    <p className="mt-1 text-sm font-medium text-white/60">{nextMatch.round} тур</p>
                  )}
                </div>
                <p className="flex items-center gap-2 text-right text-sm text-white/70">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-[#ee862c]" />
                  {new Date(nextMatch.matchDate).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {' | '}
                  {new Date(nextMatch.matchDate).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="mt-8 h-[1px] w-full bg-white/10" />
              <div className="mt-8 flex items-center justify-center gap-8 md:hidden">
                <span
                  className="text-base uppercase text-[#a5b3d5]"
                  style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
                >
                  {nextHomeTeam}
                </span>
                <img src="/images/vs.png" alt="VS" className="w-8 h-auto opacity-40" />
                <span
                  className="text-base uppercase text-[#a5b3d5]"
                  style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
                >
                  {nextAwayTeam}
                </span>
              </div>

              <div className="mt-8 flex justify-center">
                <CountdownTimer targetDate={new Date(nextMatch.matchDate)} />
              </div>

              <div className="mt-8 hidden items-center justify-center md:flex">
                <img src="/images/vs.png" alt="VS" className="w-16 h-auto opacity-40" />
              </div>

              <div className="mt-10 h-[1px] w-full bg-white/10" />
              <div className="mt-6 flex items-center justify-between">
                <MatchStadiumButton
                  facilityId={nextMatch.facilityId}
                  stadiumName={nextMatch.stadium}
                />
                <button className="inline-flex items-center gap-2 bg-[#ee862c] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74]">
                  БИЛЕТЫ <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="match__card relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 items-center justify-center">
              <p className="text-gray-500 text-lg">Нет запланированных матчей</p>
            </div>
          )}
        </div>

        {/* ========== LAST MATCH ========== */}
        <div className="match__last flex flex-1 items-center justify-center p-8 md:p-12">
          {lastMatch ? (
            <div
              className={`match__card relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 overflow-hidden border-t-[6px] ${resultBorderColor}`}
            >
              <div
                className="match__card-bg-logo absolute pointer-events-none"
                style={{ left: '0%', top: '70%', transform: 'translate(-50%, -50%)' }}
              >
                <img
                  src={lastHomeLogo}
                  alt=""
                  className="h-72 w-auto md:h-96 max-w-none opacity-20"
                />
              </div>
              <div
                className="match__card-bg-logo absolute pointer-events-none"
                style={{ right: '0%', top: '70%', transform: 'translate(50%, -50%)' }}
              >
                <img
                  src={lastAwayLogo}
                  alt=""
                  className="h-72 w-auto md:h-96 max-w-none opacity-20"
                />
              </div>

              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
                <span
                  className="text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                  style={{
                    writingMode: 'vertical-lr',
                    transform: 'rotate(180deg)',
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 900,
                  }}
                >
                  {lastHomeTeam}
                </span>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
                <span
                  className="text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                  style={{
                    writingMode: 'vertical-lr',
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 900,
                  }}
                >
                  {lastAwayTeam}
                </span>
              </div>

              <div className="match__card-header relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ee862c]">
                    {lastMatch.tournament || 'ТОВАРИЩЕСКИЙ МАТЧ'}
                  </p>
                  {lastMatch.round && (
                    <p className="mt-1 text-sm font-medium text-white/60">{lastMatch.round} тур</p>
                  )}
                </div>
                <p className="flex items-center gap-2 text-right text-sm text-white/70">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-[#ee862c]" />
                  {new Date(lastMatch.matchDate).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="mt-8 h-[1px] w-full bg-white/10" />

              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-4">
                  <span
                    className="text-7xl text-white md:text-[120px] leading-none"
                    style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                  >
                    {lastMatch.homeScore ?? '—'}
                  </span>
                  <span className="text-4xl text-white/10 md:text-5xl">:</span>
                  <span
                    className="text-7xl text-white md:text-[120px] leading-none"
                    style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                  >
                    {lastMatch.awayScore ?? '—'}
                  </span>
                </div>
              </div>

              <div className="mt-10 h-[1px] w-full bg-white/10" />
              <div className="mt-6 flex items-center justify-between">
                <MatchStadiumButton
                  facilityId={lastMatch.facilityId}
                  stadiumName={lastMatch.stadium}
                />
                <button className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:border-[#ee862c] hover:text-[#ee862c]">
                  ПРОТОКОЛ <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="match__card relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 items-center justify-center">
              <p className="text-gray-500 text-lg">Нет сыгранных матчей</p>
            </div>
          )}
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
