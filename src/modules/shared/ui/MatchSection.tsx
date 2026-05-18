// src/modules/shared/ui/MatchSection.tsx - Секция матчей с вкладками (glassmorphism)
import { prisma } from '@/lib/prisma';
import { getHomeMatchStandings } from '@/lib/standings';
import { withDb } from '@/lib/with-db';
import MatchTabsClient from './MatchTabsClient';
import type { MatchTabsClientProps } from './match-section/types';
import {
  buildOpponentTeamMap,
  resolveMatchTeamNames,
} from '@/modules/team/lib/resolve-match-teams';

interface SerializedMatch {
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

const EMPTY_TEAM_MATCHES = {
  next: null,
  last: null,
  nextOppLogo: null,
  lastOppLogo: null,
};

const EMPTY_MATCHES: MatchTabsClientProps['matches'] = {
  osnova: { ...EMPTY_TEAM_MATCHES },
  dubl: { ...EMPTY_TEAM_MATCHES },
  women: { ...EMPTY_TEAM_MATCHES },
};

async function loadMatchSectionData(): Promise<{
  matches: MatchTabsClientProps['matches'];
  standings: MatchTabsClientProps['standings'];
}> {
  const now = new Date();

  const [osnovaNext, osnovaLast, dublNext, dublLast, womenNext, womenLast] = await Promise.all([
    // Основной состав — следующий матч (только будущие)
    prisma.match.findFirst({
      where: {
        matchType: 'osnova',
        status: 'scheduled',
        matchDate: { gte: now },
      },
      orderBy: { matchDate: 'asc' },
    }),
    // Основной состав — последний сыгранный
    prisma.match.findFirst({
      where: { matchType: 'osnova', status: 'finished' },
      orderBy: { matchDate: 'desc' },
    }),
    // Дубль — следующий матч
    prisma.match.findFirst({
      where: {
        matchType: 'dubl',
        status: 'scheduled',
        matchDate: { gte: now },
      },
      orderBy: { matchDate: 'asc' },
    }),
    // Дубль — последний сыгранный
    prisma.match.findFirst({
      where: { matchType: 'dubl', status: 'finished' },
      orderBy: { matchDate: 'desc' },
    }),
    // Женская — следующий матч
    prisma.match.findFirst({
      where: {
        matchType: 'women',
        status: 'scheduled',
        matchDate: { gte: now },
      },
      orderBy: { matchDate: 'asc' },
    }),
    // Женская — последний сыгранный
    prisma.match.findFirst({
      where: { matchType: 'women', status: 'finished' },
      orderBy: { matchDate: 'desc' },
    }),
  ]);

  console.log('📊 Матчи для главной:', {
    osnova: { next: osnovaNext?.id, last: osnovaLast?.id },
    dubl: { next: dublNext?.id, nextDate: dublNext?.matchDate, last: dublLast?.id },
    women: { next: womenNext?.id, nextDate: womenNext?.matchDate, last: womenLast?.id },
  });

  // Собираем все ID соперников для логотипов
  const allMatches = [osnovaNext, osnovaLast, dublNext, dublLast, womenNext, womenLast];
  const opponentIds = new Set<number>();
  for (const match of allMatches) {
    if (match) {
      if (match.homeTeamId) opponentIds.add(match.homeTeamId);
      if (match.awayTeamId) opponentIds.add(match.awayTeamId);
    }
  }

  const opponents = await prisma.opponentTeam.findMany({
    where: {
      isActive: true,
      OR: [
        { cometId: { in: Array.from(opponentIds) } },
        { cometId: { in: [68812, 102734, 101132] } },
      ],
    },
    select: { cometId: true, name: true, logoUrl: true },
  });

  const opponentMap = buildOpponentTeamMap(opponents);
  const logoMap = new Map<number, string | null>();
  for (const [id, row] of Object.entries(opponentMap)) {
    logoMap.set(Number(id), row.logoUrl);
  }

  const getOpponentLogo = (teamId: number | null) => {
    if (!teamId) return null;
    return logoMap.get(teamId) || null;
  };

  const serializeMatch = (match: typeof osnovaNext): SerializedMatch | null => {
    if (!match) return null;
    const { homeTeam, awayTeam } = resolveMatchTeamNames(match, opponentMap);
    return {
      id: match.id,
      homeTeam,
      awayTeam,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      matchDate: match.matchDate.toISOString(),
      stadium: match.stadium,
      facilityId: match.facilityId,
      tournament: match.tournament,
      round: match.round,
      status: match.status,
      isHome: match.isHome,
      matchType: match.matchType,
      attendance: match.attendance,
      ticketUrl: match.ticketUrl,
    };
  };

  const serializedMatches = {
    osnova: {
      next: serializeMatch(osnovaNext),
      last: serializeMatch(osnovaLast),
      nextOppLogo: osnovaNext
        ? getOpponentLogo(osnovaNext.isHome ? osnovaNext.awayTeamId : osnovaNext.homeTeamId)
        : null,
      lastOppLogo: osnovaLast
        ? getOpponentLogo(osnovaLast.isHome ? osnovaLast.awayTeamId : osnovaLast.homeTeamId)
        : null,
    },
    dubl: {
      next: serializeMatch(dublNext),
      last: serializeMatch(dublLast),
      nextOppLogo: dublNext
        ? getOpponentLogo(dublNext.isHome ? dublNext.awayTeamId : dublNext.homeTeamId)
        : null,
      lastOppLogo: dublLast
        ? getOpponentLogo(dublLast.isHome ? dublLast.awayTeamId : dublLast.homeTeamId)
        : null,
    },
    women: {
      next: serializeMatch(womenNext),
      last: serializeMatch(womenLast),
      nextOppLogo: womenNext
        ? getOpponentLogo(womenNext.isHome ? womenNext.awayTeamId : womenNext.homeTeamId)
        : null,
      lastOppLogo: womenLast
        ? getOpponentLogo(womenLast.isHome ? womenLast.awayTeamId : womenLast.homeTeamId)
        : null,
    },
  };

  const standings = await getHomeMatchStandings();

  return { matches: serializedMatches, standings };
}

export default async function MatchSection() {
  const data = await withDb(() => loadMatchSectionData(), null, 'matchSection');

  if (!data) {
    return <MatchTabsClient matches={EMPTY_MATCHES} standings={{}} />;
  }

  return <MatchTabsClient matches={data.matches} standings={data.standings} />;
}
