// src/app/api/matches/[id]/route.ts - API для конкретного матча
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — получить один матч
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });

  if (!match) {
    return NextResponse.json({ error: 'Матч не найден' }, { status: 404 });
  }

  return NextResponse.json(match);
}

// PUT — обновить матч
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {};

    if (data.homeTeam !== undefined) updateData.homeTeam = data.homeTeam;
    if (data.awayTeam !== undefined) updateData.awayTeam = data.awayTeam;
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (data.matchDate !== undefined) updateData.matchDate = new Date(data.matchDate);
    if (data.stadium !== undefined) updateData.stadium = data.stadium;
    if (data.tournament !== undefined) updateData.tournament = data.tournament;
    if (data.round !== undefined) updateData.round = data.round;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isHome !== undefined) updateData.isHome = data.isHome;
    if (data.matchType !== undefined) updateData.matchType = data.matchType;
    if (data.attendance !== undefined) updateData.attendance = data.attendance;
    if (data.teamId !== undefined) updateData.teamId = data.teamId;

    const match = await prisma.match.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(match);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Ошибка обновления матча:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE — удалить матч
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
