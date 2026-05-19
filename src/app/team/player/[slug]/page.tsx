// src/app/team/player/[slug]/page.tsx
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PlayerPageClient from './PlayerPageClient';
import { getPlayerStatsFromDb } from '@/lib/player-stats-db';
import { resolveContextualSiteMetadata } from '@/lib/site-page-meta';

interface Props {
  params: Promise<{ slug: string }>;
}

function playerMetaVars(player: {
  firstName: string;
  lastName: string;
  middleName: string | null;
  number: number | null;
  position: string | null;
  playerTeams: { team: { name: string } }[];
}) {
  const fullName = [player.firstName, player.middleName, player.lastName].filter(Boolean).join(' ');
  const team = player.playerTeams[0]?.team.name ?? '';
  const number = player.number != null ? `№${player.number}` : '';
  const position = player.position?.trim() ?? '';

  return {
    firstName: player.firstName,
    lastName: player.lastName,
    fullName,
    number,
    position,
    team,
  };
}

function defaultPlayerTitle(vars: { firstName: string; lastName: string; position: string }) {
  const name = [vars.firstName, vars.lastName].filter(Boolean).join(' ');
  const club = 'ФК «Динамо-Брест»';
  const position = vars.position.trim();
  return position ? `${name} - ${position} - ${club}` : `${name} - ${club}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await prisma.player.findUnique({
    where: { slug },
    select: {
      firstName: true,
      lastName: true,
      middleName: true,
      number: true,
      position: true,
      isPublished: true,
      playerTeams: { select: { team: { select: { name: true } } }, take: 1 },
    },
  });

  if (!player || !player.isPublished) {
    return { title: 'Игрок | ФК «Динамо-Брест»' };
  }

  const vars = playerMetaVars(player);
  const path = `/team/player/${slug}`;

  return resolveContextualSiteMetadata(path, vars, {
    title: defaultPlayerTitle(vars),
    description: [vars.position, vars.number, vars.team].filter(Boolean).join(' — '),
  });
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
