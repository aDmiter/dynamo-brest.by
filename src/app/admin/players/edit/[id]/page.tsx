// src/app/admin/players/edit/[id]/page.tsx - Страница редактирования игрока
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditPlayerForm from './EditPlayerForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPlayerPage({ params }: Props) {
  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      playerTeams: {
        include: { team: true },
      },
    },
  });

  if (!player) notFound();

  const allTeams = await prisma.team.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const serializedPlayer = {
    ...player,
    birthDate: player.birthDate?.toISOString() || null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
    teams: player.playerTeams.map((pt) => pt.team),
    playerTeams: undefined,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">
          Редактирование игрока: {player.lastName} {player.firstName}
        </h1>
      </div>
      <EditPlayerForm player={serializedPlayer} allTeams={allTeams} />
    </div>
  );
}
