// src/lib/get-next-ticket-match.ts — ближайший матч основы с ссылкой на билеты
import { prisma } from '@/lib/prisma';
import {
  buildOpponentTeamMap,
  DYNAMO_BREST_DISPLAY_NAME,
  resolveMatchTeamNames,
} from '@/modules/team/lib/resolve-match-teams';

const OUR_LOGO = '/images/logos/logo-white.png';

export type NextTicketMatch = {
  ticketUrl: string;
  homeLogo: string;
  awayLogo: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
};

export async function getNextMainTicketMatch(): Promise<NextTicketMatch | null> {
  const now = new Date();

  const match = await prisma.match.findFirst({
    where: {
      matchType: 'osnova',
      status: 'scheduled',
      matchDate: { gte: now },
      ticketUrl: { not: null },
    },
    orderBy: { matchDate: 'asc' },
  });

  if (!match?.ticketUrl?.trim()) {
    return null;
  }

  const opponentTeams = await prisma.opponentTeam.findMany({
    where: { isActive: true },
    select: { cometId: true, name: true, logoUrl: true },
  });

  const opponentMap = buildOpponentTeamMap(opponentTeams);
  const { homeTeam, awayTeam } = resolveMatchTeamNames(
    match,
    DYNAMO_BREST_DISPLAY_NAME,
    opponentMap,
  );

  const oppId = match.isHome ? match.awayTeamId : match.homeTeamId;
  const oppLogo =
    (oppId != null && opponentMap[oppId]?.logoUrl) || '/images/placeholder.jpg';

  return {
    ticketUrl: match.ticketUrl.trim(),
    homeLogo: match.isHome ? OUR_LOGO : oppLogo,
    awayLogo: match.isHome ? oppLogo : OUR_LOGO,
    homeTeam,
    awayTeam,
    matchDate: match.matchDate.toISOString(),
  };
}
