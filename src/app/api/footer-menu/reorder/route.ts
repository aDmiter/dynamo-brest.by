// src/app/api/footer-menu/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { items } = data as { items: { id: string; order: number }[] };

    for (const item of items) {
      await prisma.footermenuitem.update({
        where: { id: item.id },
        data: { order: item.order },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
