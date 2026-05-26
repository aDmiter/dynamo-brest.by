// src/app/api/footer-menu/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveBeContentTranslations } from '@/lib/content-translations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.block !== undefined) updateData.block = Number(data.block);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
    if (data.pageContent !== undefined) updateData.pageContent = data.pageContent;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.heroHeader !== undefined) updateData.heroHeader = data.heroHeader;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isExternal !== undefined) updateData.isExternal = data.isExternal;

    const item = await prisma.footermenuitem.update({
      where: { id },
      data: updateData,
    });

    if (data.be && typeof data.be === 'object') {
      await saveBeContentTranslations('footermenuitem', id, data.be);
    }

    return NextResponse.json(item);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.contentTranslation.deleteMany({
      where: { resourceType: 'footermenuitem', resourceId: id },
    });
    await prisma.footermenuitem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
