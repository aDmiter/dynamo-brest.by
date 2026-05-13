// src/app/api/menu/route.ts - API для управления меню
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — получить дерево меню
export async function GET() {
  const menu = await prisma.menuitem.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(menu);
}

// POST — создать новый пункт меню
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const item = await prisma.menuitem.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        type: data.type || 'link',
        linkUrl: data.linkUrl || null,
        pageContent: data.pageContent || null,
        parentId: data.parentId || null,
        order: data.order || 0,
        isActive: data.isActive ?? true,
        isExternal: data.isExternal ?? false,
        icon: data.icon || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
