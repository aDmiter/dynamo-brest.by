// src/app/api/opponent-teams/route.ts - API клубов соперников
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const OUR_CLUB_ID = 68812;

// GET — список с поиском и пагинацией
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [{ name: { contains: search } }, { shortName: { contains: search } }];
  }

  const [teams, total] = await Promise.all([
    prisma.opponentTeam.findMany({
      where,
      orderBy: [{ name: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.opponentTeam.count({ where }),
  ]);

  // Пересортируем: Динамо-Брест первым, потом по алфавиту
  const sorted = [...teams].sort((a, b) => {
    if (a.cometId === OUR_CLUB_ID) return -1;
    if (b.cometId === OUR_CLUB_ID) return 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({
    teams: sorted,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + limit < total,
  });
}

// POST — создать клуб вручную
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const team = await prisma.opponentTeam.create({
      data: {
        name: data.name || '',
        shortName: data.shortName || data.name || '',
        logoUrl: data.logoUrl || null,
        city: data.city || null,
        country: data.country || null,
        isActive: true,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
