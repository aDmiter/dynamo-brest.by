// src/app/api/players/route.ts - API списка игроков (GET с поиском, POST ручное создание)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const teamId = searchParams.get('teamId') || '';
  const gender = searchParams.get('gender') || '';
  const level = searchParams.get('level') || '';
  const isPublished = searchParams.get('isPublished');

  // Базовые условия
  const where: Record<string, unknown> = {};

  // Поиск по Фамилии + Имени
  if (search) {
    where.OR = [
      { lastName: { contains: search } },
      { firstName: { contains: search } },
      { middleName: { contains: search } },
    ];
  }

  // Фильтр по команде (many-to-many через PlayerTeam)
  if (teamId) {
    where.playerTeams = {
      some: { teamId },
    };
  }

  // Фильтр по полу
  if (gender && (gender === 'male' || gender === 'female')) {
    where.gender = gender;
  }

  // Фильтр по уровню
  if (level && (level === 'professional' || level === 'amateur')) {
    where.level = level;
  }

  // Фильтр по публикации
  if (isPublished === 'true') {
    where.isPublished = true;
  } else if (isPublished === 'false') {
    where.isPublished = false;
  }

  const players = await prisma.player.findMany({
    where,
    include: {
      playerTeams: {
        include: {
          team: true,
        },
      },
    },
    orderBy: [
      { level: 'desc' }, // professional first, then amateur
      { gender: 'asc' }, // female first (f перед m в алфавите), затем male — поправим на уровне приложения
      { cometId: 'asc' }, // сортировка по ID в системе COMET
      { lastName: 'asc' },
    ],
  });

  // Корректируем сортировку по полу: male, затем female
  const genderOrder = { male: 0, female: 1 };
  const sortedPlayers = players.sort((a, b) => {
    // Сначала по уровню (professional > amateur)
    const levelA = a.level || '';
    const levelB = b.level || '';
    if (levelA !== levelB) {
      return levelB.localeCompare(levelA); // professional идёт раньше amateur
    }

    // Затем по полу (male, затем female)
    const genderA = a.gender || '';
    const genderB = b.gender || '';
    const orderA = genderOrder[genderA as keyof typeof genderOrder] ?? 2;
    const orderB = genderOrder[genderB as keyof typeof genderOrder] ?? 2;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Затем по cometId
    const idA = a.cometId || '';
    const idB = b.cometId || '';
    return idA.localeCompare(idB);
  });

  // Трансформируем для ответа: teams — массив teamId
  const result = sortedPlayers.map((p) => ({
    ...p,
    teams: p.playerTeams.map((pt) => pt.team),
    playerTeams: undefined,
  }));

  return NextResponse.json(result);
}

// POST — создать игрока вручную
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const teamIds: string[] = data.teamIds || [];

    const player = await prisma.player.create({
      data: {
        cometId: data.cometId || null,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        middleName: data.middleName || null,
        shortName: data.shortName || null,
        number: data.number || null,
        position: data.position || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        nationality: data.nationality || null,
        country: data.country || null,
        city: data.city || null,
        gender: data.gender || null,
        level: data.level || null,
        height: data.height || null,
        weight: data.weight || null,
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        isActive: data.isActive ?? true,
        isPublished: data.isPublished ?? true,
        isManuallyCreated: true,
        order: data.order || 0,
        playerTeams: {
          create: teamIds.map((teamId: string) => ({ teamId })),
        },
      },
      include: {
        playerTeams: {
          include: { team: true },
        },
      },
    });

    return NextResponse.json(
      {
        ...player,
        teams: player.playerTeams.map((pt) => pt.team),
        playerTeams: undefined,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Ошибка создания игрока:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
