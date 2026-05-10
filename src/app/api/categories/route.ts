// src/app/api/categories/route.ts - API категорий товаров
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.productcategory.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const category = await prisma.productcategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        imageUrl: data.imageUrl || null,
        order: data.order || 0,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
