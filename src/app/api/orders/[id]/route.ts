// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderEmails } from '@/lib/mailer';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { auditUpdateData } from '@/lib/admin-audit-route';
import { isUnpaidOrderStatus } from '@/lib/order-status';
import { releaseOrderStock } from '@/lib/shop-stock';

const RELEASE_STOCK_STATUSES = ['cancelled', 'unpaid'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();
    const admin = await requireAdminSection('shop');
    if (admin instanceof NextResponse) return admin;

    const oldOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderitem: { include: { product: true } } },
    });

    if (!oldOrder) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.trackingCode !== undefined) updateData.trackingCode = data.trackingCode;
    Object.assign(updateData, await auditUpdateData());

    if (
      data.status &&
      RELEASE_STOCK_STATUSES.includes(data.status) &&
      oldOrder.stockReserved &&
      isUnpaidOrderStatus(oldOrder.status)
    ) {
      await releaseOrderStock(oldOrder.id);
      updateData.stockReserved = false;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { orderitem: { include: { product: true } } },
    });

    if (data.status && data.status !== oldOrder.status) {
      await sendOrderEmails(updatedOrder, data.status);
    }

    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdminSection('shop');
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (order.stockReserved) {
      await releaseOrderStock(order.id);
    }

    await prisma.$transaction([
      prisma.orderitem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
