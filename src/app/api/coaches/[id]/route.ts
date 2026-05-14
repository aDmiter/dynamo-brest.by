// src/app/api/coaches/[id]/route.ts - API конкретного тренера
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.middleName !== undefined) updateData.middleName = data.middleName;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.birthDate !== undefined)
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.gallery !== undefined) updateData.gallery = data.gallery;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    await prisma.coach.update({ where: { id }, data: updateData });

    if (data.teamIds !== undefined) {
      await prisma.coachTeam.deleteMany({ where: { coachId: id } });
      const teamIds: string[] = data.teamIds || [];
      if (teamIds.length > 0) {
        await prisma.coachTeam.createMany({
          data: teamIds.map((teamId) => ({ coachId: id, teamId })),
        });
      }
    }

    const coach = await prisma.coach.findUnique({
      where: { id },
      include: { coachTeams: { include: { team: true } } },
    });

    return NextResponse.json(coach);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.coachTeam.deleteMany({ where: { coachId: id } });
    await prisma.coach.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
