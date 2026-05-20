import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const manufacturers = await prisma.productmanufacturer.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(manufacturers);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
    }
    const manufacturer = await prisma.productmanufacturer.create({
      data: {
        name: data.name.trim(),
      },
    });
    return NextResponse.json(manufacturer, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
