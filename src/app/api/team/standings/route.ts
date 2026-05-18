// src/app/api/team/standings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchCometStandings } from '@/lib/standings';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cometId = searchParams.get('cometId') || '68812';

  const data = await fetchCometStandings(cometId);
  if (!data) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch standings' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    standings: data.standings,
    tournament: data.tournament,
  });
}
