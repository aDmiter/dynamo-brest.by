// src/app/team/women/calendar/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MatchesCalendarClient from '@/modules/team/components/MatchesCalendarClient';

export default async function WomenCalendarPage() {
  const team = await prisma.team.findUnique({
    where: { cometId: '101132' },
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

  const teamMap: Record<number, { name: string; logoUrl: string | null }> = {};
  for (const opp of opponentTeams) {
    if (opp.cometId) teamMap[opp.cometId] = { name: opp.name, logoUrl: opp.logoUrl };
  }

  const serialized = matches.map((m) => ({
    ...m,
    matchDate: m.matchDate.toISOString(),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    homeTeam: m.isHome
      ? 'Динамо-Брест'
      : (m.homeTeamId && teamMap[m.homeTeamId]?.name) || m.homeTeam,
    awayTeam: m.isHome
      ? (m.awayTeamId && teamMap[m.awayTeamId]?.name) || m.awayTeam
      : 'Динамо-Брест',
    homeLogoUrl: m.isHome ? null : (m.homeTeamId && teamMap[m.homeTeamId]?.logoUrl) || null,
    awayLogoUrl: m.isHome ? (m.awayTeamId && teamMap[m.awayTeamId]?.logoUrl) || null : null,
  }));

  return <MatchesCalendarClient matches={serialized} teamName={team.name} />;
}
