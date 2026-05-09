// src/app/api/sponsors/route.ts - API спонсоров
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const sponsors = await prisma.sponsor.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  });
  return NextResponse.json(sponsors);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const sponsor = await prisma.sponsor.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        type: data.type || 'general',
        order: data.order || 0,
        isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json(sponsor, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
