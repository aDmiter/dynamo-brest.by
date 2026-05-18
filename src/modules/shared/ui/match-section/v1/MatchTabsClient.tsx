// Version 1 — в стиле календаря/состава, позиции в таблице по clubId
'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faTable,
  faTicket,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import CountdownTimer from './CountdownTimer';
import MatchClubBadge from './MatchClubBadge';
import MatchStadiumButton from '../../MatchStadiumButton';
import {
  MATCH_TABS,
  type MatchData,
  type MatchTabKey,
  type MatchTabsClientProps,
  type TeamMatches,
  type TeamStandingsBundle,
} from '../types';
import {
  getCompetitionColor,
  getDynamoClubId,
  getMatchDisplay,
  getMatchOutcome,
  getOpponentClubId,
  getResultBorderClass,
  getTablePositionForClub,
  MATCH_OUTCOME_LABEL,
} from '../utils';

const TEAM_LINKS: Record<MatchTabKey, string> = {
  osnova: '/team/main/calendar',
  dubl: '/team/reserve/calendar',
  women: '/team/women/calendar',
};

const TEAM_TABLE_LINKS: Record<MatchTabKey, string> = {
  osnova: '/team/main/table',
  dubl: '/team/reserve/table',
  women: '/team/women/table',
};

function formatMatchDate(iso: string, withTime: boolean) {
  const d = new Date(iso);
  const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const months = [
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
  const date = `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} · ${time}`;
}

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function MatchCardShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <article
      className={`home-match__card ${className}`.trim()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      data-hover={hov ? 'true' : 'false'}
    >
      {children}
    </article>
  );
}

function NextMatchCard({
  match,
  homeLogo,
  awayLogo,
  homeTeam,
  awayTeam,
  standings,
}: {
  match: MatchData;
  homeLogo: string;
  awayLogo: string;
  homeTeam: string;
  awayTeam: string;
  standings: TeamStandingsBundle | null;
}) {
  const compColor = getCompetitionColor(match.tournament);
  const homeClubId = match.isHome ? getDynamoClubId(match) : getOpponentClubId(match);
  const awayClubId = match.isHome ? getOpponentClubId(match) : getDynamoClubId(match);

  return (
    <MatchCardShell className="home-match__card--next">
      <div className="home-match__card-body">
        <div className="home-match__meta">
          <span className="home-match__tag">Следующий матч</span>
          {match.tournament && (
            <span className="home-match__tournament" style={{ color: compColor }}>
              {match.tournament}
            </span>
          )}
          {match.round && <span className="home-match__round">{match.round} тур</span>}
        </div>

        <div className="home-match__teams">
          <MatchClubBadge
            name={homeTeam}
            logoUrl={homeLogo}
            tablePosition={getTablePositionForClub(standings, homeClubId)}
            highlight={match.isHome}
            align="right"
          />
          <div className="home-match__center">
            <span className="home-match__kickoff">{formatKickoff(match.matchDate)}</span>
            <span className="home-match__kickoff-label">до матча</span>
            <CountdownTimer targetDate={new Date(match.matchDate)} compact />
          </div>
          <MatchClubBadge
            name={awayTeam}
            logoUrl={awayLogo}
            tablePosition={getTablePositionForClub(standings, awayClubId)}
            highlight={!match.isHome}
            align="left"
          />
        </div>

        <p className="home-match__date">
          <FontAwesomeIcon icon={faCalendarAlt} />
          {formatMatchDate(match.matchDate, true)}
        </p>
      </div>

      <footer className="home-match__footer">
        <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
        {match.ticketUrl ? (
          <a
            href={match.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="home-match__ticket"
          >
            <FontAwesomeIcon icon={faTicket} />
            Билеты
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </a>
        ) : null}
      </footer>
    </MatchCardShell>
  );
}

function LastMatchCard({
  match,
  homeLogo,
  awayLogo,
  homeTeam,
  awayTeam,
  resultClass,
  standings,
}: {
  match: MatchData;
  homeLogo: string;
  awayLogo: string;
  homeTeam: string;
  awayTeam: string;
  resultClass: string;
  standings: TeamStandingsBundle | null;
}) {
  const outcome = getMatchOutcome(match);
  const compColor = getCompetitionColor(match.tournament);
  const homeClubId = match.isHome ? getDynamoClubId(match) : getOpponentClubId(match);
  const awayClubId = match.isHome ? getOpponentClubId(match) : getDynamoClubId(match);
  const dynamo = standings?.dynamo;

  return (
    <MatchCardShell className={`home-match__card--last ${resultClass}`}>
      <div className="home-match__card-body">
        <div className="home-match__meta home-match__meta--split">
          <div>
            <span className="home-match__tag">Последний результат</span>
            {match.tournament && (
              <span className="home-match__tournament" style={{ color: compColor }}>
                {match.tournament}
              </span>
            )}
            {match.round && <span className="home-match__round">{match.round} тур</span>}
          </div>
          {outcome && (
            <span className={`home-match__outcome home-match__outcome--${outcome}`}>
              {MATCH_OUTCOME_LABEL[outcome]}
            </span>
          )}
        </div>

        <div className="home-match__teams">
          <MatchClubBadge
            name={homeTeam}
            logoUrl={homeLogo}
            tablePosition={getTablePositionForClub(standings, homeClubId)}
            highlight={match.isHome}
            align="right"
          />
          <div className="home-match__center home-match__center--score">
            <span className="home-match__score">
              {match.homeScore ?? '—'}
              <span className="home-match__score-colon">:</span>
              {match.awayScore ?? '—'}
            </span>
            <span className="home-match__kickoff-label">финальный счёт</span>
          </div>
          <MatchClubBadge
            name={awayTeam}
            logoUrl={awayLogo}
            tablePosition={getTablePositionForClub(standings, awayClubId)}
            highlight={!match.isHome}
            align="left"
          />
        </div>

        <div className="home-match__facts">
          <span>
            <FontAwesomeIcon icon={faCalendarAlt} />
            {formatMatchDate(match.matchDate, false)}
          </span>
          <span>{match.isHome ? 'Дома' : 'Выезд'}</span>
          {dynamo && (
            <span>
              <FontAwesomeIcon icon={faTable} />
              Сезон: {dynamo.points} очк. · {dynamo.position} место
            </span>
          )}
          {match.attendance != null && (
            <span>
              <FontAwesomeIcon icon={faUsers} />
              {match.attendance.toLocaleString('ru-RU')} зрителей
            </span>
          )}
        </div>
      </div>

      <footer className="home-match__footer">
        {match.stadium ? (
          <span className="home-match__stadium">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            {match.stadium}
          </span>
        ) : (
          <MatchStadiumButton facilityId={match.facilityId} stadiumName={match.stadium} />
        )}
      </footer>
    </MatchCardShell>
  );
}

function TeamPanel({
  tab,
  data,
  standings,
}: {
  tab: (typeof MATCH_TABS)[number];
  data: TeamMatches;
  standings: TeamStandingsBundle | null;
}) {
  const nextDisplay = getMatchDisplay(data.next, data.nextOppLogo);
  const lastDisplay = getMatchDisplay(data.last, data.lastOppLogo);
  const resultClass = getResultBorderClass(data.last);
  const dynamo = standings?.dynamo;

  return (
    <div className="home-match__panel">
      <div className="home-match__panel-head">
        <div>
          <p className="home-match__panel-label">{tab.label}</p>
          {dynamo && (
            <p className="home-match__panel-standings">
              <Link href={TEAM_TABLE_LINKS[tab.key]} className="home-match__panel-standings-link">
                <FontAwesomeIcon icon={faTable} className="mr-1 text-[10px]" />
                {dynamo.position} место · {dynamo.points} очков
              </Link>
              <span className="home-match__panel-record">
                {dynamo.wins}В {dynamo.draws}Н {dynamo.losses}П
              </span>
            </p>
          )}
        </div>
        <Link href={TEAM_LINKS[tab.key]} className="home-match__panel-link">
          <FontAwesomeIcon icon={faCalendarAlt} />
          Календарь
        </Link>
      </div>

      <div className="home-match__cards">
        {data.next && nextDisplay ? (
          <NextMatchCard
            match={data.next}
            homeLogo={nextDisplay.homeLogo}
            awayLogo={nextDisplay.awayLogo}
            homeTeam={nextDisplay.homeTeam}
            awayTeam={nextDisplay.awayTeam}
            standings={standings}
          />
        ) : (
          <div className="home-match__card home-match__card--empty">Нет запланированных матчей</div>
        )}

        {data.last && lastDisplay ? (
          <LastMatchCard
            match={data.last}
            homeLogo={lastDisplay.homeLogo}
            awayLogo={lastDisplay.awayLogo}
            homeTeam={lastDisplay.homeTeam}
            awayTeam={lastDisplay.awayTeam}
            resultClass={resultClass}
            standings={standings}
          />
        ) : (
          <div className="home-match__card home-match__card--empty">Нет сыгранных матчей</div>
        )}
      </div>
    </div>
  );
}

export default function MatchTabsClientV1({ matches, standings = {} }: MatchTabsClientProps) {
  const [activeTab, setActiveTab] = useState<MatchTabKey>('osnova');

  const hasAny = MATCH_TABS.some((t) => matches[t.key].next || matches[t.key].last);
  const activeTabMeta = MATCH_TABS.find((t) => t.key === activeTab)!;

  return (
    <section className="home-match">
      <div className="home-match__inner">
        <header className="home-match__hero">
          <p className="home-match__hero-sub">ФК Динамо-Брест</p>
          <h2 className="home-match__hero-title">Матчи</h2>
          <span className="home-match__hero-watermark" aria-hidden>
            МАТЧИ
          </span>
        </header>

        {!hasAny ? (
          <div className="home-match__card home-match__card--empty home-match__card--wide">
            Нет данных о матчах
          </div>
        ) : (
          <>
            <div className="home-match__tabs" role="tablist" aria-label="Составы команды">
              {MATCH_TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`home-match__tab${active ? ' home-match__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.short}
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" aria-label={activeTabMeta.label}>
              <TeamPanel
                tab={activeTabMeta}
                data={matches[activeTab]}
                standings={standings[activeTab] ?? null}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
