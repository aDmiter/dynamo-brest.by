// src/app/api/titles/route.ts - API титулов
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TITLE_TYPES = ['championship', 'cup', 'supercup'] as const;

export async function GET() {
  // Группируем по типу и собираем годы
  const titles = await prisma.title.findMany({
    orderBy: { year: 'desc' },
  });

  // Собираем статистику по типам
  const result = TITLE_TYPES.map((type) => {
    const items = titles.filter((t) => t.type === type);
    return {
      type,
      count: items.length,
      years: items.map((t) => t.year).sort((a, b) => b - a),
      id: items[0]?.id || null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const title = await prisma.title.create({
      data: {
        name: data.name,
        year: data.year,
        type: data.type,
        order: data.order || 0,
        imageUrl: data.imageUrl || null,
      },
    });
    return NextResponse.json(title, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
