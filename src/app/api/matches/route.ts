// src/app/api/matches/route.ts — создание матча (список/изменение — /api/matches/[id])
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const match = await prisma.match.create({
      data: {
        teamId: data.teamId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        matchDate: new Date(data.matchDate),
        stadium: data.stadium ?? null,
        tournament: data.tournament ?? null,
        round: data.round ?? null,
        status: data.status ?? 'scheduled',
        isHome: data.isHome ?? true,
        ticketUrl: data.ticketUrl ?? null,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
