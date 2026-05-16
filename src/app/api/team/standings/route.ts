// src/app/api/team/standings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings';

const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

const STANDINGS_CONFIG: Record<string, { settingKey: string; envKey: string }> = {
  '68812': {
    settingKey: 'COMET_STANDINGS_API_KEY_OSNOVA',
    envKey: 'COMET_STANDINGS_API_KEY_OSNOVA',
  },
  '102734': {
    settingKey: 'COMET_STANDINGS_API_KEY_DUBL',
    envKey: 'COMET_STANDINGS_API_KEY_DUBL',
  },
  '101132': {
    settingKey: 'COMET_STANDINGS_API_KEY_WOMEN',
    envKey: 'COMET_STANDINGS_API_KEY_WOMEN',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cometId = searchParams.get('cometId') || '68812';

  const config = STANDINGS_CONFIG[cometId];
  if (!config) {
    return NextResponse.json({ error: 'Invalid cometId' }, { status: 400 });
  }

  const dbKey = await getSetting(config.settingKey);
  const envKey = process.env[config.envKey] || '';
  const apiKey = dbKey || envKey;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/0/50/?API_KEY=${apiKey}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`COMET API error: ${response.status}`);

    const data = await response.json();

    // Берём название турнира из первого результата
    const tournament = (data.results?.[0]?.name as string) || '';

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

    const clubIds = standings
      .map((s: { clubId: number }) => s.clubId)
      .filter((id: number) => id != null);
    const opponentTeams = await prisma.opponentTeam.findMany({
      where: { cometId: { in: clubIds } },
      select: { cometId: true, name: true, logoUrl: true },
    });

    const teamMap: Record<number, { name: string; logoUrl: string | null }> = {};
    for (const opp of opponentTeams) {
      if (opp.cometId) teamMap[opp.cometId] = { name: opp.name, logoUrl: opp.logoUrl };
    }

    const standingsWithLogos = standings.map((team: { club: string; clubId: number }) => {
      const mapped = teamMap[team.clubId];
      return { ...team, club: mapped?.name || team.club, logoUrl: mapped?.logoUrl || null };
    });

    return NextResponse.json({
      success: true,
      standings: standingsWithLogos,
      tournament,
    });
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
