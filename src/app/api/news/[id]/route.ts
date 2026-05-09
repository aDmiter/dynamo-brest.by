// src/app/api/news/[id]/route.ts - API для конкретной новости
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT — обновить новость
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Собираем только переданные поля (игнорируем undefined)
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.publishedAt !== undefined && data.publishedAt !== null) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(news);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE — удалить новость
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
