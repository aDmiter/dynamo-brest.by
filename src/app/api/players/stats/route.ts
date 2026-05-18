// Сводная статистика игроков состава из БД (для сетки /team/.../players)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTeamPlayersStatsMap } from '@/lib/player-stats-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamSlug = searchParams.get('teamSlug');

    if (!teamSlug) {
      return NextResponse.json({ error: 'teamSlug обязателен' }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: { slug: teamSlug },
      select: { id: true },
    });

    if (!team) {
      return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });
    }

    const players = await prisma.player.findMany({
      where: {
        isActive: true,
        isPublished: true,
        playerTeams: { some: { teamId: team.id } },
      },
      select: { id: true },
    });

    const stats = await getTeamPlayersStatsMap(
      team.id,
      teamSlug,
      players.map((p) => p.id)
    );

    return NextResponse.json({
      success: true,
      source: 'database',
      stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
