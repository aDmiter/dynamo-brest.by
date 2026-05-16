// src/app/page/tickets/page.tsx — Билеты
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import {
  buildOpponentTeamMap,
  DYNAMO_BREST_DISPLAY_NAME,
  resolveMatchTeamNames,
} from '@/modules/team/lib/resolve-match-teams';
import TicketsPageView from '@/modules/tickets/components/TicketsPageView';

export const metadata: Metadata = {
  title: 'Билеты на матчи | Динамо-Брест',
  description:
    'Купить билеты на матчи ФК «Динамо-Брест»: кассы стадиона ОСК «Брестский», онлайн через 24afisha.by, цены по секторам.',
};

const MAIN_TEAM_COMET_ID = '68812';

export default async function TicketsPage() {
  const team = await prisma.team.findUnique({
    where: { cometId: MAIN_TEAM_COMET_ID },
  });

  if (!team) {
    return <TicketsPageView nextMatch={null} />;
  }

  const [nextMatch, opponentTeams] = await Promise.all([
    prisma.match.findFirst({
      where: {
        teamId: team.id,
        status: 'scheduled',
        isHome: true,
        matchDate: { gte: new Date() },
      },
      orderBy: { matchDate: 'asc' },
    }),
    prisma.opponentTeam.findMany({
      where: { isActive: true },
      select: { cometId: true, name: true, logoUrl: true },
    }),
  ]);

  const opponentMap = buildOpponentTeamMap(opponentTeams);

  const serialized = nextMatch
    ? (() => {
        const { homeTeam, awayTeam } = resolveMatchTeamNames(
          nextMatch,
          DYNAMO_BREST_DISPLAY_NAME,
          opponentMap
        );
        return {
          id: nextMatch.id,
          homeTeam,
          awayTeam,
          matchDate: nextMatch.matchDate.toISOString(),
          tournament: nextMatch.tournament,
          stadium: nextMatch.stadium,
          ticketUrl: nextMatch.ticketUrl,
        };
      })()
    : null;

  return <TicketsPageView nextMatch={serialized} />;
}
