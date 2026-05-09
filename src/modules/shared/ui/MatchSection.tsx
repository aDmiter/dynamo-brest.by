// src/modules/shared/ui/MatchSection.tsx - Секция матчей (glassmorphism)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faMapMarkerAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import CountdownTimer from './CountdownTimer';

const nextMatch = {
  competition: 'ВЫСШАЯ ЛИГА 2026',
  round: 'Тур 24',
  date: new Date('2026-05-15T19:00:00'),
  homeTeam: {
    name: 'Динамо-Брест',
    logo: '/images/logos/logo-white.png',
  },
  awayTeam: {
    name: 'Шахтёр',
    logo: '/images/logos/logo-mc.png',
  },
  stadium: 'ОСК «Брестский»',
};

const lastMatch = {
  competition: 'ВЫСШАЯ ЛИГА 2026',
  round: 'Тур 23',
  date: new Date('2026-05-10T17:00:00'),
  homeTeam: {
    name: 'Динамо-Брест',
    logo: '/images/logos/logo-white.png',
  },
  awayTeam: {
    name: 'Неман',
    logo: '/images/logos/logo-mc.png',
  },
  score: { home: 2, away: 1 },
  stadium: 'ОСК «Брестский»',
};

function getResultColor(homeScore: number, awayScore: number): string {
  if (homeScore > awayScore) return 'border-t-[#22c55e]';
  if (homeScore === awayScore) return 'border-t-[#f0ac74]';
  return 'border-t-[#ef4444]';
}

export default function MatchSection() {
  const resultBorderColor = getResultColor(lastMatch.score.home, lastMatch.score.away);

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
          <div className="match__card relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 overflow-hidden">
            <div
              className="match__card-bg-logo match__card-bg-logo--home absolute pointer-events-none"
              style={{ left: '0%', top: '70%', transform: 'translate(-50%, -50%)' }}
            >
              <img
                src={nextMatch.homeTeam.logo}
                alt=""
                className="h-72 w-auto md:h-96 max-w-none opacity-20"
              />
            </div>
            <div
              className="match__card-bg-logo match__card-bg-logo--away absolute pointer-events-none"
              style={{ right: '0%', top: '70%', transform: 'translate(50%, -50%)' }}
            >
              <img
                src={nextMatch.awayTeam.logo}
                alt=""
                className="h-72 w-auto md:h-96 max-w-none opacity-20"
              />
            </div>

            <div className="match__team match__team--home absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
              <span
                className="match__team-name text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                style={{
                  writingMode: 'vertical-lr',
                  transform: 'rotate(180deg)',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 900,
                }}
              >
                {nextMatch.homeTeam.name}
              </span>
            </div>
            <div className="match__team match__team--away absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
              <span
                className="match__team-name text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                style={{
                  writingMode: 'vertical-lr',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 900,
                }}
              >
                {nextMatch.awayTeam.name}
              </span>
            </div>

            <div className="match__card-header relative z-10 flex items-start justify-between">
              <div className="match__competition">
                <p className="match__competition-name text-xs font-bold uppercase tracking-[0.2em] text-[#ee862c]">
                  {nextMatch.competition}
                </p>
                <p className="match__competition-round mt-1 text-sm font-medium text-white/60">
                  {nextMatch.round}
                </p>
              </div>
              <p className="match__date flex items-center gap-2 text-right text-sm text-white/70">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="match__date-icon text-xs text-[#ee862c]"
                />
                <span className="match__date-text">
                  {nextMatch.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}{' '}
                  2026 |{' '}
                  {nextMatch.date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>

            <div className="match__divider relative z-10 mt-8 h-[1px] w-full bg-white/10" />

            <div className="match__teams-mobile relative z-10 flex items-center justify-center gap-8 md:hidden">
              <span
                className="match__team-name text-base uppercase text-[#a5b3d5]"
                style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
              >
                {nextMatch.homeTeam.name}
              </span>
              <span className="match__teams-divider">
                <img src="/images/vs.png" alt="VS" className="w-8 h-auto opacity-40" />
              </span>
              <span
                className="match__team-name text-base uppercase text-[#a5b3d5]"
                style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
              >
                {nextMatch.awayTeam.name}
              </span>
            </div>

            <div className="match__countdown relative z-10 mt-8 flex justify-center">
              <CountdownTimer targetDate={nextMatch.date} />
            </div>

            <div className="match__teams-vs relative z-10 mt-8 hidden items-center justify-center md:flex">
              <img src="/images/vs.png" alt="VS" className="w-16 h-auto opacity-40" />
            </div>

            <div className="match__divider relative z-10 mt-10 h-[1px] w-full bg-white/10" />

            <div className="match__card-footer relative z-10 mt-6 flex items-center justify-between">
              <button className="match__stadium flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-[#ee862c]">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{nextMatch.stadium}</span>
              </button>
              <button className="match__action match__action--tickets inline-flex items-center gap-2 bg-[#ee862c] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#f0ac74]">
                БИЛЕТЫ <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>

        {/* ========== LAST MATCH ========== */}
        <div className="match__last flex flex-1 items-center justify-center p-8 md:p-12">
          <div
            className={`match__card relative flex w-full max-w-[560px] flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 overflow-hidden border-t-[6px] ${resultBorderColor}`}
          >
            <div
              className="match__card-bg-logo match__card-bg-logo--home absolute pointer-events-none"
              style={{ left: '0%', top: '70%', transform: 'translate(-50%, -50%)' }}
            >
              <img
                src={lastMatch.homeTeam.logo}
                alt=""
                className="h-72 w-auto md:h-96 max-w-none opacity-20"
              />
            </div>
            <div
              className="match__card-bg-logo match__card-bg-logo--away absolute pointer-events-none"
              style={{ right: '0%', top: '70%', transform: 'translate(50%, -50%)' }}
            >
              <img
                src={lastMatch.awayTeam.logo}
                alt=""
                className="h-72 w-auto md:h-96 max-w-none opacity-20"
              />
            </div>

            <div className="match__team match__team--home absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
              <span
                className="match__team-name text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                style={{
                  writingMode: 'vertical-lr',
                  transform: 'rotate(180deg)',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 900,
                }}
              >
                {lastMatch.homeTeam.name}
              </span>
            </div>
            <div className="match__team match__team--away absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center">
              <span
                className="match__team-name text-sm uppercase tracking-[0.3em] text-[#a5b3d5]"
                style={{
                  writingMode: 'vertical-lr',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 900,
                }}
              >
                {lastMatch.awayTeam.name}
              </span>
            </div>

            <div className="match__card-header relative z-10 flex items-start justify-between">
              <div className="match__competition">
                <p className="match__competition-name text-xs font-bold uppercase tracking-[0.2em] text-[#ee862c]">
                  {lastMatch.competition}
                </p>
                <p className="match__competition-round mt-1 text-sm font-medium text-white/60">
                  {lastMatch.round}
                </p>
              </div>
              <p className="match__date flex items-center gap-2 text-right text-sm text-white/70">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="match__date-icon text-xs text-[#ee862c]"
                />
                <span className="match__date-text">
                  {lastMatch.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}{' '}
                  2026 |{' '}
                  {lastMatch.date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>

            <div className="match__divider relative z-10 mt-8 h-[1px] w-full bg-white/10" />

            <div className="match__teams-mobile relative z-10 flex items-center justify-center gap-8 md:hidden">
              <span
                className="match__team-name text-base uppercase text-[#a5b3d5]"
                style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
              >
                {lastMatch.homeTeam.name}
              </span>
              <span className="match__teams-divider">
                <img src="/images/vs.png" alt="VS" className="w-8 h-auto opacity-40" />
              </span>
              <span
                className="match__team-name text-base uppercase text-[#a5b3d5]"
                style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
              >
                {lastMatch.awayTeam.name}
              </span>
            </div>

            {/* Счет */}
            <div className="match__score relative z-10 mt-8 flex justify-center">
              <div className="match__score-numbers flex items-center gap-4">
                <span
                  className="match__score-home text-7xl text-white md:text-[120px] leading-none"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                >
                  {lastMatch.score.home}
                </span>
                <span
                  className="match__score-colon text-4xl text-white/10 md:text-5xl"
                  style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 200 }}
                >
                  :
                </span>
                <span
                  className="match__score-away text-7xl text-white md:text-[120px] leading-none"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                >
                  {lastMatch.score.away}
                </span>
              </div>
            </div>

            <div className="match__divider relative z-10 mt-10 h-[1px] w-full bg-white/10" />

            <div className="match__card-footer relative z-10 mt-6 flex items-center justify-between">
              <button className="match__stadium flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-[#ee862c]">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{lastMatch.stadium}</span>
              </button>
              <button className="match__action match__action--report inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#ee862c] hover:text-[#ee862c]">
                ПРОТОКОЛ <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </button>
            </div>
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
