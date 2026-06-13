// src/app/team/women/calendar/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MatchesCalendarClient from '@/modules/team/components/MatchesCalendarClient';
import { calendarMatchWhere } from '@/modules/team/lib/match-queries';
import {
  buildOpponentTeamMap,
  serializeTeamMatchesForPublic,
} from '@/modules/team/lib/resolve-match-teams';

export default async function WomenCalendarPage() {
  const team = await prisma.team.findUnique({
    where: { cometId: '101132' },
  });

  if (!team) notFound();

  const [matches, opponentTeams] = await Promise.all([
    prisma.match.findMany({
      where: calendarMatchWhere(team.id, new Date(), true),
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

  return <MatchesCalendarClient matches={serialized} teamName={team.name} teamRoute="women" />;
}
