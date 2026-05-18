// src/app/team/reserve/results/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MatchesResultsClient from '@/modules/team/components/MatchesResultsClient';
import {
  buildOpponentTeamMap,
  serializeTeamMatchesForPublic,
} from '@/modules/team/lib/resolve-match-teams';
import { enrichMatchesWithGoals } from '@/modules/team/lib/enrich-match-goals';

export default async function ReserveResultsPage() {
  const team = await prisma.team.findUnique({
    where: { cometId: '102734' },
  });

  if (!team) notFound();

  const [matches, opponentTeams] = await Promise.all([
    prisma.match.findMany({
      where: { teamId: team.id, status: 'finished' },
      orderBy: { matchDate: 'desc' },
      take: 100,
    }),
    prisma.opponentTeam.findMany({
      where: { isActive: true },
      select: { cometId: true, name: true, logoUrl: true },
    }),
  ]);

  const opponentMap = buildOpponentTeamMap(opponentTeams);
  const serialized = serializeTeamMatchesForPublic(matches, opponentMap);
  const withGoals = await enrichMatchesWithGoals(serialized);

  return <MatchesResultsClient matches={withGoals} teamName={team.name} teamRoute="reserve" />;
}
