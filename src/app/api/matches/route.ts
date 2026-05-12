// src/app/api/matches/route.ts - API матчей (список, создание)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamSlug = searchParams.get('teamSlug') || '';
  const status = searchParams.get('status') || ''; // 'scheduled' | 'finished'
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  // Фильтр по команде
  if (teamSlug) {
    const team = await prisma.team.findUnique({ where: { slug: teamSlug } });
    if (team) {
      where.teamId = team.id;
    }
  }

  // Фильтр по статусу
  if (status) {
    where.status = status;
  }

  // Сортировка: для scheduled — по возрастанию даты, для finished — по убыванию
  const orderBy: Record<string, string> =
    status === 'finished' ? { matchDate: 'desc' } : { matchDate: 'asc' };

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.match.count({ where }),
  ]);

  return NextResponse.json({
    matches,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + limit < total,
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Находим нашу команду по slug
    const team = data.teamSlug
      ? await prisma.team.findUnique({ where: { slug: data.teamSlug } })
      : null;

    const match = await prisma.match.create({
      data: {
        teamId: team?.id || '',
        homeTeam: data.homeTeam || '',
        awayTeam: data.awayTeam || '',
        homeTeamId: data.homeTeamId || null,
        awayTeamId: data.awayTeamId || null,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
        matchDate: new Date(data.matchDate),
        stadium: data.stadium || null,
        facilityId: data.facilityId || null,
        tournament: data.tournament || null,
        round: data.round || null,
        status: data.status || 'scheduled',
        matchType: data.matchType || null,
        gender: data.gender || null,
        attendance: data.attendance || null,
        isHome: data.isHome ?? true,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
