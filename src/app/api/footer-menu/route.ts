// src/app/api/footer-menu/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [items, contacts] = await Promise.all([
    prisma.footermenuitem.findMany({
      orderBy: [{ block: 'asc' }, { order: 'asc' }],
    }),
    prisma.footercontacts.findUnique({ where: { id: 'main' } }),
  ]);

  return NextResponse.json({ items, contacts });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const block = Number(data.block);
    if (block !== 1 && block !== 2) {
      return NextResponse.json({ error: 'Блок должен быть 1 или 2' }, { status: 400 });
    }

    const maxOrder = await prisma.footermenuitem.aggregate({
      where: { block },
      _max: { order: true },
    });

    const slug =
      data.slug ||
      String(data.title || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9а-яё-]/gi, '');

    const item = await prisma.footermenuitem.create({
      data: {
        block,
        title: data.title,
        slug,
        type: data.type || 'page',
        linkUrl: data.linkUrl || null,
        pageContent: data.pageContent || null,
        order: data.order ?? (maxOrder._max.order ?? -1) + 1,
        isActive: data.isActive ?? true,
        isExternal: data.isExternal ?? false,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
