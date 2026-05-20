// src/app/api/products/[id]/route.ts - API конкретного товара
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditUpdateData } from '@/lib/admin-audit-route';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productsize: { orderBy: [{ sortOrder: 'asc' }, { size: 'asc' }] },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.oldPrice !== undefined)
      updateData.oldPrice = data.oldPrice ? Number(data.oldPrice) : null;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.manufacturerId !== undefined) {
      updateData.manufacturerId =
        data.manufacturerId && String(data.manufacturerId).trim()
          ? String(data.manufacturerId).trim()
          : null;
    }
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.inStock !== undefined) updateData.inStock = data.inStock;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isHit !== undefined) updateData.isHit = data.isHit;
    if (data.hasCustomization !== undefined) updateData.hasCustomization = data.hasCustomization;
    if (data.useSizes !== undefined) updateData.useSizes = data.useSizes;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.resetSold === true) updateData.totalSold = 0;

    const product = await prisma.product.update({
      where: { id },
      data: { ...updateData, ...(await auditUpdateData()) },
    });

    if (data.sizes !== undefined) {
      await prisma.productSize.deleteMany({ where: { productId: id } });
      if (Array.isArray(data.sizes) && data.sizes.length > 0) {
        for (let i = 0; i < data.sizes.length; i++) {
          const sizeItem = data.sizes[i] as { size: string; quantity: number };
          await prisma.productSize.create({
            data: {
              productId: id,
              size: sizeItem.size,
              quantity: sizeItem.quantity,
              sortOrder: i,
            },
          });
        }
      }
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    const orderItems = await prisma.orderitem.count({ where: { productId: id } });
    if (orderItems > 0) {
      return NextResponse.json(
        {
          error: `Нельзя удалить «${product.name}»: товар есть в ${orderItems} позициях заказов. Снимите с продажи (нет в наличии) или оставьте в каталоге для истории.`,
        },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.productSize.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
