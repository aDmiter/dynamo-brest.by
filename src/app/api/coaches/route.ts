// src/app/api/coaches/route.ts - API списка тренеров
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId') || '';

  const where: Record<string, unknown> = {};

  if (teamId) {
    where.coachTeams = {
      some: { teamId },
    };
  }

  const coaches = await prisma.coach.findMany({
    where,
    include: {
      coachTeams: {
        include: { team: true },
      },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  return NextResponse.json(coaches);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const teamIds: string[] = data.teamIds || [];

    const coach = await prisma.coach.create({
      data: {
        cometId: data.cometId || null,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        middleName: data.middleName || null,
        position: data.position || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        nationality: data.nationality || null,
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        isActive: data.isActive ?? true,
        isPublished: data.isPublished ?? true,
        isManuallyCreated: true,
        coachTeams: {
          create: teamIds.map((teamId: string) => ({ teamId })),
        },
      },
      include: {
        coachTeams: { include: { team: true } },
      },
    });

    return NextResponse.json(coach, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
