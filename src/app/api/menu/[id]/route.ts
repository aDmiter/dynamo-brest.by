// src/app/api/menu/[id]/route.ts - API для конкретного пункта меню
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT — обновить пункт меню
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
    if (data.pageContent !== undefined) updateData.pageContent = data.pageContent;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isExternal !== undefined) updateData.isExternal = data.isExternal;
    if (data.icon !== undefined) updateData.icon = data.icon;

    const item = await prisma.menuitem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(item);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE — удалить пункт меню (и все дочерние)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Сначала удаляем дочерние пункты
    await prisma.menuitem.deleteMany({ where: { parentId: id } });
    // Затем удаляем сам пункт
    await prisma.menuitem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
