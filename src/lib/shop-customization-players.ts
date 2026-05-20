import { prisma } from '@/lib/prisma';

/** COMET ID основного состава (см. AGENTS.md). */
export const MAIN_SQUAD_COMET_ID = '68812';

export interface ShopCustomizationPlayer {
  id: string;
  name: string;
  number: number;
}

/** Игроки основного состава для полного нанесения: без вратарей, сортировка по номеру. */
export async function getMainSquadPlayersForCustomization(): Promise<ShopCustomizationPlayer[]> {
  const team = await prisma.team.findUnique({
    where: { cometId: MAIN_SQUAD_COMET_ID },
    select: { id: true },
  });

  if (!team) return [];

  const players = await prisma.player.findMany({
    where: {
      isActive: true,
      isPublished: true,
      number: { not: null },
      lastName: { not: '' },
      NOT: { position: 'Вратарь' },
      playerTeams: { some: { teamId: team.id } },
    },
    select: {
      id: true,
      lastName: true,
      number: true,
    },
  });

  return players
    .map((p) => ({
      id: p.id,
      name: p.lastName,
      number: p.number as number,
    }))
    .sort((a, b) => a.number - b.number);
}
