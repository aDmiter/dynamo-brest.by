// src/app/team/player/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PlayerPageClient from './PlayerPageClient';

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

  return <PlayerPageClient player={serialized} />;
}
