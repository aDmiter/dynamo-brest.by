// src/app/admin/players/page.tsx - Все игроки (из COMET + ручные)
import { prisma } from '@/lib/prisma';
import AllPlayersPageClient from './AllPlayersPageClient';

export default async function AllPlayersPage() {
  // Все активные команды для toggler'ов
  const allTeams = await prisma.team.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  // Вообще все игроки из базы
  const players = await prisma.player.findMany({
    include: {
      playerTeams: {
        include: { team: true },
      },
    },
    orderBy: [{ level: 'desc' }, { gender: 'asc' }, { cometId: 'asc' }, { lastName: 'asc' }],
  });

  // Сортируем: professional → amateur, male → female, cometId
  const genderOrder: Record<string, number> = { male: 0, female: 1 };
  const sortedPlayers = [...players].sort((a, b) => {
    const levelA = a.level || '';
    const levelB = b.level || '';
    if (levelA !== levelB) return levelB.localeCompare(levelA);
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
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Все игроки</h1>
          <p className="text-sm text-gray-400 mt-1">{sortedPlayers.length} игроков в базе</p>
        </div>
      </div>
      <AllPlayersPageClient initialPlayers={serializedPlayers} allTeams={allTeams} />
    </div>
  );
}
