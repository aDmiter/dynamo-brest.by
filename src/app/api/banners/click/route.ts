// src/app/api/banners/click/route.ts - Учёт кликов по баннеру
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { bannerId } = await request.json();

    if (!bannerId) {
      return NextResponse.json({ error: 'Не указан bannerId' }, { status: 400 });
    }

    await prisma.banner.update({
      where: { id: bannerId },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
