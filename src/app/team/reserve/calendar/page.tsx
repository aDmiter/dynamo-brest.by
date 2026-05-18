// src/app/team/reserve/calendar/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MatchesCalendarClient from '@/modules/team/components/MatchesCalendarClient';
import {
  buildOpponentTeamMap,
  serializeTeamMatchesForPublic,
} from '@/modules/team/lib/resolve-match-teams';

export default async function ReserveCalendarPage() {
  const team = await prisma.team.findUnique({
    where: { cometId: '102734' },
  });

  if (!team) notFound();

  const [matches, opponentTeams] = await Promise.all([
    prisma.match.findMany({
      where: {
        teamId: team.id,
        OR: [
          { matchDate: { gte: new Date() } },
          { matchDate: { lte: new Date('1970-01-02T00:00:00.000Z') } },
        ],
      },
      orderBy: { matchDate: 'asc' },
      take: 100,
    }),
    prisma.opponentTeam.findMany({
      where: { isActive: true },
      select: { cometId: true, name: true, logoUrl: true },
    }),
  ]);

  const opponentMap = buildOpponentTeamMap(opponentTeams);
  const serialized = serializeTeamMatchesForPublic(matches, opponentMap);

  return <MatchesCalendarClient matches={serialized} teamName={team.name} teamRoute="reserve" />;
}
