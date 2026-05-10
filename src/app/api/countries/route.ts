// src/app/api/countries/route.ts - API стран доставки
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const countries = await prisma.country.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json(countries);
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    // Массовое обновление
    if (data.countries && Array.isArray(data.countries)) {
      for (const c of data.countries) {
        await prisma.country.update({
          where: { id: c.id },
          data: {
            price: c.price !== null && c.price !== undefined ? Number(c.price) : null,
            isActive: c.isActive === true,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
