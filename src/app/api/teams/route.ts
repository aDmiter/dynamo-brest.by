// src/app/api/teams/route.ts - API для управления командами
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — получить список команд
export async function GET() {
  const teams = await prisma.team.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(teams);
}

// POST — создать новую команду
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const team = await prisma.team.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        cometId: data.cometId || null,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// PUT — обновить команду
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Не указан id команды' }, { status: 400 });
    }

    const team = await prisma.team.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        cometId: data.cometId,
        isActive: data.isActive,
        order: data.order,
      },
    });

    return NextResponse.json(team);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
