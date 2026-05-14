// src/app/team/reserve/players/page.tsx - Дублирующий состав
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PlayersGrid from '@/modules/team/components/PlayersGrid';

export default async function ReservePlayersPage() {
  const team = await prisma.team.findUnique({
    where: { slug: 'dubliruyushchiy-sostav' },
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

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img
          src="/images/stadium.jpg"
          alt="Дублирующий состав"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#ee862c]">
              Команда
            </p>
            <h1
              className="text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Дублирующий состав
            </h1>
          </div>
        </div>
      </div>

      <PlayersGrid players={sortedPlayers} />
    </div>
  );
}
