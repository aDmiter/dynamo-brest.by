// src/app/api/banners/[id]/route.ts - API для конкретного баннера
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT — обновить баннер
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        backgroundUrl: data.backgroundUrl || null,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(banner);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE — удалить баннер
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
