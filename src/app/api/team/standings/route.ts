// src/app/api/team/standings/route.ts
import { NextResponse } from 'next/server';

const COMET_STANDINGS_API_URL = process.env.COMET_STANDINGS_API_URL;
const COMET_STANDINGS_API_KEY = process.env.COMET_STANDINGS_API_KEY;

export async function GET() {
  if (!COMET_STANDINGS_API_URL || !COMET_STANDINGS_API_KEY) {
    console.error('COMET_STANDINGS_API_URL or COMET_STANDINGS_API_KEY is not configured');
    return NextResponse.json({ error: 'COMET API not configured' }, { status: 500 });
  }

  try {
    const url = `${COMET_STANDINGS_API_URL}/0/50/?API_KEY=${COMET_STANDINGS_API_KEY}`;

    const response = await fetch(url, {
      headers: { API_KEY: COMET_STANDINGS_API_KEY },
      next: { revalidate: 3600 }, // Кэшируем на 1 час
    });

    if (!response.ok) {
      throw new Error(`COMET API error: ${response.status}`);
    }

    const data = await response.json();

    // Трансформируем данные для удобства использования на фронтенде
    const standings =
      data.results?.map((team: any) => ({
        position: team.position,
        club: team.club,
        matches: team.matches,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
        points: team.points,
      })) || [];

    // Сортируем по позиции на случай, если COMET вернул не отсортированные данные
    standings.sort((a: any, b: any) => a.position - b.position);

    return NextResponse.json({
      success: true,
      standings,
      competitionName: data.reportName,
    });
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch standings',
      },
      { status: 500 }
    );
  }
}
