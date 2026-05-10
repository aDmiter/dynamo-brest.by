// src/app/api/products/[id]/route.ts - API конкретного товара
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.article !== undefined) updateData.article = data.article;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.composition !== undefined) updateData.composition = data.composition;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.oldPrice !== undefined) updateData.oldPrice = data.oldPrice;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
    if (data.inStock !== undefined) updateData.inStock = data.inStock;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    const product = await prisma.product.update({ where: { id }, data: updateData });
    return NextResponse.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
