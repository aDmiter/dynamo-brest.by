// src/app/admin/matches/calendar/[teamSlug]/page.tsx - Календарь матчей команды
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MatchesCalendarClient from './MatchesCalendarClient';

interface Props {
  params: Promise<{ teamSlug: string }>;
}

export default async function CalendarPage({ params }: Props) {
  const { teamSlug } = await params;

  const team = await prisma.team.findUnique({ where: { slug: teamSlug } });
  if (!team) notFound();

  const [matches, allTeams] = await Promise.all([
    prisma.match.findMany({
      where: { teamId: team.id, status: 'scheduled' },
      orderBy: { matchDate: 'asc' },
      take: 100,
    }),
    prisma.opponentTeam.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, cometId: true, name: true, logoUrl: true },
    }),
  ]);

  const serialized = matches.map((m) => ({
    ...m,
    matchDate: m.matchDate.toISOString(),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Календарь — {team.name}</h1>
        <p className="text-sm text-gray-400 mt-1">{matches.length} предстоящих матчей</p>
      </div>
      <MatchesCalendarClient
        initialMatches={serialized}
        teamSlug={teamSlug}
        teamName={team.name}
        allTeams={allTeams}
      />
    </div>
  );
}
