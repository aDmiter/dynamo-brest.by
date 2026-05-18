// Статистика игрока из БД (matchLineup + match)
import { NextRequest, NextResponse } from 'next/server';
import { getPlayerStatsFromDb } from '@/lib/player-stats-db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const teamSlug = searchParams.get('teamSlug') || undefined;
    const seasonYear = searchParams.get('seasonYear');
    const year = seasonYear ? parseInt(seasonYear, 10) : undefined;

    const payload = await getPlayerStatsFromDb(id, {
      teamSlug,
      seasonYear: Number.isFinite(year) ? year : undefined,
    });

    if (!payload) {
      return NextResponse.json({ error: 'Игрок не найден' }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Player stats error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
