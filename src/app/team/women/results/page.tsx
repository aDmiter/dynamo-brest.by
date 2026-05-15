// src/app/team/women/results/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MatchesResultsClient from '@/modules/team/components/MatchesResultsClient';

export default async function WomenResultsPage() {
  const team = await prisma.team.findUnique({
    where: { slug: 'zhenskaya-komanda' },
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

  const teamMap: Record<number, { name: string; logoUrl: string | null }> = {};
  for (const opp of opponentTeams) {
    if (opp.cometId) {
      teamMap[opp.cometId] = { name: opp.name, logoUrl: opp.logoUrl };
    }
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

  return <MatchesResultsClient matches={serialized} teamName={team.name} />;
}
