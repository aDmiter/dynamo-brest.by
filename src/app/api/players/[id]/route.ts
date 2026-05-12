// src/app/api/players/[id]/route.ts - API конкретного игрока (GET, PUT, DELETE)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — получить одного игрока по id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      playerTeams: {
        include: { team: true },
      },
    },
  });

  if (!player) {
    return NextResponse.json({ error: 'Игрок не найден' }, { status: 404 });
  }

  return NextResponse.json({
    ...player,
    teams: player.playerTeams.map((pt) => pt.team),
    playerTeams: undefined,
  });
}

// PUT — обновить данные игрока
// Ключевой момент: этот роут используется и для ручного редактирования,
// и для синхронизации из COMET. При синхронизации из COMET мы НЕ перезаписываем
// поля, которые админ мог изменить вручную (photoUrl, bio, country, city, height, weight, number, isPublished, order)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Определяем, кто вызывает: ручное редактирование или синхронизация из COMET
    const isSync = data._sync === true;

    // Собираем поля для обновления
    const updateData: Record<string, unknown> = {};

    // Поля, которые ВСЕГДА обновляются (и из COMET, и вручную)
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.middleName !== undefined) updateData.middleName = data.middleName;
    if (data.shortName !== undefined) updateData.shortName = data.shortName;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.birthDate !== undefined)
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Поля, которые обновляются ТОЛЬКО при ручном редактировании (не из COMET)
    // При синхронизации они не перезаписываются, сохраняя ручные правки админа
    if (!isSync) {
      if (data.number !== undefined) updateData.number = data.number;
      if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
      if (data.order !== undefined) updateData.order = data.order;
    }

    // Обновляем игрока
    const player = await prisma.player.update({
      where: { id },
      data: updateData,
    });

    // Обновляем связи с командами (только если передан teamIds и это не синхронизация)
    if (data.teamIds !== undefined && !isSync) {
      // Удаляем старые связи
      await prisma.playerTeam.deleteMany({ where: { playerId: id } });
      // Создаём новые
      const teamIds: string[] = data.teamIds || [];
      if (teamIds.length > 0) {
        await prisma.playerTeam.createMany({
          data: teamIds.map((teamId) => ({ playerId: id, teamId })),
        });
      }
    }

    // Возвращаем обновлённого игрока с командами
    const updatedPlayer = await prisma.player.findUnique({
      where: { id },
      include: {
        playerTeams: {
          include: { team: true },
        },
      },
    });

    return NextResponse.json({
      ...updatedPlayer,
      teams: updatedPlayer?.playerTeams.map((pt) => pt.team) || [],
      playerTeams: undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Ошибка обновления игрока:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE — удалить игрока (только если создан вручную)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) {
      return NextResponse.json({ error: 'Игрок не найден' }, { status: 404 });
    }

    // Разрешаем удалять только вручную созданных игроков
    // Игроки из COMET должны деактивироваться через isActive = false, а не удаляться
    if (!player.isManuallyCreated) {
      return NextResponse.json(
        { error: 'Нельзя удалить игрока из COMET. Используйте деактивацию (isActive = false)' },
        { status: 403 }
      );
    }

    // Удаляем связи с командами
    await prisma.playerTeam.deleteMany({ where: { playerId: id } });
    // Удаляем игрока
    await prisma.player.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
