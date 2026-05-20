// src/app/api/players-customization/route.ts - API игроков для нанесения (основной состав)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMainSquadPlayersForCustomization } from '@/lib/shop-customization-players';

export async function GET() {
  const players = await getMainSquadPlayersForCustomization();
  return NextResponse.json(players);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const player = await prisma.playerCustomization.create({
      data: {
        name: data.name,
        number: data.number,
        isActive: true,
      },
    });
    return NextResponse.json(player, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
