// src/app/api/customizations/route.ts - API нанесений
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const customizations = await prisma.customization.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(customizations);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await prisma.customization.create({
      data: {
        name: data.name,
        type: data.type || 'logo',
        imageUrl: data.imageUrl || null,
        price: Number(data.price) || 0,
        isActive: true,
        order: data.order || 0,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Ошибка создания нанесения:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
