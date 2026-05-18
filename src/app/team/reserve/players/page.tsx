// src/app/team/reserve/players/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PlayersGrid from '@/modules/team/components/PlayersGrid';
import { getTeamPlayersStatsMap } from '@/lib/player-stats-db';

export default async function ReservePlayersPage() {
  const team = await prisma.team.findUnique({
    where: { cometId: '102734' },
  });

  if (!team) notFound();

  const players = await prisma.player.findMany({
    where: {
      isActive: true,
      isPublished: true,
      playerTeams: {
        some: { teamId: team.id },
      },
    },
    include: {
      playerTeams: {
        include: { team: true },
      },
    },
  });

  const positionOrder: Record<string, number> = {
    Вратарь: 1,
    Защитник: 2,
    Полузащитник: 3,
    Нападающий: 4,
  };

  const sortedPlayers = players.sort((a, b) => {
    const posA = positionOrder[a.position || ''] || 99;
    const posB = positionOrder[b.position || ''] || 99;
    if (posA !== posB) return posA - posB;
    if (a.number && b.number) return a.number - b.number;
    if (a.number) return -1;
    if (b.number) return 1;
    return (a.lastName || '').localeCompare(b.lastName || '');
  });

  const statsByPlayerId = await getTeamPlayersStatsMap(
    team.id,
    'dubliruyushchiy-sostav',
    sortedPlayers.map((p) => p.id)
  );

  return (
    <PlayersGrid
      players={sortedPlayers}
      teamName="Дублирующий состав"
      teamSlug="dubliruyushchiy-sostav"
      statsByPlayerId={statsByPlayerId}
    />
  );
}
