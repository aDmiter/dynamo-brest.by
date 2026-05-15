// src/app/api/team/standings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

const STANDINGS_CONFIG: Record<string, { apiKey: string; title: string }> = {
  'osnovnoy-sostav': {
    apiKey: process.env.COMET_STANDINGS_API_KEY_OSNOVA || '',
    title: 'BETERA - Высшая лига 2026',
  },
  'dubliruyushchiy-sostav': {
    apiKey: process.env.COMET_STANDINGS_API_KEY_DUBL || '',
    title: 'Вторая лига 2026',
  },
  'zhenskaya-komanda': {
    apiKey: process.env.COMET_STANDINGS_API_KEY_WOMEN || '',
    title: 'Женская лига 2026',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamSlug = searchParams.get('teamSlug') || 'osnovnoy-sostav';

  const config = STANDINGS_CONFIG[teamSlug];
  if (!config || !config.apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/0/50/?API_KEY=${config.apiKey}`;

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`COMET API error: ${response.status}`);
    }

    const data = await response.json();

    const standings =
      data.results?.map((team: Record<string, unknown>) => ({
        position: team.position as number,
        club: team.club as string,
        clubId: team.clubId as number,
        matches: team.matches as number,
        wins: team.wins as number,
        draws: team.draws as number,
        losses: team.losses as number,
        goalsFor: team.goalsFor as number,
        goalsAgainst: team.goalsAgainst as number,
        goalDifference: team.goalDifference as number,
        points: team.points as number,
      })) || [];

    standings.sort((a: { position: number }, b: { position: number }) => a.position - b.position);

    // Собираем все clubId
    const clubIds = standings
      .map((s: { clubId: number }) => s.clubId)
      .filter((id: number) => id != null);

    // Получаем OpponentTeam по cometId
    const opponentTeams = await prisma.opponentTeam.findMany({
      where: { cometId: { in: clubIds } },
      select: { cometId: true, name: true, logoUrl: true },
    });

    // Карта: cometId → { name, logoUrl }
    const teamMap: Record<number, { name: string; logoUrl: string | null }> = {};
    for (const opp of opponentTeams) {
      if (opp.cometId) {
        teamMap[opp.cometId] = { name: opp.name, logoUrl: opp.logoUrl };
      }
    }

    // Подменяем названия и добавляем логотипы
    const standingsWithLogos = standings.map((team: { club: string; clubId: number }) => {
      const mapped = teamMap[team.clubId];
      return {
        ...team,
        club: mapped?.name || team.club,
        logoUrl: mapped?.logoUrl || null,
      };
    });

    return NextResponse.json({
      success: true,
      standings: standingsWithLogos,
      title: config.title,
    });
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
