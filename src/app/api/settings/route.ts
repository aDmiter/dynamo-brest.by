// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearSettingsCache } from '@/lib/settings';

export async function GET() {
  const settings = await prisma.setting.findMany({
    orderBy: { key: 'asc' },
  });

  // Возвращаем только ключи и факт наличия значения, но не сами значения
  const result = settings.map((s) => ({
    key: s.key,
    hasValue: s.value.length > 0,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'string') continue;

      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    // Сбрасываем кэш после сохранения
    clearSettingsCache();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
