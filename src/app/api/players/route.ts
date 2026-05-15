// src/app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transliterate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const teamId = searchParams.get('teamId') || '';
  const gender = searchParams.get('gender') || '';
  const level = searchParams.get('level') || '';
  const isPublished = searchParams.get('isPublished');

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { lastName: { contains: search } },
      { firstName: { contains: search } },
      { middleName: { contains: search } },
    ];
  }

  if (teamId) {
    where.playerTeams = { some: { teamId } };
  }

  if (gender && (gender === 'male' || gender === 'female')) {
    where.gender = gender;
  }

  if (level && (level === 'professional' || level === 'amateur')) {
    where.level = level;
  }

  if (isPublished === 'true') {
    where.isPublished = true;
  } else if (isPublished === 'false') {
    where.isPublished = false;
  }

  const players = await prisma.player.findMany({
    where,
    include: { playerTeams: { include: { team: true } } },
    orderBy: [{ level: 'desc' }, { gender: 'asc' }, { cometId: 'asc' }, { lastName: 'asc' }],
  });

  const genderOrder = { male: 0, female: 1 };
  const sortedPlayers = players.sort((a, b) => {
    const levelA = a.level || '';
    const levelB = b.level || '';
    if (levelA !== levelB) return levelB.localeCompare(levelA);

    const genderA = a.gender || '';
    const genderB = b.gender || '';
    const orderA = genderOrder[genderA as keyof typeof genderOrder] ?? 2;
    const orderB = genderOrder[genderB as keyof typeof genderOrder] ?? 2;
    if (orderA !== orderB) return orderA - orderB;

    const idA = a.cometId || '';
    const idB = b.cometId || '';
    return idA.localeCompare(idB);
  });

  const result = sortedPlayers.map((p) => ({
    ...p,
    teams: p.playerTeams.map((pt) => pt.team),
    playerTeams: undefined,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const teamIds: string[] = data.teamIds || [];

    let slug = transliterate(`${data.firstName || ''}-${data.lastName || ''}`);
    slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug) slug = `player-${Date.now().toString().slice(-6)}`;

    const existingSlug = await prisma.player.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

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
        slug,
        playerTeams: {
          create: teamIds.map((teamId: string) => ({ teamId })),
        },
      },
      include: { playerTeams: { include: { team: true } } },
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
