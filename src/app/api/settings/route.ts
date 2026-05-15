// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearSettingsCache } from '@/lib/settings';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keysParam = searchParams.get('keys'); // ?keys=accent_color,accent_hover
  const fullValues = searchParams.get('full') === '1'; // ?full=1

  // Если запрошены конкретные ключи — возвращаем значения
  if (keysParam) {
    const keys = keysParam.split(',');
    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });
    const result: Record<string, string> = {};
    for (const s of settings) result[s.key] = s.value;
    return NextResponse.json(result);
  }

  // Если full=1 — возвращаем все значения (для ThemeInitializer)
  if (fullValues) {
    const settings = await prisma.setting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) result[s.key] = s.value;
    return NextResponse.json(result);
  }

  // По умолчанию — только ключи и hasValue (для админки ключей API)
  const settings = await prisma.setting.findMany({
    orderBy: { key: 'asc' },
  });

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

    clearSettingsCache();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
