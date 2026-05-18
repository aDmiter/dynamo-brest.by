// src/app/team/player/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PlayerPageClient from './PlayerPageClient';
import { getPlayerStatsFromDb } from '@/lib/player-stats-db';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;

  const player = await prisma.player.findUnique({
    where: { slug },
    include: {
      playerTeams: {
        include: { team: true },
      },
    },
  });

  if (!player || !player.isPublished) notFound();

  const serialized = {
    ...player,
    birthDate: player.birthDate?.toISOString() || null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
    teams: player.playerTeams.map((pt) => pt.team),
    playerTeams: undefined,
  };

  const teamSlug = player.playerTeams[0]?.team.slug ?? '';
  const stats = await getPlayerStatsFromDb(player.id, { teamSlug });

  return <PlayerPageClient player={serialized} initialStats={stats} />;
}
