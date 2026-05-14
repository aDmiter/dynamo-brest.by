// src/app/admin/players/[teamSlug]/page.tsx - Игроки конкретной команды
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PlayersByTeamPageClient from './PlayersByTeamPageClient';

interface Props {
  params: Promise<{ teamSlug: string }>;
}

export default async function PlayersByTeamPage({ params }: Props) {
  const { teamSlug } = await params;

  // Получаем команду по slug
  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    include: {
      playerTeams: {
        include: {
          player: {
            include: {
              playerTeams: {
                include: { team: true },
              },
            },
          },
        },
      },
    },
  });

  if (!team) {
    notFound();
  }

  // Игроки этой команды
  const players = team.playerTeams.map((pt) => pt.player);

  // Сортируем: уровень (professional → amateur), пол (male → female), cometId
  const genderOrder: Record<string, number> = { male: 0, female: 1 };
  const sortedPlayers = players.sort((a, b) => {
    const levelA = a.level || '';
    const levelB = b.level || '';
    if (levelA !== levelB) {
      return levelB.localeCompare(levelA); // professional раньше amateur
    }
    const genderA = a.gender || '';
    const genderB = b.gender || '';
    const orderA = genderOrder[genderA] ?? 2;
    const orderB = genderOrder[genderB] ?? 2;
    if (orderA !== orderB) return orderA - orderB;
    const idA = a.cometId || '';
    const idB = b.cometId || '';
    return idA.localeCompare(idB);
  });

  // Сериализуем
  const serializedPlayers = sortedPlayers.map((p) => ({
    ...p,
    birthDate: p.birthDate?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    teamIds: p.playerTeams.map((pt) => pt.teamId),
    teams: p.playerTeams.map((pt) => pt.team),
    playerTeams: undefined,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Игроки — {team.name}</h1>
        <p className="text-sm text-gray-400 mt-1">{players.length} игроков в составе</p>
      </div>
      <PlayersByTeamPageClient
        initialPlayers={serializedPlayers}
        currentTeamSlug={teamSlug}
        currentTeamName={team.name}
      />
    </div>
  );
}
