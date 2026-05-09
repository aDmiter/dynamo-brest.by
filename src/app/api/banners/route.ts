// src/app/api/banners/route.ts - API для управления баннерами
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — получить активный баннер для главной
export async function GET() {
  const banner = await prisma.banner.findFirst({
    where: { isActive: true, position: 'home' },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(banner || null);
}

// POST — создать/обновить баннер
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        backgroundUrl: data.backgroundUrl || null,
        isActive: data.isActive ?? true,
        position: data.position || 'home',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
